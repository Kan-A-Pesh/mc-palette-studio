"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill, RiInformationFill } from "@repo/ui/icon";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { FormPassword } from "@repo/ui/form";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Alert from "@repo/ui/alert";
import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import * as Hint from "@repo/ui/hint";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/auth-client";
import {
  deleteAccountSchema,
  type DeleteAccountFormValues,
} from "./delete-account-schema";

export default function DeleteAccount() {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    control,
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(data: DeleteAccountFormValues) {
    setError(null);
    setIsSubmitting(true);

    await authClient.deleteUser(
      {
        password: data.password,
      },
      {
        onError: ({ error: deleteError }) => {
          if (deleteError.code === AUTH_ERRORS.INVALID_PASSWORD) {
            setFormError("password", {
              message:
                "The password you entered is incorrect. Please try again.",
            });
          } else {
            setError(
              "An error occurred while deleting your account. Please try again later.",
            );
          }
          setIsSubmitting(false);
        },
        onSuccess: () => {
          router.push(
            PAGES.AUTH.SIGN_IN +
              "?message=" +
              encodeURIComponent(
                "Your account with all associated data has been deleted successfully",
              ),
          );
        },
      },
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <div className="text-label-md">Delete Account</div>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          Manage the process of deleting account.
        </p>
      </div>

      <Divider.Root variant="line-spacing" />

      <Alert.Root size="xsmall" status="error" variant="lighter">
        <Alert.Icon as={RiErrorWarningFill} />
        This action cannot be undone.
      </Alert.Root>

      <p className="text-paragraph-sm text-text-sub-600">
        All of your data, including your profile, posts, and personal
        information, will be permanently removed.
        <br />
        <br />
        By entering your password, you confirm that you understand and accept
        the consequences of deleting your account.
      </p>

      <Divider.Root variant="line-spacing" />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <FormPassword
            control={control}
            label="Confirm Deletion"
            name="password"
            required
          />

          {error && (
            <Alert.Root size="xsmall" status="error" variant="lighter">
              <Alert.Icon as={RiErrorWarningFill} />
              {error}
            </Alert.Root>
          )}

          {!(error || errors.password) && (
            <Hint.Root>
              <Hint.Icon as={RiInformationFill} />
              Provide your password to proceed with account deletion.
            </Hint.Root>
          )}
        </div>

        <div className="mt-1 grid grid-cols-2 gap-3">
          <Button.Root mode="stroke" type="button" variant="neutral">
            Cancel
          </Button.Root>
          <Button.Root disabled={isSubmitting} type="submit" variant="error">
            {isSubmitting && <StaggeredFadeLoader variant="muted" />}
            {isSubmitting ? "Loading..." : "Delete Account"}
          </Button.Root>
        </div>
      </form>
    </div>
  );
}
