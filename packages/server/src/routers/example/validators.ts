import { z } from "zod";

export const getExampleSchema = z.object({
  ping: z.string().optional(),
});
