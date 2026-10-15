import { z } from "zod";

export const checkEmailExistsSchema = z.object({
  email: z.email(),
});
