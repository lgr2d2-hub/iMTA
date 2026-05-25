import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { MessageSquare, Info, Megaphone, Star, ArrowRight, Users, FileText, PenSquare } from "lucide-react";
import api from "../lib/api";
import { BOARD_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { timeAgo } from "../lib/translate";

function daysLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, signatures: 0 });

  useEffect(() => {
    api.get("/posts").then(({ data }) => setRecentPosts((data || []).slice(0, 3))).catch(() => {});
    api.get("/petitions?sort=newest").then(({ data }) => {
      const active = (data || []).filter((p) => p.status === "active");
      active.sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
      setPetitions(active.slice(0, 2));
    }).catch(() => {});
    api.get("/stats").then(({ data }) => setStats(data || stats)).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const tiles = [
    { key: "board",     icon: MessageSquare, title: t("nav_board"),     desc: t("tile_desc_board"),     path: "/board" },
    { key: "lifeinfo",  icon: Info,          title: t("nav_lifeinfo"),  desc: t("tile_desc_lifeinfo"),  path: "/lifeinfo" },
    { key: "petitions", icon: Megaphone,     title: t("nav_petitions"), desc: t("tile_desc_petitions"), path: "/petitions" },
    { key: "reviews",   icon: Star,          title: t("nav_reviews"),   desc: t("tile_desc_reviews"),   path: "/reviews" },
  ];

  const catFor = (id) => BOARD_CATEGORIES.find((c) => c.id === id);

  const ddayColor = (d) => {
    if (d <= 7) return { bg: "#FEE2E2", color: "#DC2626" };
    if (d <= 30) return { bg: "#FFEDD5", color: "#EA580C" };
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  return (
    <div className="fade-up" style={{ background: "#F5F8F7", minHeight: "100%" }} data-testid="dashboard-page">
      {/* Welcome */}
      <div className="px-4 pt-6 pb-2">
        <div className="text-xl font-bold tracking-tight" style={{ lineHeight: 1.35 }}>
          {t("welcome")}! 👋 <span>{user?.country_flag || "🌍"}</span>{" "}
          <span className="relative inline-block">
            <span className="text-imta">{user?.nickname || user?.name}</span>
            <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#4DB8A8] rounded-full opacity-70" />
          </span>
          {t("welcome_suffix")}
        </div>
        <div className="text-sm mt-2" style={{ color: "#666666" }}>{t("welcome_sub")}</div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2" style={{ gap: 14, paddingLeft: 16, paddingRight: 16, paddingTop: 16 }} data-testid="dashboard-tiles">
        {tiles.map((tile, i) => (
          <button
            key={tile.key}
            onClick={() => navigate(tile.path)}
            className="imta-tile text-left fade-up flex flex-col"
            style={{ animationDelay: `${i * 80}ms`, minHeight: 160, padding: 22 }}
            data-testid={`tile-${tile.key}`}
          >
            <tile.icon size={32} strokeWidth={2} className="relative z-10" />
            <div className="relative z-10 mt-auto" style={{ paddingTop: 14 }}>
              <div className="font-bold text-white" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                {tile.title}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
                {tile.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Stats banner */}
      <div className="mx-4 mt-5 rounded-2xl py-3 px-4 grid grid-cols-3" style={{ background: "#E8F4F1" }} data-testid="stats-banner">
        <StatItem icon={<Users size={14} />} value={stats.users} label={t("stats_users")} />
        <StatItem icon={<FileText size={14} />} value={stats.posts} label={t("stats_posts")} />
        <StatItem icon={<PenSquare size={14} />} value={stats.signatures} label={t("stats_signatures")} />
      </div>

      {/* Recent Posts */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-bold">{t("recent_posts")}</div>
          <button onClick={() => navigate("/board")} className="text-xs text-imta font-medium flex items-center gap-0.5" data-testid="view-more-posts">
            {t("view_more")} <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2" data-testid="recent-posts-list">
          {recentPosts.map((p) => {
            const cat = catFor(p.category_id);
            return (
              <button
                key={p.post_id}
                onClick={() => navigate(`/board/${p.category_id}/${p.post_id}`)}
                className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:border-[#4DB8A8] transition"
                data-testid={`recent-post-${p.post_id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    {cat && <span className="imta-chip" style={{ padding: "2px 8px", fontSize: 10 }}>{cat.icon} {catLabel(cat, lang, "board")}</span>}
                    <span>{p.author?.country_flag} {p.author?.nickname}</span>
                    <span className="text-gray-400">· {timeAgo(p.created_at, lang)}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Petitions */}
      <div className="mt-6 px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-bold">{t("active_petitions")}</div>
          <button onClick={() => navigate("/petitions")} className="text-xs text-imta font-medium flex items-center gap-0.5" data-testid="view-all-petitions">
            {t("view_all")} <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2" data-testid="active-petitions-list">
          {petitions.map((p) => {
            const d = daysLeft(p.deadline);
            const c = ddayColor(d);
            const progress = Math.min(100, (p.signature_count / 300000) * 100);
            return (
              <button
                key={p.petition_id}
                onClick={() => navigate(`/petitions/${p.petition_id}`)}
                className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 hover:border-[#4DB8A8] transition"
                data-testid={`active-petition-${p.petition_id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold line-clamp-1 flex-1">{p.title}</div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: c.bg, color: c.color }}
                  >
                    D-{d}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#3AAFA0] to-[#4DB8A8]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    <span className="font-semibold text-imta">{p.signature_count.toLocaleString()}</span> {t("signatures")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-imta flex items-center gap-1" style={{ fontWeight: 800, fontSize: 18 }}>
        <span className="opacity-80">{icon}</span>
        {Number(value || 0).toLocaleString()}
      </div>
      <div className="text-[11px] text-gray-600 mt-0.5">{label}</div>
    </div>
  );
}
