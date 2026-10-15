import { Skeleton } from "@repo/ui/skeleton";

import { PasskeyItemSkeleton } from "./passkey-item-skeleton";

export default function PasskeySkeleton() {
  // Use a stable count to avoid hydration issues
  const skeletonCount = 3;
  const items = Array.from(
    { length: skeletonCount },
    (_, i) => `passkey-skeleton-${i}`,
  );

  return (
    <div className="flex flex-col gap-2">
      {items.map((id) => (
        <PasskeyItemSkeleton key={id} />
      ))}
      <Skeleton className="mt-1 h-8 w-32 rounded-lg" />
    </div>
  );
}
