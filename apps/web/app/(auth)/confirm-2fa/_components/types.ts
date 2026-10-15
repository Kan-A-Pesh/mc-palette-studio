export type AuthError = {
  code?: string | undefined;
  message?: string | undefined;
  t?: unknown;
  status: number;
  statusText: string;
};

// Authentication step types
export type AuthStep = "totp" | "backup" | "email" | "recovery";
