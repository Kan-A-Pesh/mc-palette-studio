import { z } from "zod";

export const inviteMembersSchema = z.object({
  members: z
    .array(
      z.object({
        email: z.email({ error: "Invalid email address" }).or(z.literal("")),
        role: z.enum(["owner", "admin", "member"]),
      }),
    )
    .refine(
      (members) => members.some((m) => m.email.trim() !== ""),
      "Add at least one member",
    )
    .refine((members) => {
      const seen = new Set<string>();
      for (const m of members) {
        const email = m.email.trim().toLowerCase();
        if (!email) continue;
        if (seen.has(email)) return false;
        seen.add(email);
      }
      return true;
    }, "Duplicate email addresses found"),
});

export type InviteMembersValues = z.infer<typeof inviteMembersSchema>;
