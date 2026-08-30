/**
 * LearnCpp Curriculum Database Seeder
 * Populates DSA-Tracker's Learning System with the complete 28-Chapter LearnCpp.com curriculum
 */

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { LEARNCPP_CHAPTERS_DATA } from "./learncppContentData";

const prisma = new PrismaClient();

export interface LearnCppSeedResult {
  trackId: string;
  modulesCreated: number;
  lessonsCreated: number;
  blocksCreated: number;
  trackTitle: string;
}

export async function seedLearnCppCurriculum(): Promise<LearnCppSeedResult> {
  const trackSlug = "learncpp-cplusplus-mastery";
  const trackTitle = "Complete Modern C++ Mastery (LearnCpp Official)";
  const trackDescription =
    "The complete, definitive modern C++ curriculum based on LearnCpp.com. Master C++ from foundational syntax to object-oriented programming, memory management, smart pointers, templates, and modern standard library patterns.\n\n" +
    "**Chapters Included**:\n" +
    "• Chapter 0–2: Getting Started, C++ Basics, Functions & Header Files\n" +
    "• Chapter 3–6: Debugging, Data Types, Constants, Strings & Operators\n" +
    "• Chapter 7–10: Scope, Control Flow, Error Handling & Type Deductions\n" +
    "• Chapter 11–13: Function Overloading, Pointers, References, Enums & Structs\n" +
    "• Chapter 14–15: Object-Oriented Programming, Classes & Constructors\n" +
    "• Chapter 16–19: std::vector, std::array, Algorithms & Dynamic Allocation\n" +
    "• Chapter 20–22: Advanced Functions, Operator Overloading & Smart Pointers\n" +
    "• Chapter 23–25: Object Relationships, Inheritance & Virtual Polymorphism\n" +
    "• Chapter 26–28: Class Templates, Exception Handling & Streams I/O\n" +
    "• Appendices: Modules, Bit Manipulation & Standard References";

  console.log(`\n====================================================`);
  console.log(`🌱 Seeding LearnCpp Curriculum into Database...`);
  console.log(`====================================================\n`);

  // Delete existing track if it exists for clean idempotency
  await prisma.theoryTrack.deleteMany({
    where: { slug: trackSlug },
  });

  const trackId = randomUUID();

  // Create main track
  await prisma.theoryTrack.create({
    data: {
      id: trackId,
      slug: trackSlug,
      title: trackTitle,
      description: trackDescription,
      orderIndex: 2,
      isPublished: true,
    },
  });

  let totalModules = 0;
  let totalLessons = 0;
  let totalBlocks = 0;

  for (let cIdx = 0; cIdx < LEARNCPP_CHAPTERS_DATA.length; cIdx++) {
    const chap = LEARNCPP_CHAPTERS_DATA[cIdx];
    const moduleId = randomUUID();

    // Create TheoryModule for Chapter
    await prisma.theoryModule.create({
      data: {
        id: moduleId,
        trackId: trackId,
        slug: chap.slug,
        title: chap.title,
        summary: chap.summary,
        orderIndex: chap.orderIndex || cIdx + 1,
        estimatedMinutes: chap.estimatedMinutes || 60,
        isPublished: true,
      },
    });
    totalModules++;

    // Create Lessons for this Module
    for (let lIdx = 0; lIdx < chap.lessons.length; lIdx++) {
      const les = chap.lessons[lIdx];
      const lessonId = randomUUID();

      await prisma.theoryLesson.create({
        data: {
          id: lessonId,
          moduleId: moduleId,
          slug: les.slug,
          title: les.title,
          summary: les.summary,
          orderIndex: lIdx + 1,
          difficulty: les.difficulty || "BEGINNER",
          estimatedMinutes: les.estimatedMinutes || 15,
          learningObjectives: les.learningObjectives || [],
          isPublished: true,
        },
      });
      totalLessons++;

      // Create Blocks for this Lesson
      for (let bIdx = 0; bIdx < les.blocks.length; bIdx++) {
        const blk = les.blocks[bIdx];

        await prisma.theoryLessonBlock.create({
          data: {
            id: randomUUID(),
            lessonId: lessonId,
            blockType: blk.blockType as any,
            orderIndex: bIdx + 1,
            content: blk.content,
            language: blk.language || null,
          },
        });
        totalBlocks++;
      }
    }
  }

  console.log(`✅ LearnCpp Curriculum successfully seeded!`);
  console.log(`   Track: ${trackTitle}`);
  console.log(`   Modules (Chapters): ${totalModules}`);
  console.log(`   Lessons: ${totalLessons}`);
  console.log(`   Blocks: ${totalBlocks}\n`);

  return {
    trackId,
    modulesCreated: totalModules,
    lessonsCreated: totalLessons,
    blocksCreated: totalBlocks,
    trackTitle,
  };
}

export async function runLearnCppSeed() {
  try {
    const result = await seedLearnCppCurriculum();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}
