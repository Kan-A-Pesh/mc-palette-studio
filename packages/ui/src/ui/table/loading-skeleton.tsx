"use client";

import { motion } from "motion/react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import * as Table from "@/ui/base-table";
import { cn } from "@/utils/cn";

interface TableLoadingSkeletonProps extends ComponentPropsWithoutRef<"div"> {
  columnLength: number;
}

const TableLoadingSkeleton = forwardRef<
  HTMLDivElement,
  TableLoadingSkeletonProps
>(({ className, columnLength, ...props }, ref) => {
  return (
    <Table.Row>
      <Table.Cell
        className="px-1 py-2 text-center group-hover/row:bg-transparent"
        colSpan={columnLength}
      >
        <div
          className={cn("flex w-full flex-col items-start gap-3", className)}
          ref={ref}
          {...props}
        >
          <motion.div
            animate={{ width: "100%" }}
            className="relative h-6 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800"
            initial={{ width: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-neutral-300/80 to-transparent dark:via-neutral-600/80"
              style={{ backgroundSize: "200% 100%" }}
            />
          </motion.div>
          <motion.div
            animate={{ width: "85%" }}
            className="relative h-6 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800"
            initial={{ width: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div
              className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-neutral-300/80 to-transparent dark:via-neutral-600/80"
              style={{ backgroundSize: "200% 100%" }}
            />
          </motion.div>
          <motion.div
            animate={{ width: "70%" }}
            className="relative h-6 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800"
            initial={{ width: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div
              className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-neutral-300/80 to-transparent dark:via-neutral-600/80"
              style={{ backgroundSize: "200% 100%" }}
            />
          </motion.div>
        </div>
      </Table.Cell>
    </Table.Row>
  );
});

TableLoadingSkeleton.displayName = "TableLoadingSkeleton";

export { TableLoadingSkeleton };
