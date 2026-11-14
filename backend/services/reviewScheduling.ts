import { fsrs, createEmptyCard, Rating, State } from "ts-fsrs";
import { prisma } from "../db/prisma";
import { fromFsrsState, schedule } from "./scheduler";

const DAY_MS = 24 * 60 * 60 * 1000;

/** How many backlog reviews become due per day when old solves are scheduled in bulk. */
export const BACKLOG_PER_DAY = 10;

/** Undated imports (LeetCode only says "solved") are treated as solved this long ago. */
const UNDATED_AGE_DAYS = 90;

/**
 * A solve is a successful first recall, so the card goes straight to the
 * Review state with a day-scale interval (no minute-level learning steps).
 */
const firstSolveFsrs = fsrs({ enable_short_term: false });

export type ScheduleFields = {
  state: ReturnType<typeof fromFsrsState>;
  stability: number;
  difficultyFsrs: number;
  repetitions: number;
  lapses: number;
  interval: number;
  lastReviewedAt: Date;
  nextReviewDate: Date;
};

type ExistingCard = {
  stability: number | null;
  difficultyFsrs: number | null;
  interval: number;
  repetitions: number;
  lapses: number;
  state: Parameters<typeof schedule>[0]["state"];
  nextReviewDate: Date | null;
  lastReviewedAt: Date | null;
  completedAt: Date | null;
} | null;

/** FSRS fields for a problem first solved at `solvedAt`. */
export function scheduleFirstSolve(solvedAt: Date): ScheduleFields {
  const { card } = firstSolveFsrs.next(createEmptyCard(solvedAt), solvedAt, Rating.Good);
  return {
    state: fromFsrsState(card.state === State.New ? State.Review : card.state),
    stability: card.stability,
    difficultyFsrs: card.difficulty,
    repetitions: card.reps,
    lapses: card.lapses,
    interval: Math.max(1, card.scheduled_days),
    lastReviewedAt: solvedAt,
    nextReviewDate: card.due,
  };
}

/**
 * FSRS fields after an accepted solve. A first solve starts a new card; a
 * re-solve of a problem that is already scheduled counts as a "Good" review.
 */
export function scheduleSolve(existing: ExistingCard, solvedAt: Date): ScheduleFields {
  if (!existing?.stability || existing.stability <= 0) return scheduleFirstSolve(solvedAt);
  const { card } = schedule(
    {
      due: existing.nextReviewDate ?? undefined,
      stability: existing.stability,
      difficulty: existing.difficultyFsrs,
      scheduled_days: existing.interval,
      reps: existing.repetitions,
      lapses: existing.lapses,
      state: existing.state,
      last_review: existing.lastReviewedAt ?? existing.completedAt ?? undefined,
    },
    Rating.Good,
    solvedAt,
  );
  return {
    state: fromFsrsState(card.state),
    stability: card.stability,
    difficultyFsrs: card.difficulty,
    repetitions: card.reps,
    lapses: card.lapses,
    interval: Math.max(1, card.scheduled_days),
    lastReviewedAt: solvedAt,
    nextReviewDate: card.due,
  };
}

const startOfDay = (d: Date) => {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
};

/**
 * Pure planner for bulk scheduling. Each solve gets its FSRS schedule from its
 * solve date; solves that would already be overdue are spread out so at most
 * `perDay` of them come due each day, most overdue first.
 */
export function planBacklog(
  rows: Array<{ id: string; solvedAt: Date | null }>,
  now = new Date(),
  perDay = BACKLOG_PER_DAY,
): Array<{ id: string } & ScheduleFields> {
  const undated = new Date(now.getTime() - UNDATED_AGE_DAYS * DAY_MS);
  const planned = rows.map((r) => ({ id: r.id, ...scheduleFirstSolve(r.solvedAt ?? undated) }));

  const overdue = planned
    .filter((p) => p.nextReviewDate.getTime() <= now.getTime())
    .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());

  const today = startOfDay(now);
  overdue.forEach((p, i) => {
    const day = Math.floor(i / perDay);
    p.nextReviewDate = day === 0 ? now : new Date(today.getTime() + day * DAY_MS + 9 * 60 * 60 * 1000);
  });
  return planned;
}

/**
 * Schedules every solved problem of `userId` that has no review date yet.
 * Safe to call repeatedly: it only touches unscheduled rows.
 */
export async function scheduleUnscheduledSolves(userId: string, now = new Date()): Promise<number> {
  const rows = await prisma.progress.findMany({
    where: { userId, status: "DONE", nextReviewDate: null },
    select: { id: true, completedAt: true, lastReviewedAt: true },
  });
  if (!rows.length) return 0;

  const plan = planBacklog(
    rows.map((r) => ({ id: r.id, solvedAt: r.completedAt ?? r.lastReviewedAt })),
    now,
  );
  await prisma.$transaction(
    plan.map(({ id, ...data }) => prisma.progress.update({ where: { id }, data })),
  );
  return plan.length;
}
