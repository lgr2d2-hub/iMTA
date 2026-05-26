import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); setUnread(0); return; }
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data || []);
      setUnread((data || []).filter((n) => !n.read).length);
    } catch (e) {
      console.error("notifications.refresh:", e);
      setNotifications([]); setUnread(0);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll for new notifications every 30s while a user is logged in.
  useEffect(() => {
    if (!user) return undefined;
    const id = setInterval(refresh, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [user, refresh]);

  const markAllRead = useCallback(async () => {
    try { await api.post("/notifications/read-all"); } catch (e) { console.error("read-all:", e); }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => n.notification_id === id ? { ...n, read: true } : n);
      setUnread(next.filter((n) => !n.read).length);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ notifications, unread, refresh, markAllRead, markRead }),
    [notifications, unread, refresh, markAllRead, markRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

const EMPTY = { notifications: [], unread: 0, refresh: () => {}, markAllRead: () => {}, markRead: () => {} };

export function useNotifications() {
  return useContext(NotificationContext) || EMPTY;
}
