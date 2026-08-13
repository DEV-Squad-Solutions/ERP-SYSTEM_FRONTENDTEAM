// src/lib/realtime/realtimeConnection.js
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connectionInstance = null;

export function getOrCreateConnection(getAccessToken) {
  if (connectionInstance) return connectionInstance;

  connectionInstance = new HubConnectionBuilder()
    .withUrl(import.meta.env.VITE_UPDATES_HUB_URL, {
      accessTokenFactory: () => getAccessToken(),
      withCredentials: false,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

  return connectionInstance;
}

export function getConnection() {
  return connectionInstance;
}

export async function stopConnection() {
  if (connectionInstance) {
    await connectionInstance.stop();
    connectionInstance = null;
  }
}
