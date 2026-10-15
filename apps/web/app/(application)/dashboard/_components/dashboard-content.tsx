"use client";

import * as Avatar from "@repo/ui/avatar";
import { PROJECT } from "@repo/env/constants";
import { useUserData } from "@/hooks/use-user-data";
import Header from "../../_components/header";

export function DashboardContent() {
  const { user } = useUserData();

  return (
    <>
      <Header
        contentClassName="hidden lg:flex"
        description={`Welcome back to ${PROJECT.NAME} 👋🏻`}
        icon={
          <Avatar.Root color="yellow" size="48">
            {user?.image && <Avatar.Image alt="" src={user?.image} />}
          </Avatar.Root>
        }
        title={user?.name}
      />

      <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8 lg:pt-1">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(344px,1fr))] items-start justify-center gap-6">
          Your content here
        </div>
      </div>
    </>
  );
}
