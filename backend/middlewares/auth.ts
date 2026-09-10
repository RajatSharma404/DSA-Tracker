import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import { notifyLogin } from "../services/emailService";
import { TtlCache } from "../utils/cache";

export function getAuthSecrets(): string[] {
  return Array.from(
    new Set(
      [process.env.NEXTAUTH_SECRET, process.env.AUTH_SECRET]
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean),
    ),
  );
}

export const NEXTAUTH_SECRETS = getAuthSecrets();

if (process.env.NODE_ENV !== "test" && getAuthSecrets().length === 0) {
  throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) is required");
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";

export interface CachedUser {
  id: string;
  email: string;
  role: string;
}

export const userCache = new TtlCache<string, CachedUser>({
  defaultTtlMs: 5 * 60 * 1000, // 5 minutes TTL
  maxSize: 1000,
});

const idToEmailMap = new Map<string, string>();

/**
 * Invalidates cached user entries by email, userId, or both.
 */
export function invalidateUserCache(identifier: string): void {
  if (!identifier) return;
  const normalized = identifier.trim().toLowerCase();
  userCache.delete(normalized);

  const mappedEmail = idToEmailMap.get(identifier);
  if (mappedEmail) {
    userCache.delete(mappedEmail);
    idToEmailMap.delete(identifier);
  }
}

/**
 * Clears the user cache entirely (useful for test runs or bulk role updates).
 */
export function clearUserCache(): void {
  userCache.clear();
  idToEmailMap.clear();
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export const resolveAuthenticatedUser = async (authHeader?: string) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  let decoded: { email: string; role: string } | null = null;

  const secrets = getAuthSecrets();
  const candidateSecrets = secrets.length > 0 ? secrets : NEXTAUTH_SECRETS;

  for (const secret of candidateSecrets) {
    try {
      decoded = jwt.verify(token, secret) as {
        email: string;
        role: string;
      };
      break;
    } catch {
      // Try next secret candidate.
    }
  }

  if (!decoded?.email) {
    return null;
  }

  let user = userCache.get(decoded.email.toLowerCase());

  if (!user) {
    const dbUser = (await prisma.user.upsert({
      where: { email: decoded.email },
      update: {},
      create: {
        email: decoded.email,
        role: "USER",
      },
    })) as any;

    user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };

    if (
      ADMIN_EMAIL &&
      user.email.toLowerCase() === ADMIN_EMAIL &&
      user.role !== "ADMIN"
    ) {
      const promoted = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" } as any,
      });
      user.role = promoted.role;
    }

    idToEmailMap.set(user.id, user.email.toLowerCase());
    userCache.set(user.email.toLowerCase(), user);
  }

  await notifyLogin(decoded.email);
  return { id: user.id, role: user.role };
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await resolveAuthenticatedUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({
        error: req.headers.authorization
          ? "Unauthorized: Invalid or expired token"
          : "Unauthorized: No token provided",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[auth] Internal authentication error:", err);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

export const attachOptionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const user = await resolveAuthenticatedUser(req.headers.authorization);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    console.error("[auth] Optional auth resolution error:", err);
  }
  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};
