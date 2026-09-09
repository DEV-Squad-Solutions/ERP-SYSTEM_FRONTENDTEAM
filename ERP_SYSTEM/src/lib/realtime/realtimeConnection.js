import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { toast } from "sonner";

let connectionInstance = null;
let startPromise = null;

const connectionListeners = new Set();

const RETRY_DELAYS = [0, 2000, 5000, 10000, 30000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function notifyConnectionStatus(status, error = null) {
  connectionListeners.forEach((listener) => {
    try {
      listener(status, error);
    } catch (listenerError) {
      console.error("❌ SignalR status listener error:", listenerError);
    }
  });
}

export function subscribeConnectionStatus(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  connectionListeners.add(listener);

  return () => {
    connectionListeners.delete(listener);
  };
}

function attachConnectionEvents(connection) {
  connection.onreconnecting((error) => {
    console.warn("🟡 SignalR: Reconnecting...", error);

    notifyConnectionStatus("reconnecting", error);

    toast.warning("جاري إعادة الاتصال بالتحديثات...", {
      id: "signalr-status",
    });
  });

  connection.onreconnected((connectionId) => {
    console.info("🟢 SignalR: Reconnected", connectionId);

    notifyConnectionStatus("connected");

    toast.success("تمت إعادة الاتصال بالتحديثات", {
      id: "signalr-status",
    });
  });

  connection.onclose((error) => {
    if (error) {
      console.error("🔴 SignalR: Connection closed", error);

      notifyConnectionStatus("disconnected", error);

      toast.error("تم فقد الاتصال بالتحديثات", {
        id: "signalr-status",
      });
    } else {
      console.info("⚪ SignalR: Connection closed");

      notifyConnectionStatus("disconnected");
    }
  });
}

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
        try {
          const token = await getAccessToken();

          return token || "";
        } catch (error) {
          console.error("❌ SignalR token error:", error);

          return "";
        }
      },
      withCredentials: false,
    })
    .withAutomaticReconnect(RETRY_DELAYS)
    .configureLogging(LogLevel.Warning)
    .build();

  attachConnectionEvents(connectionInstance);

  return connectionInstance;
}

export function getConnection() {
  return connectionInstance;
}

export async function startConnection(getAccessToken) {
  const connection = getOrCreateConnection(getAccessToken);

  if (!connection) {
    notifyConnectionStatus("disconnected");

    return false;
  }

  if (connection.state === HubConnectionState.Connected) {
    notifyConnectionStatus("connected");

    return true;
  }

  if (startPromise) {
    return startPromise;
  }

  startPromise = (async () => {
    toast.loading("جاري الاتصال بالتحديثات...", {
      id: "signalr-status",
    });

    notifyConnectionStatus("connecting");

    for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
      try {
        if (attempt > 0) {
          await sleep(RETRY_DELAYS[attempt]);
        }

        if (connection.state === HubConnectionState.Connected) {
          notifyConnectionStatus("connected");

          toast.success("تم الاتصال بالتحديثات بنجاح", {
            id: "signalr-status",
          });

          return true;
        }

        if (connection.state === HubConnectionState.Connecting) {
          continue;
        }

        console.info(
          `🔄 SignalR connection attempt ${attempt + 1}/${RETRY_DELAYS.length}`,
        );

        notifyConnectionStatus("connecting");

        await connection.start();

        console.info("🟢 SignalR: Connected");

        notifyConnectionStatus("connected");

        toast.success("تم الاتصال بالتحديثات بنجاح", {
          id: "signalr-status",
        });

        return true;
      } catch (error) {
        console.warn(
          `⚠️ SignalR connection attempt ${attempt + 1} failed:`,
          error,
        );

        if (attempt === RETRY_DELAYS.length - 1) {
          notifyConnectionStatus("failed", error);

          toast.error("تعذر الاتصال بالتحديثات", {
            id: "signalr-status",
            description:
              "سيستمر النظام في العمل، وسيتم إعادة المحاولة عند الحاجة.",
          });

          return false;
        }
      }
    }

    return false;
  })();

  try {
    return await startPromise;
  } finally {
    startPromise = null;
  }
}

export async function stopConnection() {
  if (!connectionInstance) {
    return;
  }

  try {
    if (connectionInstance.state !== HubConnectionState.Disconnected) {
      await connectionInstance.stop();
    }
  } catch (error) {
    console.error("❌ SignalR stop error:", error);
  } finally {
    connectionInstance = null;
    startPromise = null;

    notifyConnectionStatus("disconnected");
  }
}
