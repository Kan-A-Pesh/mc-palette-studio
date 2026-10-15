import { authenticatedMiddleware } from "../middleware/authenticated.middleware";
import { publicProcedure } from "./public.procedure";

export const authenticatedProcedure = publicProcedure.use(
  authenticatedMiddleware,
);
