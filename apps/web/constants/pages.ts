export const PAGES = {
  MARKETING: {
    HOME: "/",
    PRIVACY_POLICY: "/privacy-policy",
    TERMS_AND_CONDITIONS: "/terms-and-conditions",
  },
  AUTH: {
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFICATION: "/verification",
    CONFIRM_2FA: "/confirm-2fa",
  },
  EXAMPLES: {
    DOCUMENTS: "/documents",
    CHAT: "/chat",
  },
  APPLICATION: {
    DASHBOARD: "/dashboard",
    SETTINGS: {
      ROOT: "/settings",
      ACCOUNT: "/settings/account",
      PRIVACY_SECURITY: "/settings/privacy-security",
    },
    ORG_SETTINGS: {
      GENERAL: "/org-settings/general",
      MEMBERS: "/org-settings/members",
    },
  },
  ORGANIZATION: {
    CREATE: "/organization/create",
    INVITATIONS: "/organization/invitations",
    INVITE: "/organization/invite",
  },
  ADMIN: {
    HOME: "/admin",
    USERS: "/admin/users",
    SETTINGS: "/admin/settings",
  },
} as const;
