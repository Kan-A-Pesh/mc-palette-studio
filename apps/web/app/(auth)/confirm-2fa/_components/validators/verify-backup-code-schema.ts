import { z } from "zod";

export const verifyBackupCodeSchema = z.object({
  code: z.string().min(8).max(12),
});
