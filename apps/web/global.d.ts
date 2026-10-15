// global.d.ts

import type { OperationKey } from "@orpc/tanstack-query";

interface MutationMeta extends Record<string, unknown> {
  invalidateQueries?: OperationKey[];
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: MutationMeta;
  }
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- generic params are required to match the augmented declaration signature even though unused here
  interface ColumnMeta<_TData extends RowData, _TValue> {
    className?: string;
  }
}
