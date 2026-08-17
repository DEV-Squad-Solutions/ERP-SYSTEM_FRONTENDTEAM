import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connectionInstance = null;

export function getOrCreateConnection(getAccessToken) {
  if (connectionInstance) {
    return connectionInstance;
  }

  if (typeof getAccessToken !== "function") {
    console.error("❌ SignalR: getAccessToken must be a function");

    return null;
  }

  const hubUrl = import.meta.env.VITE_UPDATES_HUB_URL;

  if (!hubUrl) {
    console.error("❌ SignalR: VITE_UPDATES_HUB_URL is not configured");

    return null;
  }

  connectionInstance = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: async () => {
        const token = await getAccessToken();

        return token || "";
      },

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
  if (!connectionInstance) {
    return;
  }

  try {
    if (connectionInstance.state !== "Disconnected") {
      await connectionInstance.stop();
    }
  } catch (error) {
    console.error("❌ SignalR stop error:", error);
  } finally {
    connectionInstance = null;
  }
}
