import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, { error: "Password is required" }),
  rememberMe: z.boolean().default(false),
});
