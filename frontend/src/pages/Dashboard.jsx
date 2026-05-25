import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { MessageSquare, Info, Megaphone, Star, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const tiles = [
    { key: "board", icon: MessageSquare, label: t("nav_board"), path: "/board", emoji: "💬" },
    { key: "lifeinfo", icon: Info, label: t("nav_lifeinfo"), path: "/lifeinfo", emoji: "ℹ️" },
    { key: "petitions", icon: Megaphone, label: t("nav_petitions"), path: "/petitions", emoji: "📢" },
    { key: "reviews", icon: Star, label: t("nav_reviews"), path: "/reviews", emoji: "⭐" },
  ];

  const tips = [
    { emoji: "💬", title: t("nav_board"), text: t("tips_board") },
    { emoji: "ℹ️", title: t("nav_lifeinfo"), text: t("tips_lifeinfo") },
    { emoji: "📢", title: t("nav_petitions"), text: t("tips_petitions") },
    { emoji: "⭐", title: t("nav_reviews"), text: t("tips_reviews") },
  ];

  return (
    <div className="px-4 py-5 fade-up" data-testid="dashboard-page">
      <div className="mb-5">
        <div className="text-xl font-bold tracking-tight">
          {t("welcome")}! 👋 <span className="text-imta">{user?.nickname || user?.name}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">{t("welcome_sub")}</div>
      </div>

      <div className="grid grid-cols-2 gap-4" data-testid="dashboard-tiles">
        {tiles.map((tile, i) => (
          <button
            key={tile.key}
            onClick={() => navigate(tile.path)}
            className="imta-tile text-left fade-up flex flex-col justify-between"
            style={{ animationDelay: `${i * 80}ms`, minHeight: 170, padding: 24 }}
            data-testid={`tile-${tile.key}`}
          >
            <div className="flex items-center gap-2 relative z-10">
              <tile.icon size={40} strokeWidth={2} />
              <span className="text-2xl">{tile.emoji}</span>
            </div>
            <div className="relative z-10">
              <div className="font-bold leading-tight" style={{ fontSize: 22 }}>{tile.label}</div>
              <div className="flex items-center gap-1 mt-1 opacity-90" style={{ fontSize: 14 }}>
                <ArrowRight size={14} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-700 mb-2">{t("tips_title")}</div>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="imta-card p-3 flex items-start gap-3">
              <div className="text-2xl">{tip.emoji}</div>
              <div>
                <div className="text-sm font-semibold">{tip.title}</div>
                <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{tip.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
