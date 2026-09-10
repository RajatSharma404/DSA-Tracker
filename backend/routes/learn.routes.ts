import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { attachOptionalAuth, requireAuth } from "../middlewares/auth";
import {
  FALLBACK_LEARN_TRACKS,
  getFallbackLearnLesson,
  normalizeLearningObjectives,
  appendDetailedTheoryBlock,
} from "../data/fallbackLearnTracks";
import {
  ensureTheorySchemaExists,
  seedStarterTheoryContent,
} from "../services/theoryService";

const router = Router();

router.get(
  "/learn/tracks",
  attachOptionalAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id ?? null;

      let tracks = await prisma.$queryRaw<
        Array<{
          id: string;
          slug: string;
          title: string;
          description: string | null;
          orderIndex: number;
        }>
      >`
      SELECT
        id,
        slug,
        title,
        description,
        "orderIndex"
      FROM theory_tracks
      WHERE "isPublished" = true
      ORDER BY "orderIndex" ASC, "createdAt" ASC
    `;

      if (tracks.length === 0) {
        try {
          await seedStarterTheoryContent();
          tracks = await prisma.$queryRaw<
            Array<{
              id: string;
              slug: string;
              title: string;
              description: string | null;
              orderIndex: number;
            }>
          >`
          SELECT
            id,
            slug,
            title,
            description,
            "orderIndex"
          FROM theory_tracks
          WHERE "isPublished" = true
          ORDER BY "orderIndex" ASC, "createdAt" ASC
        `;
        } catch (seedError) {
          console.error("Auto-seed learn tracks failed:", seedError);
        }

        if (tracks.length === 0) {
          return res.json(FALLBACK_LEARN_TRACKS);
        }
      }

      const trackIds = tracks.map((t) => t.id);
      const modules = await prisma.$queryRaw<
        Array<{
          id: string;
          trackId: string;
          slug: string;
          title: string;
          summary: string | null;
          orderIndex: number;
          estimatedMinutes: number;
        }>
      >(
        Prisma.sql`
      SELECT
        id,
        "trackId",
        slug,
        title,
        summary,
        "orderIndex",
        "estimatedMinutes"
      FROM theory_modules
      WHERE "isPublished" = true
        AND "trackId" IN (${Prisma.join(trackIds)})
      ORDER BY "orderIndex" ASC, "createdAt" ASC
    `,
      );

      const moduleIds = modules.map((m) => m.id);
      const lessons =
        moduleIds.length > 0
          ? await prisma.$queryRaw<
              Array<{
                id: string;
                moduleId: string;
                slug: string;
                title: string;
                summary: string | null;
                orderIndex: number;
                estimatedMinutes: number;
                difficulty: string;
              }>
            >(
              Prisma.sql`
          SELECT
            id,
            "moduleId",
            slug,
            title,
            summary,
            "orderIndex",
            "estimatedMinutes",
            difficulty::text AS difficulty
          FROM theory_lessons
          WHERE "isPublished" = true
            AND "moduleId" IN (${Prisma.join(moduleIds)})
          ORDER BY "orderIndex" ASC, "createdAt" ASC
        `,
            )
          : [];

      const lessonIds = lessons.map((l) => l.id);
      const progressRows =
        userId && lessonIds.length > 0
          ? await prisma.$queryRaw<
              Array<{
                lessonId: string;
                status: string;
                progressPercent: number;
              }>
            >(
              Prisma.sql`
          SELECT
            "lessonId",
            status::text AS status,
            "progressPercent"
          FROM user_theory_lesson_progress
          WHERE "userId" = ${userId}
            AND "lessonId" IN (${Prisma.join(lessonIds)})
        `,
            )
          : [];

      const progressByLesson = new Map(
        progressRows.map((p) => [p.lessonId, p]),
      );

      const lessonsByModule = new Map<string, any[]>();
      for (const lesson of lessons) {
        const progress =
          progressByLesson.get(lesson.id) ||
          ({ status: "NOT_STARTED", progressPercent: 0 } as const);
        if (!lessonsByModule.has(lesson.moduleId)) {
          lessonsByModule.set(lesson.moduleId, []);
        }
        lessonsByModule.get(lesson.moduleId)!.push({
          ...lesson,
          status: progress.status,
          progressPercent: progress.progressPercent,
        });
      }

      const modulesByTrack = new Map<string, any[]>();
      for (const module of modules) {
        const moduleLessons = lessonsByModule.get(module.id) || [];
        const completed = moduleLessons.filter(
          (l) => l.status === "COMPLETED",
        ).length;
        const progressPercent =
          moduleLessons.length > 0
            ? Math.round((completed / moduleLessons.length) * 100)
            : 0;

        if (!modulesByTrack.has(module.trackId)) {
          modulesByTrack.set(module.trackId, []);
        }

        modulesByTrack.get(module.trackId)!.push({
          ...module,
          totalLessons: moduleLessons.length,
          completedLessons: completed,
          progressPercent,
          lessons: moduleLessons,
        });
      }

      const payload = tracks.map((track) => {
        const trackModules = modulesByTrack.get(track.id) || [];
        const totalLessons = trackModules.reduce(
          (sum, module) => sum + module.totalLessons,
          0,
        );
        const completedLessons = trackModules.reduce(
          (sum, module) => sum + module.completedLessons,
          0,
        );
        return {
          ...track,
          totalLessons,
          completedLessons,
          progressPercent:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
          modules: trackModules,
        };
      });

      res.json(payload);
    } catch (error) {
      console.error("Learn tracks error:", error);
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes('relation "theory_tracks" does not exist') ||
        message.includes("42P01")
      ) {
        try {
          await ensureTheorySchemaExists();
          await seedStarterTheoryContent();
          const tracksAfterBootstrap = await prisma.$queryRaw<
            Array<{
              id: string;
              slug: string;
              title: string;
              description: string | null;
              orderIndex: number;
            }>
          >`
            SELECT
              id,
              slug,
              title,
              description,
              order_index AS "orderIndex"
            FROM theory_tracks
            WHERE is_published = true
            ORDER BY order_index ASC, created_at ASC
          `;
          return res.json(
            tracksAfterBootstrap.length > 0
              ? tracksAfterBootstrap.map((track) => ({
                  ...track,
                  totalLessons: 0,
                  completedLessons: 0,
                  progressPercent: 0,
                  modules: [],
                }))
              : [],
          );
        } catch (bootstrapError) {
          console.error("Learn bootstrap error:", bootstrapError);
          return res.json(FALLBACK_LEARN_TRACKS);
        }
      }
      if (
        message.toLowerCase().includes("permission denied") ||
        message.toLowerCase().includes("must be owner")
      ) {
        return res.json(FALLBACK_LEARN_TRACKS);
      }
      res.status(500).json({
        error: "Failed to load learn tracks",
        hint: "Ensure theory migration has been applied.",
      });
    }
  },
);

