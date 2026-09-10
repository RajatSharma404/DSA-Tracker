export type NextActionSignal = {
  name: string;
  avgTimeSpent?: number;
  completionPct?: number;
};

export type NextAction = {
  mode: "REVISION" | "WEAKNESS" | "BUILD_MOMENTUM" | "BALANCED";
  title: string;
  topic: string;
  reason: string;
  cta: string;
  difficulty: string;
  estimatedMinutes: number;
};

export const isProgressStatus = (
  value: unknown,
): value is "TODO" | "DOING" | "DONE" =>
  value === "TODO" || value === "DOING" || value === "DONE";

export const isDifficulty = (
  value: unknown,
): value is "EASY" | "MEDIUM" | "HARD" =>
  value === "EASY" || value === "MEDIUM" || value === "HARD";

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const buildNextAction = (
  weakTopics: NextActionSignal[],
  revisions: Array<{
    id: string;
    title: string;
    topicName: string;
    daysSince: number;
  }>,
  solvedLast7d = 0,
): NextAction => {
  const revision = revisions[0];
  if (revision) {
    return {
      mode: "REVISION",
      title: `Review ${revision.title}`,
      topic: revision.topicName,
      reason: `This problem is already due for spaced repetition after ${revision.daysSince} days.`,
      cta: "Open review queue",
      difficulty: "REVIEW",
      estimatedMinutes: Math.max(10, Math.min(45, revision.daysSince * 5)),
    };
  }

  const weakTopic = weakTopics[0];
  if (weakTopic) {
    return {
      mode: "WEAKNESS",
      title: `Practice ${weakTopic.name}`,
      topic: weakTopic.name,
      reason: weakTopic.avgTimeSpent
        ? `This is slowing you down at about ${weakTopic.avgTimeSpent} minutes per solved problem.`
        : weakTopic.completionPct !== undefined
          ? `This topic is only ${Math.round(weakTopic.completionPct)}% complete.`
          : "This is one of your weakest topics right now.",
      cta: "Start practice",
      difficulty: "EASY",
      estimatedMinutes: Math.max(20, weakTopic.avgTimeSpent || 20),
    };
  }

  if (solvedLast7d === 0) {
    return {
      mode: "BUILD_MOMENTUM",
      title: "Solve one easy problem",
      topic: "Warm-up",
      reason:
        "There is not enough recent activity this week. A short warm-up keeps the streak alive.",
      cta: "Pick an easy win",
      difficulty: "EASY",
      estimatedMinutes: 20,
    };
  }

  return {
    mode: "BALANCED",
    title: "Mix review with new practice",
    topic: "Balanced practice",
    reason:
      "You are in a steady state. Blend one review problem with one new problem to keep recall and growth active.",
    cta: "Open recommendations",
    difficulty: "MEDIUM",
    estimatedMinutes: 30,
  };
};

export const getNextRevisionInterval = (currentInterval: number) => {
  if (currentInterval <= 0) return 2;
  if (currentInterval <= 2) return 7;
  if (currentInterval <= 7) return 21;
  return Math.max(21, Math.round(currentInterval * 1.6));
};
