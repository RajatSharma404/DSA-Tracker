import { prisma } from "../db/prisma";

export async function getUserCityProgressInfo(userId: string) {
  const topics = await prisma.topic.findMany({
    include: {
      problems: {
        include: {
          progress: {
            where: { userId },
          },
        },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  let floors = 0;
  const levels = topics.map((topic) => {
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    let easyTotal = 0;
    let mediumTotal = 0;
    let hardTotal = 0;

    topic.problems.forEach((p) => {
      const isDone = p.progress[0]?.status === "DONE";
      if (p.difficulty === "EASY") {
        easyTotal++;
        if (isDone) easySolved++;
      }
      if (p.difficulty === "MEDIUM") {
        mediumTotal++;
        if (isDone) mediumSolved++;
      }
      if (p.difficulty === "HARD") {
        hardTotal++;
        if (isDone) hardSolved++;
      }
    });

    const reqEasy = Math.min(2, easyTotal);
    const reqMedium = Math.min(2, mediumTotal);
    const reqHard = Math.min(1, hardTotal);

    const isCompleted =
      easySolved >= reqEasy &&
      mediumSolved >= reqMedium &&
      hardSolved >= reqHard;
    if (isCompleted) {
      floors++;
    }

    return {
      id: topic.id,
      name: topic.name,
      isCompleted,
      progress: {
        easy: { solved: easySolved, required: reqEasy, total: easyTotal },
        medium: { solved: mediumSolved, required: reqMedium, total: mediumTotal },
        hard: { solved: hardSolved, required: reqHard, total: hardTotal },
      },
    };
  });

  let currentUnlockedLevelId = null;
  for (let i = 0; i < levels.length; i++) {
    if (!levels[i].isCompleted) {
      currentUnlockedLevelId = levels[i].id;
      break;
    }
  }

  return { floors, levels, currentUnlockedLevelId };
}

/**
 * Targeted check: Determines if a topic's floor is locked for a user.
 * Rather than scanning all topics and problems across the entire database,
 * this checks ONLY the immediate preceding topic (orderIndex - 1).
 * If the current topic is the first topic (orderIndex <= 0), it is never locked (returns false) in O(1).
 */
export async function isTopicFloorLocked(
  userId: string,
  currentTopicOrderIndex: number,
): Promise<boolean> {
  // Topic 0 (Floor 1) is always unlocked
  if (currentTopicOrderIndex <= 0) {
    return false;
  }

  // Query ONLY the single predecessor topic
  const prevTopic = await prisma.topic.findFirst({
    where: { orderIndex: currentTopicOrderIndex - 1 },
    select: {
      id: true,
      problems: {
        select: {
          difficulty: true,
          progress: {
            where: { userId, status: "DONE" },
            select: { id: true },
          },
        },
      },
    },
  });

  // If there is no previous topic or it has no problems, it cannot block progression
  if (!prevTopic || prevTopic.problems.length === 0) {
    return false;
  }

  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  let easyTotal = 0;
  let mediumTotal = 0;
  let hardTotal = 0;

  for (const p of prevTopic.problems) {
    const isDone = p.progress.length > 0;
    if (p.difficulty === "EASY") {
      easyTotal++;
      if (isDone) easySolved++;
    } else if (p.difficulty === "MEDIUM") {
      mediumTotal++;
      if (isDone) mediumSolved++;
    } else if (p.difficulty === "HARD") {
      hardTotal++;
      if (isDone) hardSolved++;
    }
  }

  const reqEasy = Math.min(2, easyTotal);
  const reqMedium = Math.min(2, mediumTotal);
  const reqHard = Math.min(1, hardTotal);

  const isPrevCompleted =
    easySolved >= reqEasy &&
    mediumSolved >= reqMedium &&
    hardSolved >= reqHard;

  return !isPrevCompleted;
}
