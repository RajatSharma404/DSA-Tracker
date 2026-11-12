import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitStore {
  limit(identifier: string): Promise<RateLimitResult>;
}

class InMemoryRateLimitStore implements RateLimitStore {
  private readonly max: number;
  private readonly windowMs: number;
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(max: number = 60, windowSeconds: number = 60) {
    this.max = max;
    this.windowMs = windowSeconds * 1000;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.hits.get(identifier);

    if (!entry || now > entry.resetAt) {
      const resetAt = now + this.windowMs;
      this.hits.set(identifier, { count: 1, resetAt });
      return {
        success: true,
        limit: this.max,
        remaining: this.max - 1,
        reset: resetAt,
      };
    }

    entry.count += 1;
    const remaining = Math.max(0, this.max - entry.count);
    return {
      success: entry.count <= this.max,
      limit: this.max,
      remaining,
      reset: entry.resetAt,
    };
  }
}

class UpstashRateLimitStore implements RateLimitStore {
  private readonly ratelimit: Ratelimit;
  private readonly max: number;

  constructor(url: string, token: string, max: number = 60, windowSeconds: number = 60) {
    this.max = max;
    const redis = new Redis({ url, token });
    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      analytics: false,
      prefix: "ratelimit",
    });
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    try {
      const res = await this.ratelimit.limit(identifier);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch {
      // Degrade gracefully on Redis network outage
      return {
        success: true,
        limit: this.max,
        remaining: this.max,
        reset: Date.now() + 60000,
      };
    }
  }
}

export function createRateLimitStore(max: number = 60, windowSeconds: number = 60): RateLimitStore {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && process.env.NODE_ENV !== "test") {
    return new UpstashRateLimitStore(url, token, max, windowSeconds);
  }

  return new InMemoryRateLimitStore(max, windowSeconds);
}

