import { env } from "@repo/env/apps-web";
import { Stripe } from "stripe";

// Stripe rejects an empty key at construction; the placeholder lets the app
// boot without STRIPE_SECRET_KEY and only fails when billing is called.
export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY ?? "sk_unset", {
  apiVersion: "2025-11-17.clover",
});
