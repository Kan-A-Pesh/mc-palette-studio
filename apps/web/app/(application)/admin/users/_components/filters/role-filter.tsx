"use client";

import { RiUserLine } from "@repo/ui/icon";
import isEqual from "fast-deep-equal";
import { memo } from "react";

import * as Select from "@repo/ui/select";

interface RoleFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const RoleFilter = memo(
  ({ value, onValueChange }: RoleFilterProps) => {
    return (
      <Select.Root onValueChange={onValueChange} value={value || ""}>
        <Select.Trigger className="w-40">
          <Select.TriggerIcon as={RiUserLine} />
          <Select.Value placeholder="User Role" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all">All Users</Select.Item>
          <Select.Item value="admin">Admin</Select.Item>
          <Select.Item value="user">User</Select.Item>
        </Select.Content>
      </Select.Root>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);

RoleFilter.displayName = "RoleFilter";
