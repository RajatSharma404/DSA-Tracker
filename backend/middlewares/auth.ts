import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { prisma } from "../db/prisma";
import { notifyLogin } from "../services/emailService";
import { TtlCache } from "../utils/cache";

export const BACKEND_JWT_SECRET =
  process.env.BACKEND_JWT_SECRET?.trim() ||
  (process.env.NODE_ENV === "test"
    ? "development-backend-jwt-secret-at-least-32-bytes-long"
    : "");

export function getAuthSecrets(): string[] {
  const rawSecrets = [
    process.env.NEXTAUTH_SECRET,
    process.env.AUTH_SECRET,
    ...(process.env.AUTH_SECRETS ? process.env.AUTH_SECRETS.split(",") : []),
  ];
  return Array.from(
    new Set(
      rawSecrets
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => Boolean(s) && s !== "your-secret-key-here"),
    ),
  );
}

export const NEXTAUTH_SECRETS = getAuthSecrets();

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";

export interface CachedUser {
  id: string;
  email: string;
  role: string;
}

const DEFAULT_CACHE_TTL = process.env.USER_CACHE_TTL_MS
  ? parseInt(process.env.USER_CACHE_TTL_MS, 10)
  : 60 * 1000; // 1 minute default for tighter RBAC revocation

export const userCache = new TtlCache<string, CachedUser>({
  defaultTtlMs: DEFAULT_CACHE_TTL,
  maxSize: 1000,
});

const idToEmailMap = new Map<string, string>();

type CacheInvalidationListener = (identifier: string) => void;
const invalidationListeners: CacheInvalidationListener[] = [];

/**
 * Registers an invalidation listener for multi-node / distributed cache sync (e.g. Redis pub/sub).
 */
export function onUserCacheInvalidated(
  listener: CacheInvalidationListener,
): () => void {
  invalidationListeners.push(listener);
  return () => {
    const idx = invalidationListeners.indexOf(listener);
    if (idx !== -1) invalidationListeners.splice(idx, 1);
  };
}

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

  for (const listener of invalidationListeners) {
    try {
      listener(identifier);
    } catch (err) {
      console.error("[auth] Cache invalidation listener error:", err);
    }
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
  let decoded: { email: string; role: string; sub?: string } | null = null;
  let lastVerifyError: Error | null = null;

  // 1. Primary Modern Verification: Jose HS256, issuer dsa-web, audience dsa-api
  if (BACKEND_JWT_SECRET && BACKEND_JWT_SECRET.length >= 32) {
    try {
      const key = new TextEncoder().encode(BACKEND_JWT_SECRET);
      const { payload } = await jwtVerify(token, key, {
        algorithms: ["HS256"],
        issuer: "dsa-web",
        audience: "dsa-api",
      });

      if (payload.email && typeof payload.email === "string") {
        decoded = {
          email: payload.email,
          role: typeof payload.role === "string" ? payload.role : "USER",
          sub: typeof payload.sub === "string" ? payload.sub : undefined,
        };
      }
    } catch (err: any) {
      lastVerifyError = err;
    }
  }

  // 2. Transition Fallback: Only allowed when AUTH_ACCEPT_LEGACY === "true"
  if (!decoded && process.env.AUTH_ACCEPT_LEGACY === "true") {
    const candidateSecrets = getAuthSecrets();
    for (const secret of candidateSecrets) {
      try {
        const legacyDecoded = jwt.verify(token, secret) as {
          email?: string;
          role?: string;
          sub?: string;
        };
        if (legacyDecoded?.email) {
          decoded = {
            email: legacyDecoded.email,
            role: legacyDecoded.role ?? "USER",
            sub: legacyDecoded.sub,
          };
          break;
        }
      } catch (err: any) {
        lastVerifyError = err;
      }
    }
  }

  if (!decoded?.email) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[auth] Token verification failed: ${
          lastVerifyError?.message || "Invalid token structure"
        }. Verify BACKEND_JWT_SECRET synchronization.`,
      );
    }
    return null;
  }

  let user = userCache.get(decoded.email.toLowerCase());

  if (!user) {
    const dbUser = (await prisma.user.upsert({
      where: { email: decoded.email },
      update: {},
      create: {
        email: decoded.email,
        role: (decoded.role === "ADMIN" ? "ADMIN" : "USER") as any,
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
  } else if (decoded.role && user.role !== decoded.role) {
    // Sync role from verified token
    user.role = decoded.role;
    userCache.set(user.email.toLowerCase(), user);
  }

  void notifyLogin(decoded.email).catch(() => {});
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

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    req.user.role = dbUser.role;
    next();
  } catch (err) {
    console.error("[auth] Internal error during admin check:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
