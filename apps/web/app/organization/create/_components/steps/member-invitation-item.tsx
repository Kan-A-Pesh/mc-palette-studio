import { RiCloseLine } from "@repo/ui/icon";
import type { ClipboardEvent, KeyboardEvent, RefObject } from "react";

import * as Button from "@repo/ui/button";
import { FormMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Select from "@repo/ui/select";

interface MemberInvitationItemProps {
  index: number;
  email: string;
  role: "owner" | "admin" | "member";
  error?: string;
  lastInputRef?: RefObject<HTMLInputElement | null>;
  onEmailChange: (index: number, email: string) => void;
  onRoleChange: (index: number, role: "owner" | "admin" | "member") => void;
  onRemove: (index: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>, index: number) => void;
  isLast: boolean;
}

export function MemberInvitationItem({
  index,
  email,
  role,
  error,
  lastInputRef,
  onEmailChange,
  onRoleChange,
  onRemove,
  onKeyDown,
  onPaste,
  isLast,
}: MemberInvitationItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-grow">
          <Input.Root hasError={!!error}>
            <Input.Wrapper>
              <Input.Input
                aria-invalid={!!error}
                id={`member-email-${index}`}
                onChange={(e) => onEmailChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(e, index)}
                onPaste={(e) => onPaste(e, index)}
                placeholder="colleague@example.com"
                ref={isLast ? lastInputRef : undefined}
                type="email"
                value={email}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className="min-w-28">
          <Select.Root
            onValueChange={(value) =>
              onRoleChange(index, value as "owner" | "admin" | "member")
            }
            value={role}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="owner">Owner</Select.Item>
              <Select.Item value="admin">Admin</Select.Item>
              <Select.Item value="member">Member</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <Button.Root
          className="shrink-0"
          mode="ghost"
          onClick={() => onRemove(index)}
          size="xxsmall"
          variant="neutral"
        >
          <Button.Icon as={RiCloseLine} />
        </Button.Root>
      </div>

      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
}
