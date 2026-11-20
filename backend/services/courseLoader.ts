import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "../db/prisma";

/**
 * Learn courses written as Markdown files in backend/data/courses/*.md.
 * Each file is one track; each "# " heading is a module with one lesson.
 * See backend/data/courses/README.md for the format.
 */

type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CourseBlock =
  | { type: "MARKDOWN" | "NOTE"; markdown: string }
  | { type: "CODE"; language: string; title?: string; code: string }
  | { type: "QUIZ"; question: string; options: string[]; correctAnswerIndex: number; explanation: string };

export interface CourseModule {
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  minutes: number;
  objectives: string[];
  blocks: CourseBlock[];
  problems: string[]; // LeetCode slugs
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  order: number;
  modules: CourseModule[];
}

const DIFFICULTIES = new Set(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

function fail(file: string, msg: string): never {
  throw new Error(`Course ${file}: ${msg}`);
}

/** Parses one course file. Throws with a clear message on malformed input. */
export function parseCourse(text: string, file = "course"): Course {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  // Front matter
  if (lines[i]?.trim() !== "---") fail(file, "must start with a --- front matter block");
  const meta: Record<string, string> = {};
  for (i = 1; i < lines.length && lines[i].trim() !== "---"; i++) {
    const m = lines[i].match(/^(\w+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  i++;
  if (!meta.slug || !meta.title) fail(file, "front matter needs slug and title");

  const course: Course = {
    slug: meta.slug,
    title: meta.title,
    description: meta.description ?? "",
    order: Number(meta.order) || 0,
    modules: [],
  };

  let mod: CourseModule | null = null;
  for (; i < lines.length; i++) {
    const line = lines[i];
    const heading = line.match(/^# (.+)$/);
    if (heading) {
      const [slug, title, summary] = heading[1].split("|").map((s) => s.trim());
      if (!slug || !title) fail(file, `module heading needs "slug | title | summary": ${line}`);
      mod = { slug, title, summary: summary ?? "", difficulty: "ADVANCED", minutes: 30, objectives: [], blocks: [], problems: [] };
      course.modules.push(mod);
      continue;
    }
    if (!mod) continue;

    const field = line.match(/^(difficulty|minutes|objective):\s*(.+)$/);
    if (field) {
      const [, key, value] = field;
      if (key === "difficulty") {
        if (!DIFFICULTIES.has(value)) fail(file, `unknown difficulty ${value}`);
        mod.difficulty = value as Difficulty;
      } else if (key === "minutes") mod.minutes = Number(value) || mod.minutes;
      else mod.objectives.push(value);
      continue;
    }

    const open = line.match(/^::: (\w+)\s*(.*)$/);
    if (!open) continue;
    const [, kind, rest] = open;
    const body: string[] = [];
    for (i++; i < lines.length && lines[i] !== ":::"; i++) body.push(lines[i]);
    if (i >= lines.length) fail(file, `unclosed ::: ${kind} in module ${mod.slug}`);
    const content = body.join("\n").trim();

    if (kind === "markdown" || kind === "note") {
      mod.blocks.push({ type: kind === "note" ? "NOTE" : "MARKDOWN", markdown: content });
    } else if (kind === "code") {
      const [language, title] = rest.split("|").map((s) => s.trim());
      mod.blocks.push({ type: "CODE", language: language || "cpp", title: title || undefined, code: content });
    } else if (kind === "quiz") {
      let question = "";
      let explanation = "";
      const options: string[] = [];
      let correct = -1;
      for (const l of body) {
        const q = l.match(/^question:\s*(.+)$/);
        const e = l.match(/^explanation:\s*(.+)$/);
        const o = l.match(/^- (.+?)(\s+\*)?$/);
        if (q) question = q[1];
        else if (e) explanation = e[1];
        else if (o) {
          if (o[2]) correct = options.length;
          options.push(o[1]);
        }
      }
      if (!question || options.length < 2 || correct < 0) {
        fail(file, `quiz in ${mod.slug} needs a question, 2+ options and one marked with " *"`);
      }
      mod.blocks.push({ type: "QUIZ", question, options, correctAnswerIndex: correct, explanation });
    } else if (kind === "problems") {
      mod.problems.push(...body.map((s) => s.trim()).filter(Boolean));
    } else {
      fail(file, `unknown block ::: ${kind}`);
    }
  }

  if (!course.modules.length) fail(file, "has no modules");
  const slugs = new Set<string>();
  for (const m of course.modules) {
    if (slugs.has(m.slug)) fail(file, `duplicate module slug ${m.slug}`);
    slugs.add(m.slug);
  }
  return course;
}

function coursesDir(): string | null {
  const candidates = [path.join(__dirname, "../data/courses"), path.join(__dirname, "../../data/courses")];
  return candidates.find((d) => existsSync(d)) ?? null;
}

export function loadCourses(): Course[] {
  const dir = coursesDir();
  if (!dir) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort()
    .map((f) => parseCourse(readFileSync(path.join(dir, f), "utf8"), f));
}

const titleCase = (slug: string) => slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

/** Writes one course to the database. Only call when its track does not exist yet. */
export async function installCourse(course: Course): Promise<void> {
  const knownProblems = await prisma.problem.findMany({
    where: { OR: course.modules.flatMap((m) => m.problems).map((s) => ({ link: { contains: `/problems/${s}/` } })) },
    select: { id: true, link: true },
  });
  const problemIdBySlug = new Map<string, string>();
  for (const p of knownProblems) {
    const slug = p.link?.match(/\/problems\/([^/]+)\//)?.[1];
    if (slug && !problemIdBySlug.has(slug)) problemIdBySlug.set(slug, p.id);
  }

  await prisma.$transaction(
    async (tx) => {
      const track = await tx.theoryTrack.create({
        data: { slug: course.slug, title: course.title, description: course.description, orderIndex: course.order },
      });
      for (const [mi, m] of course.modules.entries()) {
        const mod = await tx.theoryModule.create({
          data: { trackId: track.id, slug: m.slug, title: m.title, summary: m.summary, orderIndex: mi + 1, estimatedMinutes: m.minutes },
        });
        const lesson = await tx.theoryLesson.create({
          data: {
            moduleId: mod.id,
            slug: m.slug,
            title: m.title,
            summary: m.summary,
            orderIndex: 1,
            difficulty: m.difficulty,
            estimatedMinutes: m.minutes,
            learningObjectives: { objectives: m.objectives },
          },
        });

        const blocks: CourseBlock[] = [...m.blocks];
        if (m.problems.length) {
          blocks.push({
            type: "MARKDOWN",
            markdown:
              "## Practice\n\n" +
              m.problems.map((s) => `- [${titleCase(s)}](https://leetcode.com/problems/${s}/)`).join("\n"),
          });
        }
        await tx.theoryLessonBlock.createMany({
          data: blocks.map((b, bi) => ({
            lessonId: lesson.id,
            orderIndex: bi + 1,
            blockType: b.type,
            language: b.type === "CODE" ? b.language : null,
            content:
              b.type === "CODE"
                ? { title: b.title, code: b.code }
                : b.type === "QUIZ"
                  ? { question: b.question, options: b.options, correctAnswerIndex: b.correctAnswerIndex, explanation: b.explanation }
                  : { markdown: b.markdown },
          })),
        });

        const linked = m.problems.map((s) => problemIdBySlug.get(s)).filter((id): id is string => Boolean(id));
        if (linked.length) {
          await tx.theoryProblemLink.createMany({
            data: linked.map((problemId, pi) => ({ lessonId: lesson.id, problemId, orderIndex: pi + 1, required: false })),
          });
        }
      }
    },
    { timeout: 60_000 },
  );
}
