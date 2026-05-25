import React from "react";
import { Sheet, SheetContent } from "./ui/sheet";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, MessageCircle, Heart, Bookmark, Settings, User } from "lucide-react";

export function SideMenu({ open, onOpenChange }) {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const items = [
    { icon: FileText, label: t("my_posts"), path: "/profile?tab=posts", id: "my-posts" },
    { icon: MessageCircle, label: t("my_comments"), path: "/profile?tab=comments", id: "my-comments" },
    { icon: Heart, label: t("liked_posts"), path: "/profile?tab=liked", id: "liked-posts" },
    { icon: Bookmark, label: t("saved_posts"), path: "/profile?tab=saved", id: "saved-posts" },
    { icon: Settings, label: t("settings"), path: "/profile", id: "settings" },
  ];

  const go = (path) => { onOpenChange(false); navigate(path); };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 bg-white" data-testid="side-menu">
        <div className="bg-gradient-to-br from-[#2E6B5E] to-[#4DB8A8] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              {user?.country_flag || "🌍"}
            </div>
            <div>
              <div className="font-semibold text-lg" data-testid="menu-nickname">
                {user?.nickname || user?.name || "User"}
              </div>
              <div className="text-xs opacity-90">{user?.country_name || ""}{user?.district ? ` · ${user.district}` : ""}</div>
            </div>
          </div>
        </div>
        <div className="p-2">
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
          <div className="border-t my-2" />
          <button
            data-testid="menu-logout"
            onClick={async () => { await logout(); onOpenChange(false); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-50 rounded-lg text-left text-red-600"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">{t("logout")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
