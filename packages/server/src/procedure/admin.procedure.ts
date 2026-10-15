import { adminMiddleware } from "../middleware/admin.middleware";
import { authenticatedProcedure } from "./authenticated.procedure";

export const adminProcedure = authenticatedProcedure.use(adminMiddleware);
