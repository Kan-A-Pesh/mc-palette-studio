"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ClientEventName,
  ClientEventInput,
  BrokerEventName,
  BrokerEventPayload,
} from "../events";

export interface UserInfo {
  id: string;
  name: string;
}

export interface RealtimeContextValue {
  socket: Socket | null;
  isConnected: boolean;
  user: UserInfo | null;
  emit: <E extends ClientEventName>(
    event: E,
    data: ClientEventInput<E>,
  ) => void;
  on: <E extends BrokerEventName>(
    event: E,
    callback: (payload: BrokerEventPayload<E>) => void,
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export interface RealtimeProviderProps {
  children: ReactNode;
  url: string;
  auth?: Record<string, unknown>;
}

export function RealtimeProvider({
  children,
  url,
  auth,
}: RealtimeProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const socketInstance = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth,
    });

    socketInstance.on("connect", () => setIsConnected(true));
    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      setUser(null);
    });

    socketInstance.on(
      "connection:info",
      (payload: { user: { id: string; name: string } }) => {
        setUser(payload.user);
      },
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url, auth]);

  const emit = useCallback(
    <E extends ClientEventName>(event: E, data: ClientEventInput<E>) => {
      if (socket) {
        socket.emit(event, data);
      }
    },
    [socket],
  );

  const on = useCallback(
    <E extends BrokerEventName>(
      event: E,
      callback: (payload: BrokerEventPayload<E>) => void,
    ) => {
      if (!socket) return () => {};

      const handler = (...args: unknown[]) =>
        callback(args[0] as BrokerEventPayload<E>);
      (
        socket as unknown as {
          on: (event: string, handler: (...args: unknown[]) => void) => void;
        }
      ).on(event, handler);

      return () => {
        (
          socket as unknown as {
            off: (event: string, handler: (...args: unknown[]) => void) => void;
          }
        ).off(event, handler);
      };
    },
    [socket],
  );

  return (
    <RealtimeContext.Provider value={{ socket, isConnected, user, emit, on }}>
      {children}
    </RealtimeContext.Provider>
  );
}

function missingRealtimeProvider(): never {
  throw new Error("useRealtime must be used within a RealtimeProvider");
}

export function useRealtime(): RealtimeContextValue {
  return useContext(RealtimeContext) ?? missingRealtimeProvider();
}
