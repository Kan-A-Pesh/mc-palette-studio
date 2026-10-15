import { StandardRPCJsonSerializer } from "@orpc/client/standard";

export const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: [
    // You can add custom serializers here
  ],
});
