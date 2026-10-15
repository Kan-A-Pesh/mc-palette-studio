import z from "zod";

export const verifyEmailSchema = z.object({
  otp: z
    .string()
    .min(6, { error: "OTP must be 6 digits long" })
    .max(6, { error: "OTP must be 6 digits long" })
    .regex(/^\d+$/, { error: "OTP must contain only numbers" }),
});
