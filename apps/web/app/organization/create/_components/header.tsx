"use client";

import { RiCloseLine } from "@repo/ui/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Logo } from "@/components/branding/logo";
import * as Button from "@repo/ui/button";
import * as HorizontalStepper from "@repo/ui/horizontal-stepper";
import { cn } from "@repo/ui/utils/cn";
import { useActiveStep, useStepNavigation } from "../_lib/stores/step-store";
import BackButton from "./back-button";
import { createOrgStepComponents } from "./steps";

export default function Header() {
  const router = useRouter();
  const activeStep = useActiveStep();
  const { setActiveStep, canNavigateToStep } = useStepNavigation();

  const getState = (index: number): "completed" | "active" | "default" => {
    if (activeStep > index) {
      return "completed";
    }
    if (activeStep === index) {
      return "active";
    }
    return "default";
  };

  const handleStepClick = (index: number) => {
    if (canNavigateToStep(index)) {
      setActiveStep(index);
    }
  };

  const handleClose = () => {
    router.back();
  };

  // Convert steps object to array for safe indexed access
  const stepsArray = Object.values(createOrgStepComponents);

  return (
    <div className="border-stroke-soft-200 border-b bg-bg-white-0 lg:h-22">
      {/* mobile */}
      <div className="lg:hidden">
        <div className="px-2.5 pt-2.5 pb-3.5">
          <div className="relative flex h-9 items-center justify-between">
            <BackButton />
            <Link
              className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
              href="/"
            >
              <Logo className="size-9" />
            </Link>
            <Button.Root mode="ghost" onClick={handleClose} variant="neutral">
              <Button.Icon as={RiCloseLine} />
            </Button.Root>
          </div>
        </div>
        <div className="h-1 w-full bg-bg-soft-200">
          <div
            className="h-full bg-primary-base transition-all duration-200 ease-out"
            style={{
              width: `${(100 / stepsArray.length) * (activeStep + 1)}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-full bg-primary-base text-label-xs text-static-white">
              {stepsArray[activeStep]?.indicator}
            </div>
            <span className="text-paragraph-sm text-text-strong-950">
              {stepsArray[activeStep]?.label}
            </span>
          </div>
          <div className="text-right text-paragraph-sm text-text-soft-400">
            {`${activeStep + 1}/${stepsArray.length}`}
          </div>
        </div>
      </div>

      {/* desktop */}
      <div className="mx-auto hidden h-full w-full max-w-348 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 px-5 lg:grid">
        <Link href="/">
          <Logo className="size-10" />
        </Link>
        <div className="flex w-full justify-center">
          <HorizontalStepper.Root>
            {stepsArray.map((step, index) => (
              <React.Fragment key={index}>
                <HorizontalStepper.Item
                  className={cn(
                    !canNavigateToStep(index) &&
                      "cursor-not-allowed opacity-70",
                  )}
                  onClick={() => handleStepClick(index)}
                  state={getState(index)}
                >
                  <HorizontalStepper.ItemIndicator>
                    {step?.indicator}
                  </HorizontalStepper.ItemIndicator>
                  {step?.label}
                </HorizontalStepper.Item>
                {index < stepsArray.length - 1 && (
                  <HorizontalStepper.SeparatorIcon />
                )}
              </React.Fragment>
            ))}
          </HorizontalStepper.Root>
        </div>
        <Button.Root
          className="ml-auto"
          mode="ghost"
          onClick={handleClose}
          variant="neutral"
        >
          <Button.Icon as={RiCloseLine} />
        </Button.Root>
      </div>
    </div>
  );
}
