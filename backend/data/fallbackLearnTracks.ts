export const BASE_FALLBACK_LEARN_TRACKS = [
  {
    id: "fallback-track-cpp-foundations",
    slug: "cpp-foundations",
    title: "C++ Foundations",
    description:
      "Build language fluency and complexity instincts for interviews.",
    orderIndex: 1,
    totalLessons: 4,
    completedLessons: 0,
    progressPercent: 0,
    modules: [
      {
        id: "fallback-module-cpp-basics",
        slug: "cpp-basics-for-dsa",
        title: "C++ Basics For DSA",
        summary: "Syntax, STL, complexity, and memory-safe patterns.",
        orderIndex: 1,
        estimatedMinutes: 60,
        totalLessons: 2,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [
          {
            id: "fallback-lesson-setup-complexity",
            slug: "cpp-setup-and-complexity",
            title: "C++ Setup and Big-O",
            summary:
              "Understand compilation, STL basics, and runtime complexity.",
            orderIndex: 1,
            estimatedMinutes: 20,
            difficulty: "BEGINNER",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Understand O(1), O(log n), O(n), O(n log n)",
              "Write fast I/O boilerplate in C++",
              "Know when vectors vs arrays matter",
            ],
          },
          {
            id: "fallback-lesson-hashmap-two-pointer",
            slug: "cpp-hashmap-and-two-pointer",
            title: "HashMap and Two Pointer Patterns",
            summary:
              "Theory behind two common interview optimization patterns.",
            orderIndex: 2,
            estimatedMinutes: 25,
            difficulty: "BEGINNER",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Identify when to use unordered_map",
              "Convert brute force to linear scans",
              "Avoid common two-pointer edge cases",
            ],
          },
        ],
      },
      {
        id: "fallback-module-cpp-advanced",
        slug: "cpp-memory-and-templates",
        title: "Memory and Templates",
        summary:
          "References, pointers, and template utilities for cleaner code.",
        orderIndex: 2,
        estimatedMinutes: 70,
        totalLessons: 2,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [
          {
            id: "fallback-lesson-pointers-references",
            slug: "pointers-references-and-raii",
            title: "Pointers, References, and RAII",
            summary:
              "Master safe memory handling in competitive coding contexts.",
            orderIndex: 1,
            estimatedMinutes: 30,
            difficulty: "INTERMEDIATE",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Differentiate stack and heap allocation",
              "Use references to avoid unnecessary copies",
              "Apply RAII for exception-safe resource management",
            ],
          },
          {
            id: "fallback-lesson-template-patterns",
            slug: "template-patterns-for-dsa",
            title: "Template Patterns for DSA",
            summary: "Use templates and helpers to build reusable solutions.",
            orderIndex: 2,
            estimatedMinutes: 25,
            difficulty: "INTERMEDIATE",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Write generic helper functions",
              "Use lambda comparators with STL",
              "Avoid template overengineering in interviews",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "fallback-track-algorithmic-patterns",
    slug: "algorithmic-patterns",
    title: "Algorithmic Patterns",
    description: "Learn transferable patterns used across most DSA questions.",
    orderIndex: 2,
    totalLessons: 4,
    completedLessons: 0,
    progressPercent: 0,
    modules: [
      {
        id: "fallback-module-linear-patterns",
        slug: "linear-patterns",
        title: "Linear Scan Patterns",
        summary: "Two pointers, sliding windows, and prefix transforms.",
        orderIndex: 1,
        estimatedMinutes: 75,
        totalLessons: 2,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [
          {
            id: "fallback-lesson-two-pointers",
            slug: "two-pointers-mastery",
            title: "Two Pointers Mastery",
            summary: "Sort + sweep strategy for pair and range problems.",
            orderIndex: 1,
            estimatedMinutes: 35,
            difficulty: "BEGINNER",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Recognize monotonic movement opportunities",
              "Track invariants while moving pointers",
              "Handle duplicates and boundary conditions",
            ],
          },
          {
            id: "fallback-lesson-sliding-window",
            slug: "sliding-window-system",
            title: "Sliding Window System",
            summary: "Expand/contract windows to optimize contiguous ranges.",
            orderIndex: 2,
            estimatedMinutes: 30,
            difficulty: "INTERMEDIATE",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Model fixed vs variable windows",
              "Track counts/frequencies efficiently",
              "Convert nested loops to linear scans",
            ],
          },
        ],
      },
      {
        id: "fallback-module-state-patterns",
        slug: "state-patterns",
        title: "State Transition Patterns",
        summary: "Greedy choices, dynamic programming, and state compression.",
        orderIndex: 2,
        estimatedMinutes: 80,
        totalLessons: 2,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [
          {
            id: "fallback-lesson-greedy-proof",
            slug: "greedy-choice-proofing",
            title: "Greedy Choice Proofing",
            summary: "When local optimum decisions lead to global optimum.",
            orderIndex: 1,
            estimatedMinutes: 30,
            difficulty: "INTERMEDIATE",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Identify exchange arguments",
              "Prove correctness with invariants",
              "Spot cases where greedy fails",
            ],
          },
          {
            id: "fallback-lesson-dp-transitions",
            slug: "dp-state-transitions",
            title: "DP State Transitions",
            summary:
              "Design states, transitions, and base cases systematically.",
            orderIndex: 2,
            estimatedMinutes: 40,
            difficulty: "ADVANCED",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Define minimal sufficient state",
              "Optimize recursion to tabulation",
              "Reduce dimensions when dependencies allow",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "fallback-track-data-structures",
    slug: "data-structures-systems",
    title: "Data Structure Systems",
    description: "Core structures and traversal logic used in problem solving.",
    orderIndex: 3,
    totalLessons: 4,
    completedLessons: 0,
    progressPercent: 0,
    modules: [
      {
        id: "fallback-module-trees-graphs",
        slug: "trees-and-graphs",
        title: "Trees and Graphs",
        summary: "Traversal strategies and path/state representations.",
        orderIndex: 1,
        estimatedMinutes: 90,
        totalLessons: 2,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [
          {
            id: "fallback-lesson-tree-traversals",
            slug: "tree-traversal-playbook",
            title: "Tree Traversal Playbook",
            summary: "DFS/BFS templates and subtree decomposition methods.",
            orderIndex: 1,
            estimatedMinutes: 35,
            difficulty: "BEGINNER",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Choose preorder/inorder/postorder intentionally",
              "Use recursion and iterative stack forms",
              "Model subtree return values cleanly",
            ],
          },
          {
            id: "fallback-lesson-graph-traversal",
            slug: "graph-traversal-toolkit",
            title: "Graph Traversal Toolkit",
            summary: "Visited-state, components, and shortest-path basics.",
            orderIndex: 2,
            estimatedMinutes: 40,
            difficulty: "INTERMEDIATE",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Represent graphs as adjacency lists",
              "Use BFS for unweighted shortest paths",
              "Detect cycles and connected components",
            ],
          },
        ],
      },
      {
        id: "fallback-module-heaps-tries",
        slug: "heaps-and-tries",
        title: "Heaps and Tries",
        summary: "Priority queues and prefix-indexed retrieval patterns.",
        orderIndex: 2,
        estimatedMinutes: 65,
        totalLessons: 2,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [
          {
            id: "fallback-lesson-heaps-priority",
            slug: "heaps-priority-queues",
            title: "Heaps and Priority Queues",
            summary: "Top-k, scheduling, and streaming statistics problems.",
            orderIndex: 1,
            estimatedMinutes: 30,
            difficulty: "INTERMEDIATE",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Pick min-heap vs max-heap approaches",
              "Maintain top-k efficiently",
              "Use lazy deletion when needed",
            ],
          },
          {
            id: "fallback-lesson-tries-prefix",
            slug: "tries-and-prefix-indexing",
            title: "Tries and Prefix Indexing",
            summary: "Prefix search, dictionary constraints, and pruning.",
            orderIndex: 2,
            estimatedMinutes: 30,
            difficulty: "ADVANCED",
            status: "NOT_STARTED",
            progressPercent: 0,
            learningObjectives: [
              "Model node structure for character sets",
              "Balance memory and lookup speed",
              "Combine Trie with DFS backtracking",
            ],
          },
        ],
      },
    ],
  },
];

