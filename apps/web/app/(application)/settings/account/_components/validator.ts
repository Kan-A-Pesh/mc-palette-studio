import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  image: z.url().optional(),
});
