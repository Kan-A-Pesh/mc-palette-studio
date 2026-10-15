import { env } from "@repo/env/apps-web";
import { Stripe } from "stripe";

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});
