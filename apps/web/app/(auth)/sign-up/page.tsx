import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { SignUpForm } from "./_components/sign-up-form";
import { signUpSearchParams } from "./search-params";

export const metadata: Metadata = {
  title: "Register",
};

interface SignUpPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  await signUpSearchParams.parse(searchParams);

  return <SignUpForm />;
}
