// src/lib/realtime/RealtimeProvider.jsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDispatch } from "react-redux";
import { getOrCreateConnection, stopConnection } from "./realtimeConnection";

const RealtimeContext = createContext(null);

const BATCH_WINDOW_MS = 300;

export function RealtimeProvider({
  children,
  baseApi,
  resourceTagsMap = {},
  getAccessToken,
}) {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);

  const [externalUpdates, setExternalUpdates] = useState({});

  const seenEventsRef = useRef(new Set());
  const pendingTagsRef = useRef(new Set());
  const batchTimerRef = useRef(null);

  const flushPendingTags = useCallback(() => {
    const tags = Array.from(pendingTagsRef.current);
    pendingTagsRef.current.clear();
    batchTimerRef.current = null;
    if (tags.length === 0) return;
    dispatch(baseApi.util.invalidateTags(tags));
  }, [dispatch, baseApi]);

  const scheduleInvalidate = useCallback(
    (tags) => {
      tags.forEach((t) => pendingTagsRef.current.add(t));
      if (!batchTimerRef.current) {
        batchTimerRef.current = setTimeout(flushPendingTags, BATCH_WINDOW_MS);
      }
    },
    [flushPendingTags],
  );

  const handleEntityChanged = useCallback(
    (event) => {
      const { eventId, resource, action, entityId } = event;
      const dedupeKey = `${eventId}|${resource}|${action}|${entityId}`;

      if (seenEventsRef.current.has(dedupeKey)) return;
      seenEventsRef.current.add(dedupeKey);
      if (seenEventsRef.current.size > 500) {
        seenEventsRef.current.clear();
      }

      const tags = resourceTagsMap[resource];
      if (tags && tags.length > 0) {
        scheduleInvalidate(tags);
      }

      setExternalUpdates((prev) => ({
        ...prev,
        [`${resource}-${entityId}`]: {
          action,
          occurredAtUtc: event.occurredAtUtc,
        },
      }));
    },
    [resourceTagsMap, scheduleInvalidate],
  );

  useEffect(() => {
    const connection = getOrCreateConnection(getAccessToken);
    if (!getAccessToken) {
      console.log("⏸️ SignalR: No access token");
      return;
    }
    if (!connection) {
      console.error("❌ SignalR connection was not created");
      return;
    }

    connection.on("ReceiveEntityChanged", handleEntityChanged);

    connection.onreconnected(() => {
      setIsConnected(true);
      dispatch(baseApi.util.resetApiState());
    });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onclose(() => setIsConnected(false));

    if (connection.state === "Disconnected") {
      connection
        .start()
        .then(() => setIsConnected(true))
        .catch((err) => console.error("SignalR connection failed:", err));
    } else if (connection.state === "Connected") {
      setIsConnected(true);
    }

    return () => {
      connection.off("ReceiveEntityChanged", handleEntityChanged);
      void stopConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleEntityChanged]);

  return (
    <RealtimeContext.Provider value={{ isConnected, externalUpdates }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useExternalUpdateAlert(resource, entityId) {
  const ctx = useContext(RealtimeContext);
  if (!ctx || entityId == null) return null;
  return ctx.externalUpdates[`${resource}-${entityId}`] ?? null;
}

export function useRealtimeStatus() {
  const ctx = useContext(RealtimeContext);
  return ctx?.isConnected ?? false;
}
