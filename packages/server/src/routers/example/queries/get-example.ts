import { publicProcedure } from "../../../procedure/public.procedure";
import { getExampleSchema } from "../validators";

export const getExampleBase = publicProcedure.input(getExampleSchema);

export const getExampleHandler = getExampleBase.handler(
  async ({ input, context }) => {
    return {
      pong: input.ping,
      userId: context.session?.user.id,
    };
  },
);
