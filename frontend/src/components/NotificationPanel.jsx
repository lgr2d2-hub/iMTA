import React from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "./ui/sheet";
import { useLang } from "../context/LanguageContext";
import { useNotifications } from "../context/NotificationContext";
import { Bell, MessageCircle, Reply, Hash, X } from "lucide-react";

const ICONS = { comment: MessageCircle, reply: Reply, chat: Hash, keyword: Bell };

export function NotificationPanel({ open, onOpenChange, onOpenChat }) {
  const { t } = useLang();
  const { notifications, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();

  const onClickItem = (n) => {
    markRead(n.notification_id);
    onOpenChange(false);
    // Navigate based on notification type
    if (n.type === "chat") {
      onOpenChat?.();
      return;
    }
    if (n.type === "keyword") {
      navigate("/board");
      return;
    }
    if (n.post_id && n.category_id) {
      navigate(`/board/${n.category_id}/${n.post_id}`);
      return;
    }
    // Fallback to board
    navigate("/board");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-[70vh] rounded-b-2xl p-0 [&>button.absolute]:hidden" data-testid="notification-panel">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="text-lg font-bold">{t("notifications")}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="text-sm text-imta font-medium px-3 min-h-[44px] inline-flex items-center"
              data-testid="read-all-btn"
            >
              {t("read_all")}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-11 h-11 rounded-full hover:bg-gray-100 flex items-center justify-center"
              aria-label={t("close")}
              data-testid="close-notification-btn"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="px-2 pb-6 overflow-auto">
          {notifications.length === 0 && (
            <div className="text-center text-gray-500 py-12 text-sm">{t("no_notifications")}</div>
          )}
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <button
                key={n.notification_id}
                onClick={() => onClickItem(n)}
                className={`w-full text-left flex gap-3 p-3 rounded-xl mx-2 my-1 transition ${
                  n.read
                    ? "bg-white border border-gray-100"
                    : "bg-imta-light border-l-4 border-l-[#2E6B5E] border-y border-r border-[#E8F4F1]"
                }`}
                data-testid={`notification-${n.notification_id}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  n.read ? "bg-gray-100 text-gray-500" : "bg-white text-imta"
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${n.read ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}>
                    {n.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{n.body}</div>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#2E6B5E] flex-shrink-0 mt-2" />}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
