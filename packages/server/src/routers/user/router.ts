import { call } from "@orpc/server";
import { base } from "../../context";
import {
  checkEmailExistsBase,
  checkEmailExistsHandler,
  getMeBase,
  getMeHandler,
  getUserProfileBase,
  getUserProfileHandler,
  getUserWithSubscriptionBase,
  getUserWithSubscriptionHandler,
} from "./queries";
import { emailCheckRateLimiter } from "./utils/email-check-rate-limiter";

export const userRouter = base.router({
  getMe: getMeBase.route({ method: "GET" }).handler(async ({ context }) => {
    return await call(getMeHandler, undefined, {
      context,
    });
  }),

  getUserProfile: getUserProfileBase
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return await call(getUserProfileHandler, undefined, {
        context,
      });
    }),

  getUserWithSubscription: getUserWithSubscriptionBase
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return await call(getUserWithSubscriptionHandler, undefined, {
        context,
      });
    }),

  checkEmailExists: checkEmailExistsBase
    .route({ method: "GET" })
    .use(emailCheckRateLimiter)
    .handler(async ({ input, context }) => {
      return await call(checkEmailExistsHandler, input, {
        context,
      });
    }),
});
