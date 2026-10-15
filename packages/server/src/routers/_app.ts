import { base } from "../context";

import { authRouter } from "./auth/router";
import { exampleRouter } from "./example/router";
import { userRouter } from "./user/router";
import { organizationRouter } from "./organization/router";

export type { CombinedMember } from "./organization/utils/combine-members";

export const appRouter = base.router({
  auth: authRouter,
  example: exampleRouter,
  user: userRouter,
  organization: organizationRouter,
});
