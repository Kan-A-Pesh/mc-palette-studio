"use client";

import { RiFilter3Line } from "@repo/ui/icon";
import isEqual from "fast-deep-equal";
import { memo } from "react";

import * as Select from "@repo/ui/select";

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const StatusFilter = memo(
  ({ value, onValueChange }: StatusFilterProps) => {
    return (
      <Select.Root onValueChange={onValueChange} value={value}>
        <Select.Trigger className="w-40">
          <Select.TriggerIcon as={RiFilter3Line} />
          <Select.Value placeholder="Waitlist Status" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all">All Users</Select.Item>
          <Select.Item value="approved">Approved</Select.Item>
          <Select.Item value="pending">Pending</Select.Item>
          <Select.Item value="rejected">Rejected</Select.Item>
        </Select.Content>
      </Select.Root>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);

StatusFilter.displayName = "StatusFilter";
