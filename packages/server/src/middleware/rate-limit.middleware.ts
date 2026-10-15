import { base } from "../context";
import {
  type RateLimitConfig,
  rateLimitService,
} from "../services/rate-limit.service";

export function createIPRateLimitMiddleware(config: RateLimitConfig) {
  return base.middleware(async (opts) => {
    const { next, context, errors } = opts;

    const result = await rateLimitService.checkIPRateLimit(
      context?.headers,
      config,
    );

    if (result.isLimitExceeded) {
      throw errors.RATE_LIMIT_EXCEEDED({
        message: `Rate limit exceeded. Try again in ${result.retryAfterSeconds} seconds.`,
        data: {
          totalRequests: result.totalRequests,
          remainingRequests: result.remainingRequests,
          retryAfterSeconds: result.retryAfterSeconds,
        },
      });
    }

    return next(opts);
  });
}