router.get(
  "/learn/tracks/:trackSlug/modules/:moduleSlug/lessons/:lessonSlug",
  attachOptionalAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id ?? null;
      const trackSlug = String(req.params.trackSlug);
      const moduleSlug = String(req.params.moduleSlug);
      const lessonSlug = String(req.params.lessonSlug);

      const lessons = await prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          summary: string | null;
          difficulty: string;
          estimatedMinutes: number;
          learningObjectives: any;
          moduleId: string;
          moduleTitle: string;
          moduleSlug: string;
          trackTitle: string;
          trackSlug: string;
        }>
      >`
        SELECT
          l.id,
          l.title,
          l.summary,
          l.difficulty::text AS difficulty,
          l."estimatedMinutes",
          l."learningObjectives",
          m.id AS "moduleId",
          m.title AS "moduleTitle",
          m.slug AS "moduleSlug",
          t.title AS "trackTitle",
          t.slug AS "trackSlug"
        FROM theory_lessons l
        INNER JOIN theory_modules m ON m.id = l."moduleId"
        INNER JOIN theory_tracks t ON t.id = m."trackId"
        WHERE t.slug = ${trackSlug}
          AND m.slug = ${moduleSlug}
          AND l.slug = ${lessonSlug}
          AND t."isPublished" = true
          AND m."isPublished" = true
          AND l."isPublished" = true
        LIMIT 1
      `;

      const lesson = lessons[0];
      if (!lesson) {
        const fallbackLesson = getFallbackLearnLesson(
          trackSlug,
          moduleSlug,
          lessonSlug,
        );
        if (fallbackLesson) {
          return res.json(fallbackLesson);
        }
        return res.status(404).json({ error: "Lesson not found" });
      }

      const blocks = await prisma.$queryRaw<
        Array<{
          id: string;
          blockType: string;
          orderIndex: number;
          content: any;
          language: string | null;
        }>
      >`
        SELECT
          id,
          "blockType"::text AS "blockType",
          "orderIndex",
          content,
          language
        FROM theory_lesson_blocks
        WHERE "lessonId" = ${lesson.id}
        ORDER BY "orderIndex" ASC
      `;

      const normalizedObjectives = normalizeLearningObjectives(
        lesson.learningObjectives,
      );

      const enrichedBlocks = appendDetailedTheoryBlock({
        blocks,
        lessonId: lesson.id,
        trackTitle: lesson.trackTitle,
        moduleTitle: lesson.moduleTitle,
        lessonTitle: lesson.title,
        lessonSummary: lesson.summary,
        learningObjectives: normalizedObjectives,
      });

      const progressRows = userId
        ? await prisma.$queryRaw<
            Array<{
              status: string;
              progressPercent: number;
              timeSpentSeconds: number;
              completedAt: Date | null;
            }>
          >`
        SELECT
          status::text AS status,
          "progressPercent",
          "timeSpentSeconds",
          "completedAt"
        FROM user_theory_lesson_progress
        WHERE "userId" = ${userId}
          AND "lessonId" = ${lesson.id}
      `
        : [];

      const progress =
        progressRows[0] ||
        ({
          status: "NOT_STARTED",
          progressPercent: 0,
          timeSpentSeconds: 0,
          completedAt: null,
        } as const);

      const siblingLessons = await prisma.$queryRaw<
        Array<{ id: string; slug: string; title: string; orderIndex: number }>
      >`
        SELECT id, slug, title, "orderIndex"
        FROM theory_lessons
        WHERE "moduleId" = ${lesson.moduleId}
          AND "isPublished" = true
        ORDER BY "orderIndex" ASC, "createdAt" ASC
      `;

      const siblingProgressRows = userId
        ? await prisma.$queryRaw<Array<{ lessonId: string; status: string }>>`
        SELECT
          "lessonId",
          status::text AS status
        FROM user_theory_lesson_progress
        WHERE "userId" = ${userId}
          AND "lessonId" IN (
            SELECT id FROM theory_lessons WHERE "moduleId" = ${lesson.moduleId}
          )
      `
        : [];
      const siblingProgress = new Map(
        siblingProgressRows.map((row) => [row.lessonId, row.status]),
      );

      const problems = await prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          difficulty: string;
          link: string | null;
          topicName: string | null;
          required: boolean;
          orderIndex: number;
          solved: boolean;
        }>
      >`
        SELECT
          p.id,
          p.title,
          p.difficulty::text AS difficulty,
          p.link,
          t.name AS "topicName",
          tpl.required,
          tpl."orderIndex",
          CASE WHEN pr.status = 'DONE' THEN true ELSE false END AS solved
        FROM theory_problem_links tpl
          INNER JOIN "Problem" p ON p.id = tpl."problemId"
        LEFT JOIN "Topic" t ON t.id = p."topicId"
        LEFT JOIN "Progress" pr ON pr."problemId" = p.id AND pr."userId" = ${userId}
          WHERE tpl."lessonId" = ${lesson.id}
            OR (tpl."lessonId" IS NULL AND tpl."moduleId" = ${lesson.moduleId})
          ORDER BY tpl."orderIndex" ASC
      `;

      const isUnlocked = progress.status === "COMPLETED";

      res.json({
        lesson: {
          id: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          difficulty: lesson.difficulty,
          estimatedMinutes: lesson.estimatedMinutes,
          learningObjectives: normalizedObjectives,
          module: {
            id: lesson.moduleId,
            title: lesson.moduleTitle,
            slug: lesson.moduleSlug,
          },
          track: {
            title: lesson.trackTitle,
            slug: lesson.trackSlug,
          },
        },
        blocks: enrichedBlocks,
        progress,
        isUnlocked,
        siblings: siblingLessons.map((s) => ({
          ...s,
          status: siblingProgress.get(s.id) || "NOT_STARTED",
        })),
        problems: problems.map((problem) => ({
          ...problem,
          unlocked: isUnlocked,
        })),
      });
    } catch (error) {
      console.error("Learn lesson detail error:", error);
      const fallbackLesson = getFallbackLearnLesson(
        String(req.params.trackSlug),
        String(req.params.moduleSlug),
        String(req.params.lessonSlug),
      );
      if (fallbackLesson) {
        return res.json(fallbackLesson);
      }
      res.status(500).json({ error: "Failed to load lesson" });
    }
  },
);

