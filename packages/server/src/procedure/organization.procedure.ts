import { organizationMiddleware } from "../middleware/organization.middleware";
import { authenticatedProcedure } from "./authenticated.procedure";

export const organizationProcedure = authenticatedProcedure.use(
  organizationMiddleware,
);
