import { prisma } from "../db/prisma";

/**
 * Shared LeetCode → tracker import logic.
 *
 * Used by:
 *  - POST /api/extension/sync          (single accepted submission from the extension)
 *  - POST /api/user/leetcode/import    (full snapshot read by the extension in the user's browser)
 *
 * Matching is done on the exact LeetCode slug first, then on the normalized
 * title. (The old extension route used `link contains slug`, which matched
 * "two-sum" to "two-sum-ii-input-array-is-sorted".)
 */

export const EXTRA_PRACTICE_TOPIC = "Extra Practice (Auto-Synced)";
export const SLUG_RE = /^[a-z0-9-]{1,120}$/;
const MAX_CODE_LENGTH = 100_000;

export type ImportDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ImportEntry {
  titleSlug: string;
  title?: string | null;
  difficulty?: string | null;
  /** Unix seconds of the (first known) accepted submission */
  timestamp?: number | null;
  runtime?: string | null;
  memory?: string | null;
}

export interface ImportResult {
  matched: number;
  created: number;
  updated: number;
  unchanged: number;
  problems: Array<{ id: string; title: string; slug: string; isNew: boolean }>;
}

export const normalizeDifficulty = (value: unknown): ImportDifficulty => {
  const v = String(value || "").trim().toUpperCase();
  return v === "EASY" || v === "HARD" ? v : "MEDIUM";
};

