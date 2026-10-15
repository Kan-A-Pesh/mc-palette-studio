import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { error: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, {
        error: "Password must contain at least 1 uppercase letter",
      })
      .regex(/[0-9]/, {
        error: "Password must contain at least 1 number",
      }),
    confirmPassword: z
      .string()
      .min(8, {
        error: "Confirm password must be at least 8 characters long",
      })
      .regex(/[A-Z]/, {
        error: "Confirm password must contain at least 1 uppercase letter",
      })
      .regex(/[0-9]/, {
        error: "Confirm password must contain at least 1 number",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });
