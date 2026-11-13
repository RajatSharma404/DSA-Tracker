/**
 * Memory retention model for solved problems.
 *
 * Uses the FSRS power forgetting curve  R(t, S) = (1 + t / (9·S))^-1,
 * where S ("stability") is the number of days until recall drops to 90%.
 * When the FSRS scheduler has reviewed a problem, its real `stability` and
 * `lastReviewedAt` are used. Otherwise stability is estimated from the SM-2
 * interval/ease and problem difficulty.
 */

export const AT_RISK_THRESHOLD = 0.7;
const DAY_MS = 86_400_000;

export interface RetentionInput {
  problemId: string;
  title: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  completedAt: Date | null;
  nextReviewDate: Date | null;
  interval: number;
  easinessFactor: number;
  /** FSRS stability (days) when the problem has been through the scheduler */
  stability?: number | null;
  lastReviewedAt?: Date | null;
}

export interface RetentionItem {
  problemId: string;
  title: string;
  topic: string;
  difficulty: RetentionInput["difficulty"];
  recall: number;
  stabilityDays: number;
  daysSinceReview: number;
  /** Days from now until recall falls below the at-risk threshold (0 = already) */
  daysUntilAtRisk: number;
}

export interface RetentionReport {
  generatedAt: string;
  threshold: number;
  averageRecall: number;
  atRiskNow: number;
  total: number;
  forecast: Array<{ day: number; averageRecall: number; atRisk: number }>;
  topics: Array<{ topic: string; averageRecall: number; count: number; atRisk: number }>;
  items: RetentionItem[];
}

const DIFFICULTY_BASE: Record<RetentionInput["difficulty"], number> = {
  EASY: 3,
  MEDIUM: 2,
  HARD: 1.25,
};

export const recallAt = (days: number, stability: number) =>
  1 / (1 + Math.max(0, days) / (9 * Math.max(0.1, stability)));

/** Days until recall reaches `threshold` given stability S (inverse of recallAt). */
export const daysToThreshold = (stability: number, threshold = AT_RISK_THRESHOLD) =>
  9 * stability * (1 / threshold - 1);

export const estimateStability = (
  input: Pick<RetentionInput, "interval" | "easinessFactor" | "difficulty" | "stability">,
) => {
  if (typeof input.stability === "number" && Number.isFinite(input.stability) && input.stability > 0) {
    return input.stability;
  }
  const ease = Number.isFinite(input.easinessFactor) && input.easinessFactor > 0 ? input.easinessFactor : 2.5;
  const easeFactor = Math.min(1.4, Math.max(0.55, ease / 2.5));
  if (input.interval > 0) {
    // A scheduled SM-2 interval is roughly when recall is still ~90%.
    return Math.max(1, input.interval * easeFactor);
  }
  return DIFFICULTY_BASE[input.difficulty] * easeFactor;
};

const lastReviewedAt = (input: RetentionInput): Date | null => {
  if (input.lastReviewedAt) return input.lastReviewedAt;
  if (input.nextReviewDate && input.interval > 0) {
    return new Date(input.nextReviewDate.getTime() - input.interval * DAY_MS);
  }
  return input.completedAt;
};

const round = (n: number, digits = 3) => Math.round(n * 10 ** digits) / 10 ** digits;

export function buildRetentionReport(
  inputs: RetentionInput[],
  now: Date = new Date(),
  horizonDays = 30,
): RetentionReport {
  const items: RetentionItem[] = [];
  for (const input of inputs) {
    const reviewed = lastReviewedAt(input);
    if (!reviewed || Number.isNaN(reviewed.getTime())) continue;
    const stability = estimateStability(input);
    const daysSince = Math.max(0, (now.getTime() - reviewed.getTime()) / DAY_MS);
    const recall = recallAt(daysSince, stability);
    items.push({
      problemId: input.problemId,
      title: input.title,
      topic: input.topic,
      difficulty: input.difficulty,
      recall: round(recall),
      stabilityDays: round(stability, 1),
      daysSinceReview: round(daysSince, 1),
      daysUntilAtRisk: round(Math.max(0, daysToThreshold(stability) - daysSince), 1),
    });
  }

  items.sort((a, b) => a.recall - b.recall);

  const forecast = Array.from({ length: horizonDays + 1 }, (_, day) => {
    let sum = 0;
    let atRisk = 0;
    for (const item of items) {
      const r = recallAt(item.daysSinceReview + day, item.stabilityDays);
      sum += r;
      if (r < AT_RISK_THRESHOLD) atRisk += 1;
    }
    return { day, averageRecall: items.length ? round(sum / items.length) : 0, atRisk };
  });

  const byTopic = new Map<string, { sum: number; count: number; atRisk: number }>();
  for (const item of items) {
    const t = byTopic.get(item.topic) || { sum: 0, count: 0, atRisk: 0 };
    t.sum += item.recall;
    t.count += 1;
    if (item.recall < AT_RISK_THRESHOLD) t.atRisk += 1;
    byTopic.set(item.topic, t);
  }

  return {
    generatedAt: now.toISOString(),
    threshold: AT_RISK_THRESHOLD,
    averageRecall: forecast[0]?.averageRecall ?? 0,
    atRiskNow: forecast[0]?.atRisk ?? 0,
    total: items.length,
    forecast,
    topics: [...byTopic.entries()]
      .map(([topic, t]) => ({ topic, averageRecall: round(t.sum / t.count), count: t.count, atRisk: t.atRisk }))
      .sort((a, b) => a.averageRecall - b.averageRecall),
    items,
  };
}
