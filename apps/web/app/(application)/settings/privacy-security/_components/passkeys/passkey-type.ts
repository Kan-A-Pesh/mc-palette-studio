import type { authClient } from "@/lib/auth/auth-client";

// As the Passkey type is not exported from the authClient,
// we need to define it here with a little "hack"
export type Passkey = NonNullable<
  Awaited<ReturnType<typeof authClient.useListPasskeys>>["data"]
>[number];
