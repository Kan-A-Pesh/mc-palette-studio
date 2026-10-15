import { call } from "@orpc/server";
import { base } from "../../context";
import { banMultipleUsersBase, banMultipleUsersHandler } from "./mutations";
import { listUsersBase, listUsersHandler } from "./queries";

export const authRouter = base.router({
  listUsers: listUsersBase
    .route({ method: "GET" })
    .meta({ roles: ["admin"] })
    .handler(async ({ input, context }) => {
      return await call(listUsersHandler, input, {
        context,
      });
    }),

  banMultipleUsers: banMultipleUsersBase
    .route({ method: "PATCH" })
    .meta({ roles: ["admin"] })
    .handler(async ({ input, context }) => {
      return await call(banMultipleUsersHandler, input, {
        context,
      });
    }),
});
