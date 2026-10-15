import { z } from "zod";

export const verifyTOTPSchema = z.object({
  code: z.string().min(6).max(6),
});
