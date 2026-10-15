import type { HandleUploadOptions } from "@vercel/blob/client";
import { getServerSession } from "@/lib/auth/get-server-session";

type ServerSession = NonNullable<Awaited<ReturnType<typeof getServerSession>>>;

type OnBeforeGenerateToken = HandleUploadOptions["onBeforeGenerateToken"];

/**
 * Builds an `onBeforeGenerateToken` callback for Vercel Blob client uploads.
 *
 * Handles the shared auth gate (reject unauthenticated requests, allow JPEG/PNG)
 * and delegates only the token payload contents to `buildTokenPayload`.
 */
export function createOnBeforeGenerateToken(
  buildTokenPayload: (session: ServerSession) => object,
): OnBeforeGenerateToken {
  return async () => {
    const session = await getServerSession();

    if (!session) {
      return {
        allowedContentTypes: [],
        tokenPayload: null,
      };
    }

    return {
      allowedContentTypes: ["image/jpeg", "image/png"],
      tokenPayload: JSON.stringify(buildTokenPayload(session)),
    };
  };
}