export const TARGET_FALLBACK_LESSON_COUNT = 65;

export const expandFallbackLearnTracks = (
  tracks: typeof BASE_FALLBACK_LEARN_TRACKS,
) => {
  const expanded = tracks.map((track) => ({
    ...track,
    modules: track.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({ ...lesson })),
    })),
  }));

  const countLessons = () =>
    expanded.reduce(
      (trackSum, track) =>
        trackSum +
        track.modules.reduce(
          (moduleSum, module) => moduleSum + module.lessons.length,
          0,
        ),
      0,
    );

  let runningIndex = countLessons() + 1;
  let trackCursor = 0;

  while (countLessons() < TARGET_FALLBACK_LESSON_COUNT) {
    const track = expanded[trackCursor % expanded.length];
    const module = track.modules[trackCursor % track.modules.length];
    const lessonNumber = module.lessons.length + 1;

    module.lessons.push({
      id: `fallback-lesson-${track.slug}-${module.slug}-${runningIndex}`,
      slug: `lesson-${module.slug}-${runningIndex}`,
      title: `Practice Theory ${runningIndex}`,
      summary: `Concept reinforcement lesson ${runningIndex} for ${module.title}.`,
      orderIndex: lessonNumber,
      estimatedMinutes: 20 + (runningIndex % 4) * 5,
      difficulty:
        runningIndex % 5 === 0
          ? "ADVANCED"
          : runningIndex % 2 === 0
            ? "INTERMEDIATE"
            : "BEGINNER",
      status: "NOT_STARTED",
      progressPercent: 0,
      learningObjectives: [
        `Apply pattern ${runningIndex} in interview-style constraints`,
        "Choose the right data structure for trade-offs",
        "Write and reason about edge cases quickly",
      ],
    });

    runningIndex += 1;
    trackCursor += 1;
  }

  for (const track of expanded) {
    for (const module of track.modules) {
      module.totalLessons = module.lessons.length;
      module.completedLessons = 0;
      module.progressPercent = 0;
    }

    track.totalLessons = track.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
    track.completedLessons = 0;
    track.progressPercent = 0;
  }

  return expanded;
};

