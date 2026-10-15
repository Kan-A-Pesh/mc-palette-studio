import { z } from "zod";
import type { EventDefinition } from "../lib/types";

export const serverEvents = {
  "notification:send": {
    input: z.object({
      userId: z.string(),
      title: z.string(),
      message: z.string(),
    }),
  },

  "room:broadcast": {
    input: z.object({
      roomId: z.string(),
      event: z.string(),
      data: z.unknown(),
    }),
  },
} as const satisfies Record<string, EventDefinition>;

export type ServerEvents = typeof serverEvents;
export type ServerEventName = keyof ServerEvents;
export type ServerEventInput<E extends ServerEventName> = z.infer<
  ServerEvents[E]["input"]
>;
