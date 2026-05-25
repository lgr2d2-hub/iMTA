import React from "react";
import { Sheet, SheetContent } from "./ui/sheet";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, MessageCircle, Heart, Bookmark, Settings } from "lucide-react";
import { userFlag } from "../lib/flag";

export function SideMenu({ open, onOpenChange }) {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const items = [
    { icon: FileText,      label: t("my_posts"),     path: "/profile/posts",    id: "my-posts" },
    { icon: MessageCircle, label: t("my_comments"),  path: "/profile/comments", id: "my-comments" },
    { icon: Heart,         label: t("liked_posts"),  path: "/profile/liked",    id: "liked-posts" },
    { icon: Bookmark,      label: t("saved_posts"),  path: "/profile/saved",    id: "saved-posts" },
    { icon: Settings,      label: t("settings"),     path: "/settings",         id: "settings" },
  ];

  const go = (path) => { onOpenChange(false); navigate(path); };
  const flag = userFlag(user);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[340px] p-0 bg-white flex flex-col"
        data-testid="side-menu"
      >
        <div
          className="p-5 text-white"
          style={{ background: "linear-gradient(135deg, #3AAFA0, #2E8B7A)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 40, height: 40, background: "#E8F4F1", fontSize: 22, lineHeight: 1 }}
              data-testid="menu-avatar"
            >
              {flag}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate" data-testid="menu-nickname">
                {user?.nickname || user?.name || "User"}
              </div>
              <div className="text-xs opacity-90 truncate" data-testid="menu-country">
                {user?.country_name || ""}{user?.district ? ` · ${user.district}` : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 flex-1 overflow-auto">
          {items.map((it) => (
            <button
              key={it.id}
              data-testid={`menu-${it.id}`}
              onClick={() => go(it.path)}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg text-left"
            >
              <it.icon size={18} className="text-imta" />
              <span className="text-sm font-medium">{it.label}</span>
            </button>
          ))}
        </div>

        <div className="border-t p-2">
          <button
            data-testid="menu-logout"
            onClick={async () => { await logout(); onOpenChange(false); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-50 rounded-lg text-left"
            style={{ color: "#E53E3E" }}
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">{t("logout")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
