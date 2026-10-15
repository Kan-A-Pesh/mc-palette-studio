import type { account, subscription, user, verification } from "./auth";

export type User = typeof user.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Subscription = typeof subscription.$inferSelect;

export { USER_ROLES, ALL_USER_ROLES, type UserRole } from "../constants";
