export function calculateStreakFromSolves(
  solves: Array<{ completedAt?: Date | string | null; updatedAt?: Date | string | null }>,
  existingLongestStreak = 0,
  referenceDate = new Date(),
): { currentStreak: number; longestStreak: number } {
  const dateSet = new Set<string>();
  solves.forEach((s) => {
    const raw = s.completedAt || s.updatedAt;
    if (!raw) return;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000) return;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dateSet.add(`${yyyy}-${mm}-${dd}`);
  });

  const formatDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = formatDate(referenceDate);
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  let currentStreak = 0;
  if (dateSet.has(todayStr)) {
    const cursor = new Date(referenceDate);
    while (dateSet.has(formatDate(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  } else if (dateSet.has(yesterdayStr)) {
    const cursor = new Date(yesterday);
    while (dateSet.has(formatDate(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Calculate longest historical streak from distinct dates
  const sortedDatesAsc = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  let calculatedLongest = sortedDatesAsc.length > 0 ? 1 : 0;
  let run = 1;

  for (let i = 1; i < sortedDatesAsc.length; i++) {
    const [y1, m1, d1] = sortedDatesAsc[i - 1].split("-").map(Number);
    const [y2, m2, d2] = sortedDatesAsc[i].split("-").map(Number);
    const prev = new Date(y1, m1 - 1, d1);
    const curr = new Date(y2, m2 - 1, d2);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      run++;
      if (run > calculatedLongest) {
        calculatedLongest = run;
      }
    } else if (diffDays > 1) {
      run = 1;
    }
  }

  const longestStreak = Math.max(
    calculatedLongest,
    currentStreak,
    existingLongestStreak,
  );

  return {
    currentStreak,
    longestStreak,
  };
}

export function generateHeatmapFromSolves(
  solves: Array<{ completedAt?: Date | string | null; updatedAt?: Date | string | null }>,
  days = 365,
  referenceDate = new Date(),
): Array<{ date: string; count: number }> {
  const countsByDate = new Map<string, number>();
  solves.forEach((s) => {
    const raw = s.completedAt || s.updatedAt;
    if (!raw) return;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000) return;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
  });

  const result: Array<{ date: string; count: number }> = [];
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    result.push({
      date: dateStr,
      count: countsByDate.get(dateStr) || 0,
    });
  }

  return result;
}

export function calculateWeakestTopic(
  topics: Array<{
    id: string;
    name: string;
    problems: Array<{
      id: string;
      progress: Array<{ id: string }>;
    }>;
  }>,
): {
  id: string;
  name: string;
  topic: string;
  total: number;
  solved: number;
  solve_rate: number;
  percentage: number;
} | null {
  const eligible = topics
    .filter((t) => t.problems && t.problems.length >= 5)
    .map((t) => {
      const total = t.problems.length;
      const solved = t.problems.filter(
        (p) => p.progress && p.progress.length > 0,
      ).length;
      const solve_rate = total > 0 ? solved / total : 0;
      return {
        id: t.id,
        name: t.name,
        topic: t.name,
        total,
        solved,
        solve_rate,
        percentage: Math.round(solve_rate * 100),
      };
    });

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    if (a.solve_rate !== b.solve_rate) {
      return a.solve_rate - b.solve_rate;
    }
    return b.total - a.total;
  });

  return eligible[0];
}

export function calculateTopicBreakdown(
  topics: Array<{
    id: string;
    name: string;
    problems: Array<{
      id: string;
      progress: Array<{ id?: string; status?: string }>;
    }>;
  }>,
): Array<{
  topic: string;
  subject: string;
  percentage: number;
  value: number;
  solved: number;
  total: number;
  fullMark: number;
}> {
  return topics
    .filter((t) => t.problems && t.problems.length > 0)
    .map((t) => {
      const total = t.problems.length;
      const solved = t.problems.filter(
        (p) => p.progress && p.progress.length > 0,
      ).length;
      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
      return {
        topic: t.name,
        subject: t.name,
        percentage,
        value: percentage,
        solved,
        total,
        fullMark: 100,
      };
    });
}

export function calculateWeeklySolveVelocity(
  solves: Array<{ completedAt?: Date | string | null; updatedAt?: Date | string | null }>,
  weeks = 8,
  referenceDate = new Date(),
): {
  weeks: Array<{ week: string; solved: number }>;
  average: number;
} {
  const ref = new Date(referenceDate);
  ref.setHours(23, 59, 59, 999);

  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const weekBuckets: Array<{
    week: string;
    startMs: number;
    endMs: number;
    solved: number;
  }> = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(ref.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000 + 1);

    const mmm = MONTH_NAMES[start.getMonth()];
    const dd = String(start.getDate()).padStart(2, "0");
    const label = `Week of ${mmm} ${dd}`;

    weekBuckets.push({
      week: label,
      startMs: start.getTime(),
      endMs: end.getTime(),
      solved: 0,
    });
  }

  solves.forEach((s) => {
    const raw = s.completedAt || s.updatedAt;
    if (!raw) return;
    const time = new Date(raw).getTime();
    if (Number.isNaN(time)) return;

    for (const bucket of weekBuckets) {
      if (time >= bucket.startMs && time <= bucket.endMs) {
        bucket.solved++;
        break;
      }
    }
  });

  const totalSolved = weekBuckets.reduce((acc, b) => acc + b.solved, 0);
  const average = weeks > 0 ? Math.round((totalSolved / weeks) * 10) / 10 : 0;

  return {
    weeks: weekBuckets.map((b) => ({ week: b.week, solved: b.solved })),
    average,
  };
}

export function calculateDifficultyRamp(
  solves: Array<{
    completedAt?: Date | string | null;
    updatedAt?: Date | string | null;
    problem?: { difficulty?: string | null } | null;
  }>,
  months = 6,
  referenceDate = new Date(),
): Array<{
  month: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}> {
  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const ref = new Date(referenceDate);
  const result: Array<{
    year: number;
    monthIndex: number;
    month: string;
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      month: MONTH_NAMES[d.getMonth()],
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
    });
  }

  solves.forEach((s) => {
    const raw = s.completedAt || s.updatedAt;
    if (!raw) return;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return;

    const y = d.getFullYear();
    const m = d.getMonth();

    const bucket = result.find((b) => b.year === y && b.monthIndex === m);
    if (!bucket) return;

    const diff = (s.problem?.difficulty || "EASY").toUpperCase();
    if (diff === "EASY") {
      bucket.easy++;
    } else if (diff === "MEDIUM") {
      bucket.medium++;
    } else if (diff === "HARD") {
      bucket.hard++;
    } else {
      bucket.easy++;
    }
    bucket.total++;
  });

  return result.map(({ month, easy, medium, hard, total }) => ({
    month,
    easy,
    medium,
    hard,
    total,
  }));
}
