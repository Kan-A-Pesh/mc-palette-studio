import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  lastLoginMethodClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { redirect } from "next/navigation";

import type { AccessControl } from "better-auth/plugins/access";
import type { auth } from "@repo/database/auth";
import { ac, roles } from "@repo/database/organization";

import { passkeyClient } from "@better-auth/passkey/client";
import { PAGES } from "@/constants/pages";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    adminClient(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        redirect(
          `${PAGES.AUTH.CONFIRM_2FA}?next=${PAGES.APPLICATION.DASHBOARD}`,
        );
      },
    }),
    stripeClient({
      subscription: true,
    }),
    organizationClient({
      // TODO(see https://github.com/impulse-studio/ultimate-template/issues): `ac as AccessControl` cast is required — Better Auth's `organizationClient` generic
      // rejects the specific return type of `createAccessControl(statements)`. Cast only at this
      // client boundary; keep strict typing in the shared `@repo/database/organization` module.
      ac: ac as AccessControl,
      roles,
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
    lastLoginMethodClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
