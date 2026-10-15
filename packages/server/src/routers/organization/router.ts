import { call } from "@orpc/server";
import { base } from "../../context";
import {
  getActiveMemberBase,
  getActiveMemberHandler,
  getActiveOrganizationBase,
  getActiveOrganizationHandler,
  getInvitationBase,
  getInvitationHandler,
  getUserOrganizationsBase,
  getUserOrganizationsHandler,
  listMembersBase,
  listMembersHandler,
  listUserInvitationsBase,
  listUserInvitationsHandler,
} from "./queries";

export const organizationRouter = base.router({
  listUserInvitations: listUserInvitationsBase
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return await call(listUserInvitationsHandler, undefined, {
        context,
      });
    }),

  getUserOrganizations: getUserOrganizationsBase
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return await call(getUserOrganizationsHandler, undefined, {
        context,
      });
    }),

  getActiveOrganization: getActiveOrganizationBase
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return await call(getActiveOrganizationHandler, undefined, {
        context,
      });
    }),

  getActiveMember: getActiveMemberBase
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return await call(getActiveMemberHandler, undefined, {
        context,
      });
    }),

  getInvitation: getInvitationBase
    .route({ method: "GET" })
    .handler(async ({ input, context }) => {
      return await call(getInvitationHandler, input, {
        context,
      });
    }),

  listMembers: listMembersBase
    .route({ method: "GET" })
    .handler(async ({ input, context }) => {
      return await call(listMembersHandler, input, {
        context,
      });
    }),
});
