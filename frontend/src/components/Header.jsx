import React from "react";
import { Bell, Menu, Globe, Check } from "lucide-react";
import { Logo } from "./Logo";
import { useLang } from "../context/LanguageContext";
import { useNotifications } from "../context/NotificationContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export function Header({ onOpenMenu, onOpenNotifications }) {
  const { lang, setLang, languages, t } = useLang();
  const { unread } = useNotifications();
  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header
      className="sticky top-0 z-30"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #E8F4F1" }}
      data-testid="app-header"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-2 rounded-lg hover:bg-gray-100 flex items-center gap-1"
              data-testid="language-picker-btn"
            >
              <Globe size={20} className="text-gray-700" />
              <span className="text-sm">{current.flag}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-auto">
              <DropdownMenuLabel>{t("translate") || "Language"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languages.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className="cursor-pointer"
                  data-testid={`lang-${l.code}`}
                >
                  <span className="mr-2">{l.flag}</span>
                  <span className="flex-1">{l.name}</span>
                  {lang === l.code && <Check size={14} className="text-imta" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg hover:bg-gray-100"
            data-testid="notification-bell-btn"
            aria-label="notifications"
          >
            <Bell size={20} className="text-gray-700" />
            {unread > 0 && (
              <span
                className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 min-w-[16px] h-4 flex items-center justify-center font-semibold"
                data-testid="notification-badge"
              >
                {unread}
              </span>
            )}
          </button>

          <button
            onClick={onOpenMenu}
            className="p-2 rounded-lg hover:bg-gray-100"
            data-testid="menu-btn"
            aria-label="menu"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
