"use client";

import { useEffect } from "react";

import { cn } from "@repo/ui/utils/cn";
import { useCreateOrgStore } from "../_lib/stores/organization-store";
import { useActiveStep, useStepStore } from "../_lib/stores/step-store";
import { createOrgStepComponents } from "./steps";

export default function Stepper() {
  const activeStep = useActiveStep();
  const { setMaxSteps, reset: resetStepStore } = useStepStore();
  const { reset: resetOrgStore } = useCreateOrgStore();

  useEffect(() => {
    setMaxSteps(Object.keys(createOrgStepComponents).length - 1);
  }, [setMaxSteps]);

  useEffect(() => {
    return () => {
      resetStepStore();
      resetOrgStore();
    };
  }, [resetStepStore, resetOrgStore]);

  const steps = Object.values(createOrgStepComponents);
  const ActiveStep = steps[activeStep]?.component;

  if (!ActiveStep) {
    return null;
  }

  return (
    <div className="flex justify-center py-6 lg:py-12">
      <div
        className={cn(
          "w-full outline-none focus:outline-none",
          // enter animation, replayed on step change via the keyed remount
          "fade-in-0 slide-in-from-bottom-3 animate-in duration-500 ease-out",
        )}
        key={activeStep}
      >
        <ActiveStep />
      </div>
    </div>
  );
}
