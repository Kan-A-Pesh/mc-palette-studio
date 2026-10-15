import { call } from "@orpc/server";
import { base } from "../../context";
import { getExampleBase, getExampleHandler } from "./queries";

export const exampleRouter = base.router({
  getExample: getExampleBase
    .route({ method: "GET" })
    .handler(async ({ input, context }) => {
      return await call(getExampleHandler, input, { context });
    }),
});
