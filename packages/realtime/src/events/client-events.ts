import { z } from "zod";
import type { EventDefinition } from "../lib/types";

export const clientEvents = {
  "room:join": {
    input: z.object({
      roomId: z.string(),
    }),
  },

  "room:leave": {
    input: z.object({
      roomId: z.string(),
    }),
  },

  "message:send": {
    input: z.object({
      roomId: z.string(),
      content: z.string(),
    }),
  },

  "cursor:move": {
    input: z.object({
      roomId: z.string(),
      x: z.number(),
      y: z.number(),
    }),
  },

  "doc:join": {
    input: z.object({
      documentId: z.string(),
    }),
  },

  "doc:leave": {
    input: z.object({
      documentId: z.string(),
    }),
  },

  "doc:update": {
    input: z.object({
      documentId: z.string(),
      update: z.string(),
    }),
  },

  "doc:awareness": {
    input: z.object({
      documentId: z.string(),
      awareness: z.string(),
    }),
  },
} as const satisfies Record<string, EventDefinition>;

export type ClientEvents = typeof clientEvents;
export type ClientEventName = keyof ClientEvents;
export type ClientEventInput<E extends ClientEventName> = z.infer<
  ClientEvents[E]["input"]
>;
