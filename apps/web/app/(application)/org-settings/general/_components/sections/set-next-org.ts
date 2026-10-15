import { authClient } from "@/lib/auth/auth-client";

export default async function setNextOrg() {
  const organizations = await authClient.organization.list();

  await authClient.organization.setActive({
    organizationId: organizations.data?.length
      ? organizations.data[0]!.id
      : null,
  });
}
