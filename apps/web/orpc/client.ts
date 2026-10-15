import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from "@orpc/server";
import {
  createTanstackQueryUtils,
  type RouterUtils,
} from "@orpc/tanstack-query";
import type { appRouter } from "@repo/server";
// This import is required for TypeScript to emit valid .d.ts declarations.
// Without it, exported values like `orpc` reference an internal
// @orpc/contract path in node_modules (TS2742). The namespace alias is unused at
// runtime but necessary for type resolution.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for TS2742 declaration emit; @orpc/contract types must be reachable
import type * as _orpcContract from "@orpc/contract";

import { orpcClient } from "./orpc-client";

export type RouterInput = InferRouterInputs<typeof appRouter>;
export type RouterOutput = InferRouterOutputs<typeof appRouter>;

// Explicit annotation required: without it TypeScript emits TS2742 because the
// inferred type references an internal @orpc/contract path in node_modules.
export const orpc: RouterUtils<RouterClient<typeof appRouter>> =
  createTanstackQueryUtils(orpcClient);
