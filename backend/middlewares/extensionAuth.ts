import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../db/prisma";
import { ExtensionDevice } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      extensionDevice?: ExtensionDevice;
    }
  }
}

const TOKEN_PREFIX_STR = "dsat_";

/**
 * Generates a cryptographically secure device pairing token.
 * Format: dsat_<32 random bytes base64url>
 */
export function generateDeviceToken(): { plaintext: string; tokenHash: string; tokenPrefix: string } {
  const randomBytes = crypto.randomBytes(32).toString("base64url");
  const plaintext = `${TOKEN_PREFIX_STR}${randomBytes}`;
  const tokenHash = hashDeviceToken(plaintext);
  const tokenPrefix = plaintext.slice(0, 10);
  return { plaintext, tokenHash, tokenPrefix };
}

/**
 * Computes the SHA-256 hash of a device pairing token for constant-time DB lookup.
 */
export function hashDeviceToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

/**
 * In-memory timestamp map to throttle DB lastUsedAt updates to once per minute per device.
 */
const lastUsedUpdateThrottle = new Map<string, number>();

/**
 * Middleware: requireExtensionToken
 * Validates Bearer token, hashes it, performs constant-time comparison,
 * verifies revocation and expiration, throttles lastUsedAt updates,
 * and attaches req.extensionDevice and req.user.
 * Emits a generic 401 with no detail leakage on any failure.
 */
export async function requireExtensionToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7).trim();
  if (!token.startsWith(TOKEN_PREFIX_STR) || token.length < 32) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const candidateHash = hashDeviceToken(token);
    const candidateHashBuf = Buffer.from(candidateHash, "hex");

    const device = await prisma.extensionDevice.findUnique({
      where: { tokenHash: candidateHash },
      include: { user: { select: { id: true, role: true } } },
    });

    if (!device || !device.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const storedHashBuf = Buffer.from(device.tokenHash, "hex");
    if (
      candidateHashBuf.length !== storedHashBuf.length ||
      !crypto.timingSafeEqual(candidateHashBuf, storedHashBuf)
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (device.revokedAt) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (device.expiresAt && device.expiresAt.getTime() <= Date.now()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Throttle lastUsedAt update to at most once per 60 seconds
    const now = Date.now();
    const lastUpdated = lastUsedUpdateThrottle.get(device.id) ?? 0;
    if (now - lastUpdated > 60_000) {
      lastUsedUpdateThrottle.set(device.id, now);
      prisma.extensionDevice
        .update({
          where: { id: device.id },
          data: { lastUsedAt: new Date(now) },
        })
        .catch(() => {});
    }

    req.extensionDevice = device;
    req.user = { id: device.user.id, role: device.user.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

