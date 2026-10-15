import { z } from "zod";

export const getInvitationSchema = z.object({
  id: z.string().ulid(),
});

export const listMembersSchema = z.object({
  tab: z.string().default("all"),
  search: z.string().default(""),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
});
