import type { Socket } from "socket.io";
import type { AuthSession } from "@repo/realtime";
import { apiClient } from "./api-fetch";

interface BetterAuthSession {
  session: {
    id: string;
    userId: string;
    token: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function authenticate(
  socket: Socket,
): Promise<AuthSession | null> {
  const token = socket.handshake.auth.token as string | undefined;

  if (!token) {
    return null;
  }

  try {
    const { data } = await apiClient.get<BetterAuthSession | null>(
      "/api/auth/get-session",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `better-auth.session_token=${token}`,
        },
      },
    );

    if (!data?.user) {
      return null;
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      },
    };
  } catch {
    return null;
  }
}
