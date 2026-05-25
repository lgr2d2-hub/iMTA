import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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
    } catch {
      setNotifications([]); setUnread(0);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const markAllRead = useCallback(async () => {
    try { await api.post("/notifications/read-all"); } catch { /* noop */ }
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

  return (
    <NotificationContext.Provider value={{ notifications, unread, refresh, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext) || { notifications: [], unread: 0, refresh: () => {}, markAllRead: () => {}, markRead: () => {} };
}
