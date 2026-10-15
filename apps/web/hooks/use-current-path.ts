"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useCurrentPath(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath = useMemo(() => {
    const queryString = searchParams?.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  return currentPath ?? "/";
}
