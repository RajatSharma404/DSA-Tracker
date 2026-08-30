import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "services.ts",
        "leetcodeService.ts",
        "aiService.ts",
        "templates.ts",
        "allTopicsTutoring.ts",
        "learncppContentData.ts",
        "content/**/*.ts",
        "seedComprehensiveDSA.ts",
        "seedLearnCppCurriculum.ts",
      ],
    },
  },
});
