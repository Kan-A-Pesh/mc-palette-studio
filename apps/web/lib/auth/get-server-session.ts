import { headers } from "next/headers";
import { auth } from "@repo/database/auth";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
