import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const statements = {
  ...defaultStatements,
  subscription: ["read", "write", "manage"] as const,
  billing: ["read", "write"] as const,
} as const;

export const ac = createAccessControl(statements);

const ownerRole = ac.newRole({
  ...ownerAc.statements,
  subscription: ["read", "write", "manage"],
  billing: ["read", "write"],
});

const adminRole = ac.newRole({
  ...adminAc.statements,
  subscription: ["read", "write", "manage"],
  billing: ["read", "write"],
});

const memberRole = ac.newRole({
  ...memberAc.statements,
  subscription: ["read"],
  billing: ["read"],
});

export const roles = {
  owner: ownerRole,
  admin: adminRole,
  member: memberRole,
} as const;
