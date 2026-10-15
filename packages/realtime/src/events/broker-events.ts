import { z } from "zod";
import type { PayloadDefinition } from "../lib/types";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const brokerEvents = {
  "connection:info": {
    payload: z.object({
      user: z.object({
        id: z.string(),
        name: z.string(),
      }),
    }),
  },

  "notification:new": {
    payload: z.object({
      title: z.string(),
      message: z.string(),
    }),
  },

  "message:new": {
    payload: z.object({
      roomId: z.string(),
      user: userSchema,
      content: z.string(),
      timestamp: z.number(),
    }),
  },

  "cursor:update": {
    payload: z.object({
      roomId: z.string(),
      user: userSchema,
      x: z.number(),
      y: z.number(),
    }),
  },

  "room:sync": {
    payload: z.object({
      roomId: z.string(),
      users: z.array(userSchema),
    }),
  },

  "doc:sync": {
    payload: z.object({
      documentId: z.string(),
      state: z.string(),
    }),
  },

  "doc:update": {
    payload: z.object({
      documentId: z.string(),
      update: z.string(),
    }),
  },

  "doc:awareness": {
    payload: z.object({
      documentId: z.string(),
      awareness: z.string(),
    }),
  },
} as const satisfies Record<string, PayloadDefinition>;

export type BrokerEvents = typeof brokerEvents;
export type BrokerEventName = keyof BrokerEvents;
export type BrokerEventPayload<E extends BrokerEventName> = z.infer<
  BrokerEvents[E]["payload"]
>;
