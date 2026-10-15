"use client";

import { generateId } from "ai";

import { authClient } from "@/lib/auth/auth-client";
import slugify from "@/lib/slugify";

const MAX_ATTEMPTS = 5;

export async function findNextAvailableSlug(name: string) {
  const originalSlug = slugify(name);
  let slug = originalSlug;

  const { data } = await authClient.organization.checkSlug({ slug });
  const isOriginalAvailable = data?.status;

  if (isOriginalAvailable) {
    return slug;
  }

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const shortId = generateId();
    slug = `${originalSlug}-${shortId}`;

    // biome-ignore lint/nursery/noAwaitInLoop: The core logic needs to be awaited
    const { data: slugData } = await authClient.organization.checkSlug({
      slug,
    });

    const isAvailable = slugData?.status;
    if (isAvailable) {
      return slug;
    }
  }

  // If we still can't find an available slug
  throw new Error(
    `Unable to generate a unique slug for "${name}". Please try a different name.`,
  );
}
