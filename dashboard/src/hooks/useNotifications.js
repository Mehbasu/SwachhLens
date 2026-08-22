import { useState, useEffect, useCallback, useRef } from "react";
import { getComplaints } from "../services/api";

const SEEN_KEY = "swachhlens_seen_complaints";
const POLL_INTERVAL_MS = 30000;

function getSeenIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const seenIdsRef = useRef(getSeenIds());

  const fetchAndDiff = useCallback(async () => {
    const res = await getComplaints({ status: "submitted", sortBy: "date", sortOrder: "desc" });
    if (!res.success) return;

    const seenIds = seenIdsRef.current;
    const allComplaints = res.data.slice(0, 50);

    const built = allComplaints.map((c) => ({
      id: c.id,
      title: ("New " + (c.category ? c.category.replace(/_/g, " ") : "Waste") + " Complaint"),
      desc: c.address || c.comment || c.reporter_comment || "Location not specified",
      time: c.timestamp
        ? new Date(c.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : "Just now",
      type: (c.priority_score || 0) >= 75 ? "urgent" : "info",
      seen: seenIds.has(c.id),
      complaintId: c.id,
    }));

    setNotifications(built.slice(0, 20));
    setUnseenCount(built.filter((n) => !n.seen).length);
  }, []);

  useEffect(() => {
    fetchAndDiff();
  }, [fetchAndDiff]);

  useEffect(() => {
    const timer = setInterval(fetchAndDiff, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchAndDiff]);

  const markAllSeen = useCallback(() => {
    const ids = new Set(notifications.map((n) => n.id));
    const merged = new Set([...seenIdsRef.current, ...ids]);
    seenIdsRef.current = merged;
    saveSeenIds(merged);
    setUnseenCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
  }, [notifications]);

  return { notifications, unseenCount, markAllSeen, refresh: fetchAndDiff };
}