export const FALLBACK_LEARN_TRACKS = expandFallbackLearnTracks(
  BASE_FALLBACK_LEARN_TRACKS,
);

export const toSentence = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

export const normalizeLearningObjectives = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const buildDetailedLessonMarkdown = (params: {
  trackTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonSummary: string | null;
  learningObjectives: string[];
}) => {
  const {
    trackTitle,
    moduleTitle,
    lessonTitle,
    lessonSummary,
    learningObjectives,
  } = params;

  const objectiveLines =
    learningObjectives.length > 0
      ? learningObjectives
          .map((objective) => `- ${toSentence(objective)}`)
          .join("\n")
      : "- Understand the core pattern and why it is preferred over brute force.\n- Analyze time-space trade-offs before coding.\n- Validate edge cases with a dry run.";

  const summaryLine = lessonSummary
    ? toSentence(lessonSummary)
    : `${lessonTitle} builds an interview-ready mental model for ${moduleTitle.toLowerCase()} problems.`;

  return [
    `### Detailed Theory`,
    `${summaryLine}`,
    "",
    `This lesson belongs to **${trackTitle}** and focuses on **${moduleTitle}**. Use this flow whenever you solve a related problem:`,
    "1. Identify the input shape and constraints.",
    "2. Map the problem to the underlying pattern.",
    "3. Choose the most efficient data structure for that pattern.",
    "4. Validate with edge cases before finalizing code.",
    "",
    `### Topic Objectives`,
    `${objectiveLines}`,
    "",
    `### Example`,
    `Suppose you are solving a **${lessonTitle}** style question. Start with a small input and manually trace your state transitions at each step. Track the invariant (what always remains true) while updating pointers, indices, recursion state, or helper structures. This dry run highlights bugs early and reveals whether your approach is truly optimal.`,
    "",
    `### Practice Question`,
    `Design and solve one interview-level problem for **${moduleTitle}** where a brute-force approach is too slow.`,
    `- Write the brute-force complexity and explain why it fails constraints.`,
    `- Derive an optimized approach using the pattern from **${lessonTitle}**.`,
    `- Provide final time and space complexity and test at least 3 edge cases.`,
  ].join("\n");
};

