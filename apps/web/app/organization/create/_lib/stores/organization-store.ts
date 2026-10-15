import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

// Separate state and actions
interface CreateOrgState {
  name: string;
  logoUrl: string | null;
  memberInvitations: {
    email: string;
    role: "owner" | "admin" | "member";
  }[];
}

interface CreateOrgActions {
  setName: (name: string) => void;
  setLogoUrl: (logoUrl: string | null) => void;
  setMemberInvitations: (
    memberInvitations: {
      email: string;
      role: "owner" | "admin" | "member";
    }[],
  ) => void;
  reset: () => void;
}

type CreateOrgStore = CreateOrgState & CreateOrgActions;

// Initial state for reuse
const initialState: CreateOrgState = {
  name: "",
  logoUrl: null,
  memberInvitations: [{ email: "", role: "member" }],
};

export const useCreateOrgStore = create<CreateOrgStore>((set) => ({
  ...initialState,

  // Actions
  setName: (name: string) => set({ name }),

  setLogoUrl: (logoUrl: string | null) => set({ logoUrl }),

  setMemberInvitations: (
    memberInvitations: {
      email: string;
      role: "owner" | "admin" | "member";
    }[],
  ) => set({ memberInvitations }),

  reset: () => set(initialState),
}));

// Atomic selectors as custom hooks
export const useOrgName = () => useCreateOrgStore((state) => state.name);
export const useOrgLogo = () => useCreateOrgStore((state) => state.logoUrl);
export const useOrgMembers = () =>
  useCreateOrgStore((state) => state.memberInvitations);
export const useOrgActions = () =>
  useCreateOrgStore(
    useShallow((state) => ({
      setName: state.setName,
      setLogoUrl: state.setLogoUrl,
      setMemberInvitations: state.setMemberInvitations,
      reset: state.reset,
    })),
  );
