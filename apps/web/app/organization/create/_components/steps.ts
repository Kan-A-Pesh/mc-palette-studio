import OnboardingStepCreateOrg from "./steps/step-create-org";
import StepInviteMembers from "./steps/step-invite-members";
import StepSummary from "./steps/step-summary";

export type StepComponents = {
  [key: number]: {
    label: string;
    indicator: string;
    component: React.ComponentType;
  };
};

export const createOrgStepComponents = {
  0: {
    label: "Create Organization",
    indicator: "1",
    component: OnboardingStepCreateOrg,
  },
  1: {
    label: "Invite Members",
    indicator: "2",
    component: StepInviteMembers,
  },
  2: {
    label: "Review changes",
    indicator: "3",
    component: StepSummary,
  },
} as const;