router.post(
  "/learn/lessons/:lessonId/progress",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.lessonId as string;
      const rawStatus = String(req.body.status || "IN_PROGRESS");
      const allowed = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
      if (!allowed.includes(rawStatus)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const requestedPercent = Number(req.body.progressPercent ?? 0);
      const progressPercent = Math.max(
        0,
        Math.min(100, rawStatus === "COMPLETED" ? 100 : requestedPercent),
      );
      const timeSpentSeconds = Math.max(
        0,
        Number(req.body.timeSpentSeconds ?? 0),
      );
      const lastSeenBlockId = req.body.lastSeenBlockId
        ? String(req.body.lastSeenBlockId)
        : null;
      const completedAt = rawStatus === "COMPLETED" ? new Date() : null;

      const lessonExists = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM theory_lessons
        WHERE id = ${lessonId}
        LIMIT 1
      `;

      if (lessonExists.length === 0) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const rows = await prisma.$queryRaw<
        Array<{
          status: string;
          progressPercent: number;
          timeSpentSeconds: number;
          completedAt: Date | null;
          updatedAt: Date;
        }>
      >`
        INSERT INTO user_theory_lesson_progress (
          user_id,
          lesson_id,
          status,
          progress_percent,
          time_spent_seconds,
          completed_at,
          last_seen_block_id,
          created_at,
          updated_at
        )
        VALUES (
          ${userId},
          ${lessonId},
          ${rawStatus}::"TheoryProgressStatus",
          ${progressPercent},
          ${timeSpentSeconds},
          ${completedAt},
          ${lastSeenBlockId},
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
          status = EXCLUDED.status,
          progress_percent = EXCLUDED.progress_percent,
          time_spent_seconds = EXCLUDED.time_spent_seconds,
          completed_at = EXCLUDED.completed_at,
          last_seen_block_id = EXCLUDED.last_seen_block_id,
          updated_at = NOW()
        RETURNING
          status::text AS status,
          progress_percent AS "progressPercent",
          time_spent_seconds AS "timeSpentSeconds",
          completed_at AS "completedAt",
          updated_at AS "updatedAt"
      `;

      res.json(rows[0]);
    } catch (error) {
      console.error("Update theory progress error:", error);
      res.status(500).json({ error: "Failed to update lesson progress" });
    }
  },
);

export default router;
