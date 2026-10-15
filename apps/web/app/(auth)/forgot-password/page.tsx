import type { Metadata } from "next";

import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

type SearchParams = Promise<{ error: string | null }>;

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-118 px-4">
      <ForgotPasswordForm error={error} />
    </div>
  );
}
