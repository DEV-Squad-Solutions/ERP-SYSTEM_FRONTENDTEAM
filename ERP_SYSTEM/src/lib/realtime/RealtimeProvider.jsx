import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import {
  getOrCreateConnection,
  startConnection,
  stopConnection,
  subscribeConnectionStatus,
} from "./realtimeConnection";

const RealtimeContext = createContext(null);

const BATCH_WINDOW_MS = 300;
const MAX_SEEN_EVENTS = 500;

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

    if (tags.length === 0) {
      return;
    }

    dispatch(baseApi.util.invalidateTags(tags));
  }, [dispatch, baseApi]);

  const scheduleInvalidate = useCallback(
    (tags) => {
      if (!Array.isArray(tags) || tags.length === 0) {
        return;
      }

      tags.forEach((tag) => {
        pendingTagsRef.current.add(tag);
      });

      if (!batchTimerRef.current) {
        batchTimerRef.current = setTimeout(flushPendingTags, BATCH_WINDOW_MS);
      }
    },
    [flushPendingTags],
  );

  const handleEntityChanged = useCallback(
    (event) => {
      if (!event) {
        return;
      }

      const { eventId, resource, action, entityId, occurredAtUtc } = event;

      if (!resource) {
        return;
      }

      const dedupeKey = [
        eventId ?? "no-event-id",
        resource,
        action ?? "unknown",
        entityId ?? "unknown",
      ].join("|");

      if (seenEventsRef.current.has(dedupeKey)) {
        return;
      }

      seenEventsRef.current.add(dedupeKey);

      if (seenEventsRef.current.size > MAX_SEEN_EVENTS) {
        const firstKey = seenEventsRef.current.values().next().value;

        if (firstKey) {
          seenEventsRef.current.delete(firstKey);
        }
      }

      const tags = resourceTagsMap[resource];

      if (Array.isArray(tags) && tags.length > 0) {
        scheduleInvalidate(tags);
      }

      if (entityId != null) {
        setExternalUpdates((previous) => ({
          ...previous,
          [`${resource}-${entityId}`]: {
            action,
            occurredAtUtc,
          },
        }));
      }
    },
    [resourceTagsMap, scheduleInvalidate],
  );

  useEffect(() => {
    if (typeof getAccessToken !== "function") {
      setIsConnected(false);

      console.warn("⏸️ SignalR: getAccessToken is not available");

      return undefined;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      setIsConnected(false);

      return undefined;
    }

    const connection = getOrCreateConnection(getAccessToken);

    if (!connection) {
      setIsConnected(false);

      return undefined;
    }

    let cancelled = false;

    const unsubscribeStatus = subscribeConnectionStatus((status) => {
      if (cancelled) {
        return;
      }

      if (status === "connected") {
        setIsConnected(true);
        return;
      }

      if (status === "connecting" || status === "reconnecting") {
        setIsConnected(false);
        return;
      }

      if (status === "disconnected" || status === "failed") {
        setIsConnected(false);
      }
    });

    connection.on("ReceiveEntityChanged", handleEntityChanged);

    if (connection.state === "Connected") {
      setIsConnected(true);
    } else {
      void startConnection(getAccessToken).then((connected) => {
        if (!cancelled) {
          setIsConnected(connected);
        }
      });
    }

    return () => {
      cancelled = true;

      unsubscribeStatus();

      connection.off("ReceiveEntityChanged", handleEntityChanged);

      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);

        batchTimerRef.current = null;
      }

      pendingTagsRef.current.clear();

      void stopConnection();
    };
  }, [getAccessToken, handleEntityChanged]);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        externalUpdates,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useExternalUpdateAlert(resource, entityId) {
  const context = useContext(RealtimeContext);

  if (!context || entityId == null) {
    return null;
  }

  return context.externalUpdates[`${resource}-${entityId}`] ?? null;
}

export function useRealtimeStatus() {
  const context = useContext(RealtimeContext);

  return context?.isConnected ?? false;
}
