import { createIPRateLimitMiddleware } from "../../../middleware/rate-limit.middleware";

export const emailCheckRateLimiter = createIPRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  keyPrefix: "email_check",
});
