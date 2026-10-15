"use client";

import { PAGES } from "@/constants/pages";
import { authClient } from "./auth-client";

export async function signOut() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = PAGES.AUTH.SIGN_IN;
      },
    },
  });
}
