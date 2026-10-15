import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { impersonateUser } from "@/app/(application)/_lib/impersonate-user";
import { toast } from "@repo/ui/toast";
import type { UserRole } from "@repo/database";
import { authClient } from "@/lib/auth/auth-client";
import type { RouterOutput } from "@/orpc/client";

import { useInvalidateUserList } from "./use-invalidate-user-list";

type User = RouterOutput["auth"]["listUsers"]["data"][number];

export function useUserTableActions(user: User) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidateUsersList = useInvalidateUserList();

  const handleImpersonate = () => {
    toast.promise(impersonateUser(user.id, queryClient, router), {
      loading: "Impersonating user...",
      success: "User impersonated successfully",
      error: "Failed to impersonate user",
    });
  };

  const handleBanUser = () => {
    toast.promise(
      authClient.admin.banUser(
        {
          userId: user.id,
        },
        {
          onSuccess: () => {
            invalidateUsersList();
          },
          onError: () => {
            throw new Error("Failed to ban user");
          },
        },
      ),
      {
        loading: "Banning user...",
        success: "User banned successfully",
        error: "Failed to ban user",
      },
    );
  };

  const handleUnbanUser = () => {
    toast.promise(
      authClient.admin.unbanUser(
        {
          userId: user.id,
        },
        {
          onSuccess: () => {
            invalidateUsersList();
          },
          onError: () => {
            throw new Error("Failed to unban user");
          },
        },
      ),
      {
        loading: "Unbanning user...",
        success: "User unbanned successfully",
        error: "Failed to unban user",
      },
    );
  };

  const handleChangeRole = (role: UserRole) => {
    toast.promise(
      authClient.admin.setRole(
        {
          userId: user.id,
          role,
        },
        {
          onSuccess: () => {
            invalidateUsersList();
          },
          onError: () => {
            throw new Error("Failed to change user role");
          },
        },
      ),
      {
        loading: `Changing user role to ${role}...`,
        success: `User role changed to ${role} successfully`,
        error: "Failed to change user role",
      },
    );
  };

  return {
    handleImpersonate,
    handleBanUser,
    handleUnbanUser,
    handleChangeRole,
    invalidateUsersList,
  };
}
