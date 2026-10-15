import { z } from "zod";

export const listUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  sortBy: z
    .enum(["user", "waitlistStatus", "role", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().nullable(),
  role: z.enum(["admin", "user", "all"]).optional(),
  waitlistStatus: z.enum(["approved", "pending", "rejected", "all"]).optional(),
});

export const banMultipleUsersSchema = z.object({
  userIds: z.array(z.string()).min(1),
});
