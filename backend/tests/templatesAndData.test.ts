import { describe, it, expect } from "vitest";
import { DSA_TEMPLATES } from "../templates";
import { LEARNCPP_CHAPTERS_DATA } from "../learncppContentData";
import { ALL_20_DSA_TOPICS, generateTopicContent } from "../allTopicsTutoring";
import { COMPREHENSIVE_DSA_TOPICS } from "../comprehensiveDsaTutoring";
import { topics1to5 } from "../content/topics1to5";
import { topics6to10 } from "../content/topics6to10";
import { topics11to15 } from "../content/topics11to15";
import { topics16to20 } from "../content/topics16to20";

describe("Backend Static Content & Data Integrity", () => {
  describe("DSA_TEMPLATES", () => {
    it("should export a valid array of templates with required fields", () => {
      expect(Array.isArray(DSA_TEMPLATES)).toBe(true);
      expect(DSA_TEMPLATES.length).toBeGreaterThan(0);

      DSA_TEMPLATES.forEach((tmpl) => {
        expect(tmpl).toHaveProperty("id");
        expect(tmpl).toHaveProperty("name");
        expect(tmpl).toHaveProperty("category");
        expect(tmpl).toHaveProperty("timeComplexity");
        expect(tmpl).toHaveProperty("spaceComplexity");
        expect(tmpl).toHaveProperty("template");
        expect(tmpl.template.length).toBeGreaterThan(10);
        expect(Array.isArray(tmpl.whenToUse)).toBe(true);
        expect(Array.isArray(tmpl.gotchas)).toBe(true);
      });
    });

    it("should include core patterns like binary-search and sliding-window", () => {
      const ids = DSA_TEMPLATES.map((t) => t.id);
      expect(ids).toContain("binary-search");
      expect(ids).toContain("sliding-window");
      expect(ids).toContain("two-pointers");
      expect(ids).toContain("bfs");
      expect(ids).toContain("dfs");
    });
  });

  describe("LEARNCPP_CHAPTERS_DATA", () => {
    it("should export an array with chapters and valid lesson structure", () => {
      expect(LEARNCPP_CHAPTERS_DATA).toBeDefined();
      expect(Array.isArray(LEARNCPP_CHAPTERS_DATA)).toBe(true);
      expect(LEARNCPP_CHAPTERS_DATA.length).toBeGreaterThan(0);

      LEARNCPP_CHAPTERS_DATA.forEach((chapter) => {
        expect(chapter).toHaveProperty("slug");
        expect(chapter).toHaveProperty("title");
        expect(Array.isArray(chapter.lessons)).toBe(true);
      });
    });
  });

  describe("Tutoring Data & Topic Content", () => {
    it("should export ALL_20_DSA_TOPICS and generateTopicContent", () => {
      expect(ALL_20_DSA_TOPICS).toBeDefined();
      expect(ALL_20_DSA_TOPICS.length).toBe(20);

      const topic1Content = generateTopicContent(1);
      expect(topic1Content).toContain("# Complexity Analysis");
      expect(topic1Content).toContain("## 1. What is it?");
      expect(topic1Content).toContain("## 5. Complexity analysis");

      const unknownTopicContent = generateTopicContent(999);
      expect(unknownTopicContent).toContain("# Topic 999");
    });

    it("should export COMPREHENSIVE_DSA_TOPICS with deep explanations", () => {
      expect(COMPREHENSIVE_DSA_TOPICS).toBeDefined();
      expect(Array.isArray(COMPREHENSIVE_DSA_TOPICS)).toBe(true);
      expect(COMPREHENSIVE_DSA_TOPICS.length).toBeGreaterThan(0);
      expect(COMPREHENSIVE_DSA_TOPICS[0]).toHaveProperty("slug");
      expect(COMPREHENSIVE_DSA_TOPICS[0]).toHaveProperty("title");
    });

    it("should export topics 1 to 20 across content chunk files", () => {
      expect(topics1to5).toBeDefined();
      expect(topics6to10).toBeDefined();
      expect(topics11to15).toBeDefined();
      expect(topics16to20).toBeDefined();

      expect(Object.keys(topics1to5).length).toBe(5);
      expect(Object.keys(topics6to10).length).toBe(5);
      expect(Object.keys(topics11to15).length).toBe(5);
      expect(Object.keys(topics16to20).length).toBe(5);
    });
  });
});
