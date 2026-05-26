import React, { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { REVIEW_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { Search, ThumbsUp, Star, UserRound } from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "../lib/translate";
import { useAutoTranslateList } from "../lib/useAutoTranslate";
import { BlockShimmer } from "../components/Shimmer";

export default function Reviews() {
  const { t, lang } = useLang();
  const [category, setCategory] = useState("restaurant");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    api.get(`/reviews?${params}`).then(({ data }) => setItems(data || [])).catch(() => setItems([]));
  }, [category, query]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const refresh = (e) => {
      const nextCat = e?.detail?.category;
      if (nextCat && nextCat !== category) setCategory(nextCat);
      else load();
    };
    window.addEventListener("imta:reviews-updated", refresh);
    return () => window.removeEventListener("imta:reviews-updated", refresh);
  }, [load, category]);

  // Batch-translate review bodies on load (titles are place names → keep original).
  const { map, loading: tLoading, failed: tFailed, active } =
    useAutoTranslateList(items, "review_id", "content");

  return (
    <div className="px-4 py-4 fade-up" data-testid="reviews-page">
      <div className="mb-3">
        <div className="text-lg font-bold">{t("nav_reviews")} ⭐</div>
        <div className="text-xs text-gray-600 mt-0.5">{t("tips_reviews")}</div>
        {active && tFailed && (
          <div className="text-[11px] text-gray-400 mt-1" data-testid="reviews-translate-fallback">
            {t("translation_fallback")}
          </div>
        )}
      </div>

      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder={t("search")}
          className="w-full pl-9 pr-3 py-2 rounded-full bg-white border text-sm outline-none focus:ring-2 focus:ring-imta"
          data-testid="review-search"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2" data-testid="review-cat-tabs">
        {REVIEW_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${category === c.id ? "bg-imta text-white" : "bg-white border"}`}
            data-testid={`review-cat-${c.id}`}
          >
            {c.icon} {catLabel(c, lang, "review")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="text-center text-xs text-gray-400 py-8">{t("no_posts")}</div>}
        {items.map((r) => (
          <ReviewCard
            key={r.review_id}
            r={r}
            t={t}
            lang={lang}
            translated={active ? map[r.review_id] : null}
            translating={active && tLoading && !map[r.review_id]}
            active={active}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ r, t, lang, translated, translating, active }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [likes, setLikes] = useState(r.likes || 0);
  const isAnon = r.is_anonymous || r.author?.nickname === "익명";

  const like = async () => {
    try {
      const { data } = await api.post(`/reviews/${r.review_id}/like`);
      setLikes(data.likes);
    } catch { toast.error(t("login_required")); }
  };

  // When auto-translation is active and we have a result, default to translated view.
  const hasTranslation = active && !!translated;
  const showTranslated = hasTranslation && !showOriginal;
  const displayBody = showTranslated ? translated : r.content;

  return (
    <div className="imta-card p-3" data-testid={`review-card-${r.review_id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-sm">{r.place_name}</div>
        <div className="flex">
          {[1,2,3,4,5].map((i) => (
            <Star key={i} size={14} className={i <= r.rating ? "star-on fill-current" : "star-off"} />
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
        {isAnon ? (
          <span className="flex items-center gap-1">
            <UserRound size={11} className="text-gray-400" />
            {t("anonymous_short")}
          </span>
        ) : (
          <span>{r.author?.country_flag} {r.author?.nickname}</span>
        )}
        <span>·</span>
        <span>{timeAgo(r.created_at, lang)}</span>
      </div>
      {showTranslated && (
        <div className="text-[10px] italic text-gray-400 mt-2" data-testid={`review-translated-label-${r.review_id}`}>
          {t("translated_label")}
        </div>
      )}
      {translating ? (
        <BlockShimmer lines={2} />
      ) : (
        <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{displayBody}</div>
      )}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button onClick={like} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-medium flex items-center gap-1" data-testid={`review-like-${r.review_id}`}>
          <ThumbsUp size={11} /> {likes}
        </button>
        {hasTranslation && (
          <button
            onClick={() => setShowOriginal((s) => !s)}
            className="text-[11px] px-2 py-1 rounded-full bg-imta-light text-imta font-medium"
            data-testid={`review-toggle-${r.review_id}`}
          >
            {showOriginal ? t("view_translation") : t("original")}
          </button>
        )}
      </div>
    </div>
  );
}