export const appendDetailedTheoryBlock = (params: {
  blocks: Array<{
    id: string;
    blockType: string;
    orderIndex: number;
    content: unknown;
    language: string | null;
  }>;
  lessonId: string;
  trackTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonSummary: string | null;
  learningObjectives: string[];
}) => {
  const {
    blocks,
    lessonId,
    trackTitle,
    moduleTitle,
    lessonTitle,
    lessonSummary,
    learningObjectives,
  } = params;

  const alreadyHasPracticePrompt = blocks.some((block) => {
    if (block.blockType !== "MARKDOWN") return false;
    if (typeof block.content !== "object" || block.content === null)
      return false;
    const markdown = (block.content as Record<string, unknown>).markdown;
    return (
      typeof markdown === "string" &&
      /practice question|detailed theory|### example/i.test(markdown)
    );
  });

  if (alreadyHasPracticePrompt) {
    return blocks;
  }

  const nextOrder =
    blocks.length > 0
      ? Math.max(...blocks.map((block) => Number(block.orderIndex) || 0)) + 1
      : 1;

  return [
    ...blocks,
    {
      id: `${lessonId}-auto-theory-practice`,
      blockType: "MARKDOWN",
      orderIndex: nextOrder,
      content: {
        markdown: buildDetailedLessonMarkdown({
          trackTitle,
          moduleTitle,
          lessonTitle,
          lessonSummary,
          learningObjectives,
        }),
      },
      language: null,
    },
  ];
};

export const getFallbackLearnLesson = (
  trackSlug: string,
  moduleSlug: string,
  lessonSlug: string,
) => {
  const track = FALLBACK_LEARN_TRACKS.find((t) => t.slug === trackSlug);
  if (!track) return null;

  const module = track.modules.find((m) => m.slug === moduleSlug);
  if (!module) return null;

  const lesson = module.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;

  const learningObjectives = normalizeLearningObjectives(
    lesson.learningObjectives,
  );

  const blocks = [
    {
      id: `${lesson.id}-block-1`,
      blockType: "MARKDOWN",
      orderIndex: 1,
      content: {
        markdown: buildDetailedLessonMarkdown({
          trackTitle: track.title,
          moduleTitle: module.title,
          lessonTitle: lesson.title,
          lessonSummary: lesson.summary,
          learningObjectives,
        }),
      },
      language: null,
    },
    {
      id: `${lesson.id}-block-2`,
      blockType: "MARKDOWN",
      orderIndex: 2,
      content: {
        markdown: `### Learning Objectives\n${learningObjectives.map((o: string) => `- ${toSentence(o)}`).join("\n")}`,
      },
      language: null,
    },
  ];

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      difficulty: lesson.difficulty,
      estimatedMinutes: lesson.estimatedMinutes,
      learningObjectives,
      module: {
        id: module.id,
        title: module.title,
        slug: module.slug,
      },
      track: {
        title: track.title,
        slug: track.slug,
      },
    },
    blocks,
    progress: {
      status: "NOT_STARTED",
      progressPercent: 0,
      timeSpentSeconds: 0,
      completedAt: null,
    },
    isUnlocked: false,
    siblings: module.lessons.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      orderIndex: s.orderIndex,
      status: "NOT_STARTED",
    })),
    problems: [],
  };
};
