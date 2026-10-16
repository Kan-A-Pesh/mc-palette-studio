export const BASE_URL =
  process.env.VERCEL_ENV === "preview"
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000";

export const PROJECT = {
  NAME: "Palette Studio",
  COMPANY: "Impulse Lab",
  DOMAIN: BASE_URL.replace(/^https?:\/\//, ""),
  HELP_EMAIL: "michel@impulselab.ai",
} as const;
