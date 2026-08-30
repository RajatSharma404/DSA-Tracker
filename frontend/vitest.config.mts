import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    pool: "threads",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/__tests__/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/lib/**/*.ts",
        "src/hooks/**/*.ts",
        "src/features/algo-tracer/utils/**/*.ts",
        "src/features/algo-tracer/hooks/**/*.ts",
        "src/data/studyGuides/**/*.ts",
        "src/components/ui/**/*.tsx",
        "src/components/layout/**/*.tsx",
        "src/components/providers/**/*.tsx",
        "src/components/dashboard/**/*.tsx",
        "src/components/roadmap/**/*.tsx",
        "src/components/city/**/*.tsx",
        "src/proxy.ts",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "src/types/**",
        "src/test/**",
        "src/components/3d/**", // WebGL canvas requires custom renderer
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
