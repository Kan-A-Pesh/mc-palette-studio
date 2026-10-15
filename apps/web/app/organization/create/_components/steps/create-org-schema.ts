import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().trim().min(1, { error: "Organization name is required" }),
});

export type CreateOrgValues = z.infer<typeof createOrgSchema>;
