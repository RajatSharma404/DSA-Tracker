import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getRevisionReminders, getWeakTopics } from './services';
import { fetchLeetCodeSolvedProblems, slugify } from './leetcodeService';
import { getAIHint, getPatternExplanation } from './aiService';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret";

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Auth Header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  next();
});

// Auto-admin hook for specific email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ashg821@gmail.com'; // Defaulting to your email

// Extend Express Request object
declare global {
  namespace Express {
    interface Request {
      user?: { id: string, role: string };
    }
  }
}

// Authentication Middleware
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, NEXTAUTH_SECRET) as { id: string, role: string };
    
    // Auto-promotion logic if the user's role is not yet stored in DB as ADMIN
    const user = await prisma.user.findUnique({ where: { id: decoded.id } }) as any;
    if (user && user.email === ADMIN_EMAIL && user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' } as any
      });
      decoded.role = 'ADMIN';
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

// 1. Get Dashboard Stats
app.get('/api/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const totalProblems = await prisma.problem.count();
    const solvedProblems = await prisma.progress.count({
      where: { userId, status: 'DONE' }
    });

    const streak = await prisma.streak.findUnique({
      where: { userId }
    });

    // Pass userId to services if they require it, adjusting as needed
    const weakTopics = await getWeakTopics(userId);
    const revisions = await getRevisionReminders(userId);

    res.json({
      totalProblems,
      solvedProblems,
      progressPercentage: totalProblems === 0 ? 0 : Math.round((solvedProblems / totalProblems) * 100),
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      weakTopics,
      revisions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get All Topics with Progress
app.get('/api/topics', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const topics = await prisma.topic.findMany({
      include: {
        problems: {
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    const enrichedTopics = topics.map(topic => {
      const total = topic.problems.length;
      const solved = topic.problems.filter(p => p.progress[0]?.status === 'DONE').length;
      return {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        totalProblems: total,
        solvedProblems: solved,
        progressPercentage: total === 0 ? 0 : Math.round((solved / total) * 100),
      };
    });

    res.json(enrichedTopics);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get Problems for a Topic
app.get('/api/topics/:topicId/problems', requireAuth, async (req: Request, res: Response) => {
  try {
    const topicId = req.params.topicId as string;
    const userId = req.user!.id;

    const problems = await prisma.problem.findMany({
      where: { topicId },
      include: {
        progress: {
          where: { userId }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    const enrichedProblems = problems.map(problem => ({
      ...problem,
      status: problem.progress[0]?.status || 'TODO',
      timeSpent: problem.progress[0]?.timeSpent || 0,
    }));

    res.json(enrichedProblems);
  } catch(err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Update Problem Progress
app.post('/api/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemId, status, timeSpent } = req.body;
    const userId = req.user!.id;

    const progress = await prisma.progress.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId
        }
      },
      update: {
        status,
        timeSpent,
        completedAt: status === 'DONE' ? new Date() : null,
      },
      create: {
        userId,
        problemId,
        status,
        timeSpent,
        completedAt: status === 'DONE' ? new Date() : null,
      }
    });

    // Spaced Repetition logic (SM-2 simplified)
    if (status === 'DONE') {
      const existing = await prisma.progress.findUnique({
        where: { userId_problemId: { userId, problemId } }
      }) as any;

      let nextInterval = 1;
      let nextEF = existing?.easinessFactor || 2.5;

      if (!existing || existing.interval === 0) {
        nextInterval = 1;
      } else if (existing.interval === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(existing.interval * nextEF);
      }

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + nextInterval);

      await prisma.progress.update({
        where: { userId_problemId: { userId, problemId } },
        data: {
          interval: nextInterval,
          easinessFactor: nextEF,
          nextReviewDate: nextReview
        } as any
      });

      const streak = await prisma.streak.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date(0)
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActivity = new Date(streak.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Increment streak
        await prisma.streak.update({
          where: { userId },
          data: {
            currentStreak: { increment: 1 },
            longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
            lastActivityDate: new Date()
          }
        });
      } else if (diffDays > 1) {
        // Reset streak
        await prisma.streak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastActivityDate: new Date()
          }
        });
      }
    }

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === INTERVIEW ROUTES ===

app.get('/api/interviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const interviews = await prisma.mockInterview.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/interviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date, score, feedback } = req.body;
    const userId = req.user!.id;

    const newInterview = await prisma.mockInterview.create({
      data: {
        userId,
        date: new Date(date),
        score: parseInt(score),
        feedback
      }
    });

    res.json(newInterview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// === ADMIN ROUTES ===

// 5. Get All Users (Admin only)
app.get('/api/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user role
app.patch('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const userId = req.params.id as string;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any } as any
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Topic Management
app.post('/api/admin/topics', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, orderIndex } = req.body;
    const topic = await prisma.topic.create({
      data: { name, description, orderIndex: parseInt(orderIndex) }
    });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: 'Error creating topic' });
  }
});

app.put('/api/admin/topics/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, orderIndex } = req.body;
    const topicId = req.params.id as string;
    const topic = await prisma.topic.update({
      where: { id: topicId },
      data: { name, description, orderIndex: parseInt(orderIndex) }
    });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: 'Error updating topic' });
  }
});

app.delete('/api/admin/topics/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const topicId = req.params.id as string;
    await prisma.topic.delete({ where: { id: topicId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting topic' });
  }
});

// Problem Management
app.post('/api/admin/problems', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, link, difficulty, topicId, orderIndex } = req.body;
    const problem = await prisma.problem.create({
      data: { title, link, difficulty, topicId, orderIndex: parseInt(orderIndex) }
    });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Error creating problem' });
  }
});

app.put('/api/admin/problems/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, link, difficulty, topicId, orderIndex } = req.body;
    const probId = req.params.id as string;
    const problem = await prisma.problem.update({
      where: { id: probId },
      data: { title, link, difficulty, topicId, orderIndex: parseInt(orderIndex) }
    });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Error updating problem' });
  }
});

