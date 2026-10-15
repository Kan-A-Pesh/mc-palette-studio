import { z } from "zod";

export const updateOrganizationProfileSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  logo: z.url().optional(),
});
