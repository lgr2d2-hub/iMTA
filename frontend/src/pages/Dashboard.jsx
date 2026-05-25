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
    { key: "board", icon: MessageSquare, korean: "게시판", english: t("nav_board"), path: "/board" },
    { key: "lifeinfo", icon: Info, korean: "정보생활", english: t("nav_lifeinfo"), path: "/lifeinfo" },
    { key: "petitions", icon: Megaphone, korean: "청원", english: t("nav_petitions"), path: "/petitions" },
    { key: "reviews", icon: Star, korean: "리뷰", english: t("nav_reviews"), path: "/reviews" },
  ];

  const tips = [
    { icon: "💬", title: "Community", text: t("tips_board") },
    { icon: "ℹ️", title: "Life Info", text: t("tips_lifeinfo") },
    { icon: "📢", title: "Petitions", text: t("tips_petitions") },
    { icon: "⭐", title: "Reviews", text: t("tips_reviews") },
  ];

  return (
    <div className="px-4 py-5 fade-up" data-testid="dashboard-page">
      <div className="mb-5">
        <div className="text-xl font-bold tracking-tight">
          {t("welcome")}! 👋 <span className="text-imta">{user?.nickname || user?.name}</span>{t("welcome") === "환영합니다" ? "님" : ""}
        </div>
        <div className="text-sm text-gray-600 mt-1">{t("welcome_sub")}</div>
      </div>

      <div className="grid grid-cols-2 gap-3" data-testid="dashboard-tiles">
        {tiles.map((tile, i) => (
          <button
            key={tile.key}
            onClick={() => navigate(tile.path)}
            className="imta-tile text-left fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
            data-testid={`tile-${tile.key}`}
          >
            <tile.icon size={26} strokeWidth={2} />
            <div className="mt-8 relative z-10">
              <div className="text-lg font-bold">{tile.korean}</div>
              <div className="text-xs opacity-90 flex items-center gap-1 mt-1">{tile.english} <ArrowRight size={12} /></div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-700 mb-2">{t("tips_title")}</div>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="imta-card p-3 flex items-start gap-3">
              <div className="text-2xl">{tip.icon}</div>
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
