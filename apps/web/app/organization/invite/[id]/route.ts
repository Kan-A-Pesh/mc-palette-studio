import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@repo/database/auth";
import { PAGES } from "@/constants/pages";
import { orpcClient } from "@/orpc/orpc-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const invite = await orpcClient.organization.getInvitation({
      id,
    });

    if (!invite) {
      return new NextResponse(null, { status: 404 });
    }

    const authResponse = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authResponse) {
      const userExists = await orpcClient.user.checkEmailExists({
        email: invite.email,
      });

      if (userExists) {
        return NextResponse.redirect(
          new URL(`${PAGES.AUTH.SIGN_IN}`, request.url),
          { status: 302 },
        );
      }
      // Redirect to sign UP for new users
      const searchParamsString = new URLSearchParams({
        organizationName: invite.organizationName || "",
        signUpEmail: invite.email || "",
      }).toString();

      return NextResponse.redirect(
        new URL(`${PAGES.AUTH.SIGN_UP}?${searchParamsString}`, request.url),
        { status: 302 },
      );
    }

    if (invite.email !== authResponse.user?.email) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.redirect(
      new URL(PAGES.APPLICATION.DASHBOARD, request.url),
      {
        status: 302,
      },
    );
  } catch (error) {
    console.error("Error retrieving invitation:", error);
    return new NextResponse(null, { status: 404 });
  }
}
