import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(3, { error: "Name must be at least 3 characters long" }),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      error: "Password must contain at least 1 uppercase letter",
    })
    .regex(/[0-9]/, { error: "Password must contain at least 1 number" }),
});
