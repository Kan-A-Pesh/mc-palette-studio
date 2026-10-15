import { PAGES } from "@/constants/pages";

export const actions = {
  [PAGES.AUTH.SIGN_IN]: {
    text: "Sign in to your account",
    link: {
      label: "Sign up",
      href: PAGES.AUTH.SIGN_UP,
    },
  },
  [PAGES.AUTH.SIGN_UP]: {
    text: "Create an account",
    link: {
      label: "Sign in",
      href: PAGES.AUTH.SIGN_IN,
    },
  },
  [PAGES.AUTH.FORGOT_PASSWORD]: {
    text: "Forgot your password?",
    link: {
      label: "Sign in",
      href: PAGES.AUTH.SIGN_IN,
    },
  },
  [PAGES.AUTH.VERIFICATION]: {
    text: "Verify your email",
    link: {
      label: "Sign in",
      href: PAGES.AUTH.SIGN_IN,
    },
  },
  [PAGES.AUTH.RESET_PASSWORD]: {
    text: "Reset your password",
    link: {
      label: "Sign in",
      href: PAGES.AUTH.SIGN_IN,
    },
  },
  [PAGES.AUTH.CONFIRM_2FA]: {
    text: "Confirm your access",
    link: {
      label: "Sign in",
      href: null,
    },
  },
} as const;
