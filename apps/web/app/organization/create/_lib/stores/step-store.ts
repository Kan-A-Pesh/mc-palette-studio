import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { useCreateOrgStore } from "./organization-store";

interface StepState {
  activeStep: number;
  maxSteps: number;
  stepsCompleted: Record<number, boolean>;
  prevStep: () => void;
  nextStep: () => void;
  setActiveStep: (step: number) => void;
  setMaxSteps: (maxSteps: number) => void;
  completeStep: (step: number) => void;
  incompleteStep: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
  reset: () => void;
}

const initialState = {
  activeStep: 0,
  maxSteps: 0,
  stepsCompleted: { 0: false },
};

// Helper functions to reduce cognitive complexity
const isNavigatingBackwards = (step: number, activeStep: number): boolean => {
  return step < activeStep;
};

const isCurrentStep = (step: number, activeStep: number): boolean => {
  return step === activeStep;
};

const isOrgNameRequiredForStep = (step: number): boolean => {
  if (step !== 2) {
    return true;
  }

  const orgName = useCreateOrgStore.getState().name;
  return !(!orgName || orgName.trim() === "");
};

const isNextStep = (step: number, activeStep: number): boolean => {
  return step === activeStep + 1;
};

const areAllPreviousStepsCompleted = (
  step: number,
  activeStep: number,
  stepsCompleted: Record<number, boolean>,
): boolean => {
  for (let i = activeStep; i < step; i++) {
    if (!stepsCompleted[i]) {
      return false;
    }
  }
  return true;
};

export const useStepStore = create<StepState>((set, get) => ({
  ...initialState,

  // Actions
  prevStep: () => {
    const currentStep = get().activeStep;
    set({ activeStep: Math.max(currentStep - 1, 0) });
  },

  nextStep: () => {
    const { activeStep, maxSteps, stepsCompleted } = get();
    // Mark current step as completed when moving to next
    set({
      stepsCompleted: { ...stepsCompleted, [activeStep]: true },
      activeStep: Math.min(activeStep + 1, maxSteps),
    });
  },

  setActiveStep: (step: number) => {
    const { canNavigateToStep } = get();
    if (canNavigateToStep(step)) {
      set({ activeStep: step });
    }
  },

  setMaxSteps: (maxSteps: number) => {
    set({ maxSteps });
  },

  completeStep: (step: number) => {
    const { stepsCompleted } = get();
    set({ stepsCompleted: { ...stepsCompleted, [step]: true } });
  },

  incompleteStep: (step: number) => {
    const { stepsCompleted } = get();
    set({ stepsCompleted: { ...stepsCompleted, [step]: false } });
  },

  canNavigateToStep: (step: number) => {
    const { activeStep, stepsCompleted } = get();

    // Always allow going back
    if (isNavigatingBackwards(step, activeStep)) {
      return true;
    }

    // Allow going to current step
    if (isCurrentStep(step, activeStep)) {
      return true;
    }

    // For navigation to summary step (step 2), ensure organization name is not empty
    if (!isOrgNameRequiredForStep(step)) {
      return false;
    }

    // Allow going to next step only if current step is completed
    if (isNextStep(step, activeStep)) {
      return stepsCompleted[activeStep] ?? false;
    }

    // Allow going forward multiple steps only if all previous steps are completed
    if (step > activeStep + 1) {
      return areAllPreviousStepsCompleted(step, activeStep, stepsCompleted);
    }

    return true;
  },

  reset: () => set(initialState),
}));

// Custom hooks for better state access
export const useActiveStep = () => useStepStore((state) => state.activeStep);
export const useStepNavigation = () =>
  useStepStore(
    useShallow((state) => ({
      prevStep: state.prevStep,
      nextStep: state.nextStep,
      setActiveStep: state.setActiveStep,
      canNavigateToStep: state.canNavigateToStep,
    })),
  );
export const useStepCompletion = () =>
  useStepStore(
    useShallow((state) => ({
      completeStep: state.completeStep,
      incompleteStep: state.incompleteStep,
      stepsCompleted: state.stepsCompleted,
    })),
  );
