import { z } from "zod";

export const confirm2FASchema = z.object({
  code: z.string().min(6).max(6),
  rememberDevice: z.boolean(),
});