export const slugFromLink = (link?: string | null): string | null => {
  if (!link) return null;
  const match = link.match(/problems\/([^/?#]+)/i);
  return match ? match[1].trim().toLowerCase() : null;
};

const titleFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const toDate = (ts?: number | null): Date | null =>
  typeof ts === "number" && Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000) : null;

/** Validates and de-duplicates untrusted entries (keeps the earliest timestamp). */
export const sanitizeEntries = (raw: unknown, max = 5000): ImportEntry[] => {
  if (!Array.isArray(raw)) return [];
  const bySlug = new Map<string, ImportEntry>();
  for (const item of raw.slice(0, max)) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const slug = String(r.titleSlug ?? r.slug ?? "").trim().toLowerCase();
    if (!SLUG_RE.test(slug)) continue;
    const ts = Number(r.timestamp);
    const entry: ImportEntry = {
      titleSlug: slug,
      title: typeof r.title === "string" ? r.title.slice(0, 200) : null,
      difficulty: typeof r.difficulty === "string" ? r.difficulty : null,
      timestamp: Number.isFinite(ts) && ts > 0 ? ts : null,
      runtime: typeof r.runtime === "string" ? r.runtime.slice(0, 40) : null,
      memory: typeof r.memory === "string" ? r.memory.slice(0, 40) : null,
    };
    const prev = bySlug.get(slug);
    if (!prev) {
      bySlug.set(slug, entry);
      continue;
    }
    bySlug.set(slug, {
      ...prev,
      title: prev.title || entry.title,
      difficulty: prev.difficulty || entry.difficulty,
      runtime: prev.runtime || entry.runtime,
      memory: prev.memory || entry.memory,
      timestamp:
        prev.timestamp && entry.timestamp
          ? Math.min(prev.timestamp, entry.timestamp)
          : prev.timestamp || entry.timestamp,
    });
  }
  return [...bySlug.values()];
};

export const sanitizeCode = (code: unknown): string | null =>
  typeof code === "string" && code.trim() ? code.slice(0, MAX_CODE_LENGTH) : null;

/**
 * Upserts DONE progress for every entry, creating "Extra Practice" problems
 * for slugs outside the curriculum. Uses bulk preloads (2 queries) instead of
 * per-entry lookups.
 */
export async function importSolvedProblems(
  userId: string,
  entries: ImportEntry[],
): Promise<ImportResult> {
  const result: ImportResult = { matched: 0, created: 0, updated: 0, unchanged: 0, problems: [] };
  if (entries.length === 0) return result;

  const [allProblems, progressRows] = await Promise.all([
    prisma.problem.findMany({ select: { id: true, title: true, link: true, topicId: true } }),
    prisma.progress.findMany({
      where: { userId },
      select: {
        problemId: true,
        status: true,
        completedAt: true,
        leetcodeRuntime: true,
        leetcodeMemory: true,
      },
    }),
  ]);

  const bySlug = new Map<string, { id: string; title: string }>();
  const byTitle = new Map<string, { id: string; title: string }>();
  for (const p of allProblems) {
    const slug = slugFromLink(p.link);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, p);
    byTitle.set(p.title.trim().toLowerCase(), p);
  }
  const progressByProblem = new Map(progressRows.map((r) => [r.problemId, r]));

  let miscTopicId: string | null = null;
  let nextMiscOrder = 0;
  const ensureMiscTopic = async () => {
    if (miscTopicId) return miscTopicId;
    let topic = await prisma.topic.findFirst({ where: { name: EXTRA_PRACTICE_TOPIC } });
    if (!topic) {
      const maxOrderTopic = await prisma.topic.findFirst({ orderBy: { orderIndex: "desc" } });
      topic = await prisma.topic.create({
        data: {
          name: EXTRA_PRACTICE_TOPIC,
          description:
            "Problems solved on LeetCode that are not part of the standard curriculum.",
          orderIndex: (maxOrderTopic?.orderIndex ?? 99) + 1,
        },
      });
    }
    const maxOrderProblem = await prisma.problem.findFirst({
      where: { topicId: topic.id },
      orderBy: { orderIndex: "desc" },
    });
    nextMiscOrder = (maxOrderProblem?.orderIndex ?? 0) + 1;
    miscTopicId = topic.id;
    return topic.id;
  };

  for (const entry of entries) {
    const slug = entry.titleSlug;
    let problem =
      bySlug.get(slug) ||
      (entry.title ? byTitle.get(entry.title.trim().toLowerCase()) : undefined);
    let isNew = false;

    if (!problem) {
      const topicId = await ensureMiscTopic();
      const created = await prisma.problem.create({
        data: {
          title: entry.title || titleFromSlug(slug),
          link: `https://leetcode.com/problems/${slug}/`,
          difficulty: normalizeDifficulty(entry.difficulty),
          topicId,
          orderIndex: nextMiscOrder++,
        },
      });
      problem = { id: created.id, title: created.title };
      bySlug.set(slug, problem);
      byTitle.set(problem.title.trim().toLowerCase(), problem);
      result.created += 1;
      isNew = true;
    } else {
      result.matched += 1;
    }

    const existing = progressByProblem.get(problem.id);
    const solvedAt = toDate(entry.timestamp);
    const needsUpdate =
      !existing ||
      existing.status !== "DONE" ||
      (!existing.leetcodeRuntime && entry.runtime) ||
      (!existing.leetcodeMemory && entry.memory) ||
      (!existing.completedAt && solvedAt);

    if (!needsUpdate) {
      result.unchanged += 1;
      result.problems.push({ id: problem.id, title: problem.title, slug, isNew });
      continue;
    }

    // Keep the earliest known completion date; never move it forward.
    const completedAt =
      existing?.completedAt && solvedAt
        ? existing.completedAt < solvedAt
          ? existing.completedAt
          : solvedAt
        : existing?.completedAt || solvedAt || new Date();

    await prisma.progress.upsert({
      where: { userId_problemId: { userId, problemId: problem.id } },
      update: {
        status: "DONE",
        completedAt,
        ...(entry.runtime ? { leetcodeRuntime: entry.runtime } : {}),
        ...(entry.memory ? { leetcodeMemory: entry.memory } : {}),
      },
      create: {
        userId,
        problemId: problem.id,
        status: "DONE",
        timeSpent: 0,
        completedAt,
        leetcodeRuntime: entry.runtime ?? null,
        leetcodeMemory: entry.memory ?? null,
      },
    });
    result.updated += 1;
    result.problems.push({ id: problem.id, title: problem.title, slug, isNew });
  }

  return result;
}
