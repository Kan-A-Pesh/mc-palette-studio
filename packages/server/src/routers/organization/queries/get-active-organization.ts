import { organizationProcedure } from "../../../procedure/organization.procedure";

export const getActiveOrganizationBase = organizationProcedure;

export const getActiveOrganizationHandler = getActiveOrganizationBase.handler(
  async ({ context }) => {
    const { activeOrganization } = context;

    return activeOrganization;
  },
);
