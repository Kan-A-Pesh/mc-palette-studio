import { Skeleton } from "@repo/ui/skeleton";

import TwoFactorCard from "./card";

export function PasskeyItemSkeleton() {
  return (
    <TwoFactorCard className="h-15">
      <div className="flex h-10 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="ml-1 h-5 w-32" />
          <Skeleton className="ml-1 h-3 w-24" />
        </div>

        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    </TwoFactorCard>
  );
}
