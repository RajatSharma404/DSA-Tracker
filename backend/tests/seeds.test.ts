import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  theoryTrack: {
    findFirst: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  theoryModule: {
    create: vi.fn(),
  },
  theoryLesson: {
    create: vi.fn(),
  },
  theoryLessonBlock: {
    create: vi.fn(),
  },
  $disconnect: vi.fn(),
}));

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      theoryTrack = mockPrisma.theoryTrack;
      theoryModule = mockPrisma.theoryModule;
      theoryLesson = mockPrisma.theoryLesson;
      theoryLessonBlock = mockPrisma.theoryLessonBlock;
      $disconnect = mockPrisma.$disconnect;
    },
  };
});

import {
  seedComprehensiveDSA,
  runComprehensiveSeed,
} from "../seedComprehensiveDSA";
import {
  seedLearnCppCurriculum,
  runLearnCppSeed,
} from "../seedLearnCppCurriculum";

describe("Backend Seeding Logic", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("seedComprehensiveDSA & runComprehensiveSeed", () => {
    it("should create track, modules, lessons and blocks", async () => {
      mockPrisma.theoryTrack.findFirst.mockResolvedValue(null);
      mockPrisma.theoryTrack.create.mockResolvedValue({ id: "track-1" });
      mockPrisma.theoryModule.create.mockResolvedValue({ id: "mod-1" });
      mockPrisma.theoryLesson.create.mockResolvedValue({ id: "less-1" });
      mockPrisma.theoryLessonBlock.create.mockResolvedValue({ id: "block-1" });

      const result = await seedComprehensiveDSA();
      expect(result).toBeDefined();
      expect(result.trackTitle).toBe("Complete DSA Bootcamp (C++)");
      expect(result.modulesCreated).toBe(20);
      expect(result.lessonsCreated).toBe(20);
      expect(result.blocksCreated).toBe(40);
      expect(typeof result.trackId).toBe("string");
    });

    it("should handle error in seedComprehensiveDSA", async () => {
      mockPrisma.theoryTrack.deleteMany.mockRejectedValueOnce(new Error("DB error"));
      await expect(seedComprehensiveDSA()).rejects.toThrow("DB error");
    });

    it("should run direct comprehensive seed and exit with 0 on success", async () => {
      const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
      mockPrisma.theoryTrack.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.theoryTrack.create.mockResolvedValue({ id: "track-1" });
      mockPrisma.theoryModule.create.mockResolvedValue({ id: "mod-1" });
      mockPrisma.theoryLesson.create.mockResolvedValue({ id: "less-1" });
      mockPrisma.theoryLessonBlock.create.mockResolvedValue({ id: "block-1" });

      await runComprehensiveSeed();
      expect(exitSpy).toHaveBeenCalledWith(0);
      exitSpy.mockRestore();
    });

    it("should run direct comprehensive seed and exit with 1 on failure", async () => {
      const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
      mockPrisma.theoryTrack.deleteMany.mockRejectedValueOnce(new Error("Failed seed"));

      await runComprehensiveSeed();
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });

  describe("seedLearnCppCurriculum & runLearnCppSeed", () => {
    it("should seed LearnCpp chapters curriculum", async () => {
      mockPrisma.theoryTrack.findFirst.mockResolvedValue(null);
      mockPrisma.theoryTrack.create.mockResolvedValue({ id: "learncpp-track" });
      mockPrisma.theoryModule.create.mockResolvedValue({ id: "mod-1" });
      mockPrisma.theoryLesson.create.mockResolvedValue({ id: "less-1" });
      mockPrisma.theoryLessonBlock.create.mockResolvedValue({ id: "block-1" });

      const result = await seedLearnCppCurriculum();
      expect(result).toBeDefined();
      expect(result.trackTitle).toContain("LearnCpp");
      expect(result.modulesCreated).toBeGreaterThan(0);
    });

    it("should run learncpp seed and exit with 0 on success", async () => {
      const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
      mockPrisma.theoryTrack.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.theoryTrack.create.mockResolvedValue({ id: "learncpp-track" });
      mockPrisma.theoryModule.create.mockResolvedValue({ id: "mod-1" });
      mockPrisma.theoryLesson.create.mockResolvedValue({ id: "less-1" });
      mockPrisma.theoryLessonBlock.create.mockResolvedValue({ id: "block-1" });
      mockPrisma.$disconnect.mockResolvedValue(undefined);

      await runLearnCppSeed();
      expect(exitSpy).toHaveBeenCalledWith(0);
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
      exitSpy.mockRestore();
    });

    it("should handle error in runLearnCppSeed, disconnect prisma and exit with 1", async () => {
      const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
      mockPrisma.theoryTrack.deleteMany.mockRejectedValueOnce(new Error("LearnCpp DB error"));
      mockPrisma.$disconnect.mockResolvedValue(undefined);

      await runLearnCppSeed();
      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
      exitSpy.mockRestore();
    });
  });
});
