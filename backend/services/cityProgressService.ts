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
