import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { PETITION_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { useAutoTranslateList } from "../lib/useAutoTranslate";
import { TitleShimmer } from "../components/Shimmer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search } from "lucide-react";

function daysLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default function Petitions() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState("votes");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const load = useCallback((s = sort) => {
    api.get(`/petitions?sort=${s}`).then(({ data }) => setItems(data || [])).catch(() => setItems([]));
  }, [sort]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("imta:petitions-updated", refresh);
    return () => window.removeEventListener("imta:petitions-updated", refresh);
  }, [load]);

  const filtered = items.filter((p) => {
    if (category && p.category !== category) return false;
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  // Auto-translate visible petition titles for non-KR users.
  const { map: titleMap, loading: titleLoading, failed: titleFailed, active } =
    useAutoTranslateList(filtered, "petition_id", "title");
  const titleFor = (p) => (active && titleMap[p.petition_id]) || p.title;
  const showShimmer = (p) => active && titleLoading && !titleMap[p.petition_id];

  return (
    <div className="px-4 py-4 fade-up" data-testid="petitions-page">
      <div className="mb-3">
        <div className="text-lg font-bold">{t("nav_petitions")} 📢</div>
        <div className="text-xs text-gray-600 mt-0.5">{t("tips_petitions")}</div>
        {active && titleFailed && (
          <div className="text-[11px] text-gray-400 mt-1" data-testid="petitions-translate-fallback">
            {t("translation_fallback")}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white border text-sm outline-none focus:ring-2 focus:ring-imta"
            data-testid="petition-search"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-28" data-testid="petition-sort"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">{t("sort_votes")}</SelectItem>
            <SelectItem value="newest">{t("sort_newest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2" data-testid="petition-cat-chips">
        <button onClick={() => setCategory("")} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${!category ? "bg-imta text-white" : "bg-white border"}`} data-testid="petition-cat-all">{t("all")}</button>
        {PETITION_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${category === c.id ? "bg-imta text-white" : "bg-white border"}`} data-testid={`petition-cat-${c.id}`}>{catLabel(c, lang, "petition")}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center text-xs text-gray-400 py-8">{t("no_posts")}</div>}
        {filtered.map((p) => {
          const dleft = daysLeft(p.deadline);
          const progress = Math.min(100, (p.signature_count / 300000) * 100);
          return (
            <button
              key={p.petition_id}
              onClick={() => navigate(`/petitions/${p.petition_id}`)}
              className="w-full text-left imta-card p-4"
              data-testid={`petition-card-${p.petition_id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-sm leading-snug flex-1">
                  {showShimmer(p) ? <TitleShimmer /> : titleFor(p)}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold ${p.status === "active" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                  D-{dleft}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">{p.description}</div>
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-imta" style={{ width: `${progress}%` }} />
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
  );
}
