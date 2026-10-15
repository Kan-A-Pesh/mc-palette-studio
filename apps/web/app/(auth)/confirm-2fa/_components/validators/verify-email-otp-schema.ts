import { z } from "zod";

export const verifyEmailOTPSchema = z.object({
  code: z.string().min(6).max(6),
});
