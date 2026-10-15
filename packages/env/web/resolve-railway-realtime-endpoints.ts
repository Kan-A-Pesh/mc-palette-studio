import generatedEndpoints from "./railway-realtime-endpoints.generated.json";

const LOCAL_REALTIME_WEB_SOCKET_URL = "http://localhost:3001";

interface RailwayRealtimeEndpointsFile {
  wsUrl: string | null;
  tcpUrl: string | null;
}

const deploymentEndpoints = generatedEndpoints as RailwayRealtimeEndpointsFile;

export function resolveRealtimeWebSocketUrl(
  configuredWebSocketUrl: string | undefined,
): string {
  if (deploymentEndpoints.wsUrl) {
    return deploymentEndpoints.wsUrl;
  }

  return configuredWebSocketUrl ?? LOCAL_REALTIME_WEB_SOCKET_URL;
}

export function resolveRealtimeTcpUrl(
  configuredTcpUrl: string | undefined,
): string | undefined {
  if (deploymentEndpoints.tcpUrl) {
    return deploymentEndpoints.tcpUrl;
  }

  return configuredTcpUrl;
}
