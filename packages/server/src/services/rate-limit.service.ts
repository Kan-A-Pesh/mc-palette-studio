import { redis } from "@repo/database/redis";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  totalRequests: number;
  remainingRequests: number;
  resetTimeMs: number;
  retryAfterSeconds: number;
  windowMs: number;
  isLimitExceeded: boolean;
}

function getClientIP(headers: Headers | undefined): string {
  return (
    headers?.get("x-forwarded-for")?.split(",")[0] ||
    headers?.get("x-real-ip") ||
    headers?.get("cf-connecting-ip") ||
    "unknown"
  );
}

class RateLimitService {
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const window = Math.floor(now / config.windowMs);
    const windowKey = `${config.keyPrefix}:${identifier}:${window}`;

    const current = await redis.incr(windowKey);

    if (current === 1) {
      await redis.expire(windowKey, Math.ceil(config.windowMs / 1000));
    }

    const resetTimeMs = (window + 1) * config.windowMs;
    const remainingRequests = Math.max(0, config.maxRequests - current);
    const retryAfterSeconds = Math.ceil((resetTimeMs - now) / 1000);
    const isLimitExceeded = current > config.maxRequests;

    return {
      totalRequests: current,
      remainingRequests,
      resetTimeMs,
      retryAfterSeconds,
      windowMs: config.windowMs,
      isLimitExceeded,
    };
  }

  async checkIPRateLimit(
    headers: Headers | undefined,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const clientIP = getClientIP(headers);
    const identifier = `ip:${clientIP}`;
    return await this.checkRateLimit(identifier, config);
  }
}

export const rateLimitService = new RateLimitService();
