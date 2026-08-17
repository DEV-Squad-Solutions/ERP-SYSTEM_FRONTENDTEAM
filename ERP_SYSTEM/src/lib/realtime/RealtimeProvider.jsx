import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useDispatch } from "react-redux";

import { getOrCreateConnection, stopConnection } from "./realtimeConnection";

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

  // =========================================================
  // FLUSH TAGS
  // =========================================================

  const flushPendingTags = useCallback(() => {
    const tags = Array.from(pendingTagsRef.current);

    pendingTagsRef.current.clear();

    batchTimerRef.current = null;

    if (tags.length === 0) {
      return;
    }

    dispatch(baseApi.util.invalidateTags(tags));
  }, [dispatch, baseApi]);

  // =========================================================
  // SCHEDULE INVALIDATION
  // =========================================================

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

  // =========================================================
  // SIGNALR EVENT
  // =========================================================

  const handleEntityChanged = useCallback(
    (event) => {
      if (!event) {
        return;
      }

      const { eventId, resource, action, entityId, occurredAtUtc } = event;

      if (!resource) {
        return;
      }

      // -------------------------------------------------------
      // DEDUPLICATION
      // -------------------------------------------------------

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
        seenEventsRef.current.clear();
      }

      // -------------------------------------------------------
      // RESOURCE → TAGS
      // -------------------------------------------------------

      const tags = resourceTagsMap[resource];

      if (Array.isArray(tags) && tags.length > 0) {
        scheduleInvalidate(tags);
      }

      // -------------------------------------------------------
      // EXTERNAL UPDATE INFO
      // -------------------------------------------------------

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

  // =========================================================
  // SIGNALR CONNECTION
  // =========================================================

  useEffect(() => {
    if (typeof getAccessToken !== "function") {
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

    // -------------------------------------------------------
    // EVENT
    // -------------------------------------------------------

    connection.on("ReceiveEntityChanged", handleEntityChanged);

    // -------------------------------------------------------
    // RECONNECTED
    // -------------------------------------------------------

    const handleReconnected = () => {
      console.log("🟢 SignalR: Reconnected");

      setIsConnected(true);

      /*
       * أثناء انقطاع الاتصال ممكن تكون حصلت
       * تغييرات missed.
       *
       * لذلك نمسح RTK Query cache بعد reconnect
       * لضمان عدم عرض بيانات قديمة.
       */
      dispatch(baseApi.util.resetApiState());
    };

    connection.onreconnected(handleReconnected);

    // -------------------------------------------------------
    // RECONNECTING
    // -------------------------------------------------------

    const handleReconnecting = () => {
      console.warn("🟡 SignalR: Reconnecting...");

      setIsConnected(false);
    };

    connection.onreconnecting(handleReconnecting);

    // -------------------------------------------------------
    // CLOSED
    // -------------------------------------------------------

    const handleClose = (error) => {
      console.warn("🔴 SignalR: Connection closed", error);

      setIsConnected(false);
    };

    connection.onclose(handleClose);

    // -------------------------------------------------------
    // START
    // -------------------------------------------------------

    if (connection.state === "Disconnected") {
      connection
        .start()
        .then(() => {
          console.log("🟢 SignalR: Connected");

          setIsConnected(true);
        })
        .catch((error) => {
          console.error("❌ SignalR connection failed:", error);

          setIsConnected(false);
        });
    } else if (connection.state === "Connected") {
      setIsConnected(true);
    }

    // -------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------

    return () => {
      connection.off("ReceiveEntityChanged", handleEntityChanged);

      connection.onreconnected(handleReconnected);

      connection.onreconnecting(handleReconnecting);

      connection.onclose(handleClose);

      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);

        batchTimerRef.current = null;
      }

      pendingTagsRef.current.clear();

      void stopConnection();
    };
  }, [getAccessToken, handleEntityChanged, dispatch, baseApi]);

  // =========================================================
  // CONTEXT
  // =========================================================

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

// =========================================================
// EXTERNAL UPDATE ALERT
// =========================================================

export function useExternalUpdateAlert(resource, entityId) {
  const context = useContext(RealtimeContext);

  if (!context || entityId == null) {
    return null;
  }

  return context.externalUpdates[`${resource}-${entityId}`] ?? null;
}

// =========================================================
// REALTIME STATUS
// =========================================================

export function useRealtimeStatus() {
  const context = useContext(RealtimeContext);

  return context?.isConnected ?? false;
}
