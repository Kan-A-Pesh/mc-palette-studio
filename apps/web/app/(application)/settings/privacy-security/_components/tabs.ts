import {
  RiDeleteBin2Line,
  RiDeviceLine,
  RiLockLine,
  RiShieldUserLine,
} from "@repo/ui/icon";

import ActiveSessions from "./active-sessions/active-sessions";
import ChangePassword from "./change-password";
import DeleteAccount from "./delete-account";
import TwoFactorSecurity from "./two-factor-security";

// Define tab keys for translation rather than using static translations
export const privacySecurityTabs = [
  {
    slug: "change-password",
    key: "changePassword", // Key for translation
    icon: RiLockLine,
    component: ChangePassword,
  },
  {
    slug: "2fa-security",
    key: "twoFactorSecurity", // Key for translation
    icon: RiShieldUserLine,
    component: TwoFactorSecurity,
  },
  {
    slug: "active-sessions",
    key: "activeSessions", // Key for translation
    icon: RiDeviceLine,
    component: ActiveSessions,
  },
  {
    slug: "delete-account",
    key: "deleteAccount", // Key for translation
    icon: RiDeleteBin2Line,
    component: DeleteAccount,
  },
] as const;
