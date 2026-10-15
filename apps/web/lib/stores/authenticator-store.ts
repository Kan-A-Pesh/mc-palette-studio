import { create } from "zustand";

export type AuthenticatorStep = "password" | "verify" | "backup";

interface AuthenticatorState {
  // Step management
  step: AuthenticatorStep;
  setStep: (step: AuthenticatorStep) => void;

  // Data
  password: string;
  setPassword: (password: string) => void;

  secretKey: string | null;
  setSecretKey: (secretKey: string | null) => void;

  totpURI: string | null;
  setTotpURI: (totpURI: string | null) => void;

  backupCodes: string[];
  setBackupCodes: (backupCodes: string[]) => void;

  // Status
  error: string | null;
  setError: (error: string | null) => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  // Options
  trustDevice: boolean;
  setTrustDevice: (trustDevice: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  step: "password" as AuthenticatorStep,
  password: "",
  secretKey: null,
  totpURI: null,
  backupCodes: [],
  error: null,
  isLoading: false,
  trustDevice: false,
};

export const useAuthenticatorStore = create<AuthenticatorState>()((set) => ({
  // Initial state
  ...initialState,

  // Step management
  setStep: (step) => set({ step }),

  // Data setters
  setPassword: (password) => set({ password }),
  setSecretKey: (secretKey) => set({ secretKey }),
  setTotpURI: (totpURI) => set({ totpURI }),
  setBackupCodes: (backupCodes) => set({ backupCodes }),

  // Status setters
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Options setters
  setTrustDevice: (trustDevice) => set({ trustDevice }),

  // Reset the store to initial state
  reset: () => set(initialState),
}));
