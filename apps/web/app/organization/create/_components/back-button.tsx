"use client";

import { RiArrowLeftSLine } from "@repo/ui/icon";

import * as Button from "@repo/ui/button";

import { useActiveStep, useStepNavigation } from "../_lib/stores/step-store";

export default function BackButton() {
  const activeStep = useActiveStep();
  const { prevStep } = useStepNavigation();

  return (
    <>
      {activeStep > 0 && (
        <Button.Root
          mode="stroke"
          onClick={prevStep}
          size="xsmall"
          variant="neutral"
        >
          <Button.Icon as={RiArrowLeftSLine} />
          Back
        </Button.Root>
      )}
    </>
  );
}
