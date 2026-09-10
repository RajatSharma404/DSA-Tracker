import { PrismaClient } from "@prisma/client";

/**
 * Ensures PostgreSQL connection pool parameters (connection_limit, pool_timeout, connect_timeout)
 * are configured on the database connection string.
 */
export function formatDatabaseUrlWithPoolConfig(
  rawUrl?: string,
): string | undefined {
  const targetUrl =
    arguments.length > 0 ? rawUrl : process.env.DATABASE_URL;
  if (!targetUrl) return undefined;

  try {
    if (targetUrl.startsWith("postgresql://") || targetUrl.startsWith("postgres://")) {
      const parsed = new URL(targetUrl);
      if (!parsed.searchParams.has("connection_limit")) {
        parsed.searchParams.set(
          "connection_limit",
          process.env.DB_CONNECTION_LIMIT || "20",
        );
      }
      if (!parsed.searchParams.has("pool_timeout")) {
        parsed.searchParams.set(
          "pool_timeout",
          process.env.DB_POOL_TIMEOUT || "10",
        );
      }
      if (!parsed.searchParams.has("connect_timeout")) {
        parsed.searchParams.set(
          "connect_timeout",
          process.env.DB_CONNECT_TIMEOUT || "5",
        );
      }
      return parsed.toString();
    }
  } catch {
    // If parsing fails, fall back to targetUrl
  }

  return targetUrl;
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const databaseUrl = formatDatabaseUrlWithPoolConfig();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Health check helper to verify database connectivity and response latency.
 */
export async function checkDatabaseHealth(): Promise<{
  ok: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      latencyMs: Date.now() - start,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || "Database health check failed",
    };
  }
}

export default prisma;