app.delete('/api/admin/problems/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const probId = req.params.id as string;
    await prisma.problem.delete({ where: { id: probId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting problem' });
  }
});

// 5. Get Activity Data for Heatmap
app.get('/api/analytics/activity', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const progress = await prisma.progress.findMany({
      where: { userId, status: 'DONE' },
      select: { completedAt: true }
    });

    const activity: Record<string, number> = {};
    progress.forEach(p => {
      if (p.completedAt) {
        const date = p.completedAt.toISOString().split('T')[0];
        activity[date] = (activity[date] || 0) + 1;
      }
    });

    const formattedActivity = Object.entries(activity).map(([date, count]) => ({
      date,
      count
    }));

    res.json(formattedActivity);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Update LeetCode Username
app.patch('/api/user/leetcode', requireAuth, async (req: Request, res: Response) => {
  try {
    const { leetcodeUsername } = req.body;
    const userId = req.user!.id;

    await prisma.user.update({
      where: { id: userId },
      data: { leetcodeUsername } as any
    });

    res.json({ success: true, leetcodeUsername });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update username' });
  }
});

// 7. Sync LeetCode Data
app.post('/api/user/sync-leetcode', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } }) as any;

    if (!user?.leetcodeUsername) {
      return res.status(400).json({ error: 'LeetCode username not set' });
    }

    const data = await fetchLeetCodeSolvedProblems(user.leetcodeUsername);
    const recentSubmissions = data.recentSubmissionList || [];
    
    // Filter only Accepted submissions
    const acceptedSubmissions = recentSubmissions.filter((s: any) => s.statusDisplay === 'Accepted');
    
    const results = [];
    for (const sub of acceptedSubmissions) {
      // Find matching problem in our DB
      const problem = await prisma.problem.findFirst({
        where: {
          OR: [
            { title: { equals: sub.title, mode: 'insensitive' } },
            { link: { contains: sub.titleSlug } }
          ]
        }
      });

      if (problem) {
        // Auto-mark as DONE (upsert ensures we don't duplicate)
        await prisma.progress.upsert({
          where: { userId_problemId: { userId, problemId: problem.id } },
          update: { 
            status: 'DONE',
            completedAt: new Date(sub.timestamp * 1000)
          },
          create: {
            userId,
            problemId: problem.id,
            status: 'DONE',
            completedAt: new Date(sub.timestamp * 1000)
          }
        });
        results.push(problem.title);
      }
    }

    res.json({ success: true, syncedCount: results.length, syncedProblems: results });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ error: 'Failed to sync with LeetCode' });
  }
});

// 8. Challenge Modes (Interview Training)
app.post('/api/challenges/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const { topicId, duration } = req.body;
    const userId = req.user!.id;

    // Pick random problems from topic
    const problems = await prisma.problem.findMany({
      where: { topicId },
      take: 2 // Assign 2 problems
    });

    if (problems.length === 0) {
      return res.status(404).json({ error: 'No problems found for this topic' });
    }

    // Shuffle and pick
    const shuffled = problems.sort(() => 0.5 - Math.random());
    const assignedIds = shuffled.slice(0, 2).map(p => p.id);

    const session = await (prisma as any).challengeSession.create({
      data: {
        userId,
        problemIds: assignedIds,
        duration: parseInt(duration) || 30, // Default 30 mins
      }
    });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start challenge' });
  }
});

app.get('/api/challenges/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const session = await (prisma as any).challengeSession.findUnique({
      where: { id: req.params.id },
    }) as any;

    if (!session) return res.status(404).json({ error: 'Session not found' });

    const problems = await prisma.problem.findMany({
      where: { id: { in: session.problemIds } },
      include: { topic: true }
    });

    res.json({ ...session, problems });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching session' });
  }
});

app.post('/api/challenges/:id/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body; // COMPLETED or FAILED
    const session = await (prisma as any).challengeSession.update({
      where: { id: req.params.id },
      data: { 
        status: status as any,
        endTime: new Date()
      }
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Error completing session' });
  }
});

// 9. AI Pattern Mentor
app.post('/api/ai/hint', requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.body;
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { topic: true }
    });

    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const hint = await getAIHint(problem.title, problem.topic.name, problem.difficulty);
    res.json({ hint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Error' });
  }
});

app.get('/api/ai/pattern/:topicId', requireAuth, async (req: Request, res: Response) => {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: req.params.topicId as string }
    });

    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const explanation = await getPatternExplanation(topic.name);
    res.json({ explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Error' });
  }
});

// === SERVER START ===
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
