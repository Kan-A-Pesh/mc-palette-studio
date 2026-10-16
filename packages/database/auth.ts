import "@repo/env/load-env";
import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  emailOTP,
  lastLoginMethod,
  twoFactor,
  organization,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { emailHarmony } from "better-auth-harmony";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, subscription } from "../database";
import { BASE_URL } from "@repo/env/constants";
import { PROJECT } from "@repo/env/constants";
import { sendEmail } from "@repo/email";
import { env } from "@repo/env/apps-web";
import { stripe } from "@better-auth/stripe";
import { stripeClient } from "./stripe/stripe";
import { redis } from "./redis";
import { eq } from "drizzle-orm";
import { getUserOrganizations } from "./utils/get-user-organizations";
import { ac, roles } from "./organization/permissions";

export { ac, roles };

export const auth = betterAuth({
  appName: PROJECT.NAME,
  // Without BETTER_AUTH_SECRET the app still boots with a random per-process
  // secret. Sessions stay unforgeable but are not shared across instances or
  // restarts: set a stable BETTER_AUTH_SECRET whenever auth is actually used.
  secret: env.BETTER_AUTH_SECRET ?? randomBytes(32).toString("hex"),
  baseURL: BASE_URL,
  trustedOrigins: [BASE_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  session: {
    freshAge: 0,
  },
  telemetry: { enabled: false },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }, request) => {
      const host = request?.headers.get("host") ?? "localhost:3000";

      await sendEmail(
        "reset-password",
        { name: user.name, url, host },
        {
          to: user.email,
          subject: `Reset your password for ${PROJECT.NAME}`,
        },
      );
    },
  },
  plugins: [
    emailOTP({
      generateOTP: () => {
        if (env.NODE_ENV === "development") {
          return "123456";
        }

        // Generate a cryptographically secure 6-digit code
        const randomBytes = crypto.getRandomValues(new Uint8Array(4));
        const randomNumber = randomBytes.reduce(
          (acc, byte, i) => acc + byte * 256 ** i,
          0,
        );
        return String(randomNumber % 1_000_000).padStart(6, "0");
      },
      async sendVerificationOTP({ email, otp }, request) {
        if (env.NODE_ENV === "development") {
          return;
        }

        const host = request?.headers?.get("host") ?? "localhost:3000";

        await sendEmail(
          "verify-email",
          { otp, host, email },
          {
            to: email,
            subject: `Your verification code for ${PROJECT.NAME}`,
          },
        );
      },
    }),
    admin(),
    emailHarmony(),
    lastLoginMethod(),
    passkey({
      origin: BASE_URL,
      rpName: PROJECT.NAME,
      rpID: new URL(BASE_URL).hostname,
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }, request) {
          const host = request?.headers?.get("host") ?? "localhost:3000";

          await sendEmail(
            "2fa-otp",
            { otp, host, name: user.name },
            {
              to: user.email,
              subject: `Your 2FA verification code for ${PROJECT.NAME}`,
            },
          );
        },
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET ?? "",
      createCustomerOnSignUp: true,
      subscription: {
        getCheckoutSessionParams: () => {
          return {
            params: {
              tax_id_collection: {
                enabled: true,
              },
            },
          };
        },
        enabled: true,
        plans: [],
        authorizeReference: async ({ user, referenceId }) => {
          const userOrganizations = await getUserOrganizations(user.id);
          const organization = userOrganizations.find(
            (org) => org.id === referenceId,
          );
          return (
            organization?.role === "owner" || organization?.role === "admin"
          );
        },
      },
    }),
    organization({
      async sendInvitationEmail({ id, email, organization, inviter }, request) {
        const host = request?.headers.get("host") ?? "localhost:3000";

        await sendEmail(
          "organization-invitation",
          {
            email,
            organization: organization.name,
            inviter: {
              name: inviter.user.name,
              email: inviter.user.email,
            },
            url: `${BASE_URL}/organization/invite/${id}`,
            host,
          },
          {
            to: email,
            subject: `You're invited to join ${organization.name} on ${PROJECT.NAME}`,
          },
        );
      },
      ac,
      roles,
    }),
    nextCookies(),
  ],
  // Without REDIS_URL, Better Auth keeps sessions in the database only.
  secondaryStorage: env.REDIS_URL
    ? {
        get: async (key) => await redis.get(key),
        set: async (key, value, ttl) => {
          if (ttl) {
            await redis.set(key, value, "EX", ttl);
          } else {
            await redis.set(key, value);
          }
        },
        delete: async (key) => {
          await redis.del(key);
          return;
        },
      }
    : undefined,
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url, user }) => {
        await sendEmail(
          "change-email",
          {
            url,
            name: user.name,
            newEmail,
          },
          {
            to: user.email,
            subject: `Verify your new email address for ${PROJECT.NAME}`,
          },
        );
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const subscriptions = await db.query.subscription.findMany({
          where: eq(subscription.referenceId, user.id),
        });

        const activeSubscription = subscriptions.find(
          (sub) => sub.status === "active" || sub.status === "trialing",
        );

        if (activeSubscription) {
          throw new Error(
            "Cannot delete account with an active subscription. Please cancel your subscription first.",
          );
        }
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userOrganizations = await getUserOrganizations(session.userId);

          return {
            data: {
              ...session,
              activeOrganizationId: userOrganizations[0]?.id ?? null,
            },
          };
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
