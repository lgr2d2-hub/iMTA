import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useLang } from "../context/LanguageContext";
import api from "../lib/api";
import { Bell, MessageCircle, Reply, Hash } from "lucide-react";

const ICONS = { comment: MessageCircle, reply: Reply, chat: Hash, keyword: Bell };

export function NotificationPanel({ open, onOpenChange }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    api.get("/notifications").then(({ data }) => setItems(data || [])).catch(() => setItems([]));
  }, [open]);

  const readAll = async () => {
    await api.post("/notifications/read-all").catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-[70vh] rounded-b-2xl p-0" data-testid="notification-panel">
        <SheetHeader className="px-4 pt-4 pb-2 flex flex-row items-center justify-between">
          <SheetTitle className="text-lg">{t("notifications")}</SheetTitle>
          <button onClick={readAll} className="text-sm text-imta font-medium" data-testid="read-all-btn">
            {t("read_all")}
          </button>
        </SheetHeader>
        <div className="px-2 pb-6 overflow-auto">
          {items.length === 0 && (
            <div className="text-center text-gray-500 py-12 text-sm">{t("no_notifications")}</div>
          )}
          {items.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <div
                key={n.notification_id}
                className={`flex gap-3 p-3 rounded-xl mx-2 my-1 ${n.read ? "bg-white" : "bg-imta-light"}`}
                data-testid={`notification-${n.notification_id}`}
              >
                <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-imta">
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="text-xs text-gray-600">{n.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
