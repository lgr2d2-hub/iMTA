import React, { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { REVIEW_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { Search, ThumbsUp, Languages, Star } from "lucide-react";
import { toast } from "sonner";
import { translateText, timeAgo } from "../lib/translate";

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

  return (
    <div className="px-4 py-4 fade-up" data-testid="reviews-page">
      <div className="mb-3">
        <div className="text-lg font-bold">{t("nav_reviews")} ⭐</div>
        <div className="text-xs text-gray-600 mt-0.5">{t("tips_reviews")}</div>
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
        {items.map((r) => <ReviewCard key={r.review_id} r={r} t={t} lang={lang} />)}
      </div>
    </div>
  );
}

function ReviewCard({ r, t, lang }) {
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [likes, setLikes] = useState(r.likes || 0);

  const translateLabel = () => {
    if (translating) return t("translating");
    if (translated) return t("original");
    return t("translate");
  };

  const like = async () => {
    try {
      const { data } = await api.post(`/reviews/${r.review_id}/like`);
      setLikes(data.likes);
    } catch { toast.error(t("login_required")); }
  };
  const doTranslate = async () => {
    if (translated) { setTranslated(null); return; }
    setTranslating(true);
    setTranslated(await translateText(r.content, lang));
    setTranslating(false);
  };

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
        <span>{r.author?.country_flag} {r.author?.nickname}</span>
        <span>·</span>
        <span>{timeAgo(r.created_at, lang)}</span>
      </div>
      <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{translated || r.content}</div>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={like} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-medium flex items-center gap-1" data-testid={`review-like-${r.review_id}`}>
          <ThumbsUp size={11} /> {likes}
        </button>
        <button onClick={doTranslate} className="text-xs px-3 py-1.5 rounded-full bg-imta-light text-imta font-medium flex items-center gap-1" data-testid={`review-translate-${r.review_id}`}>
          <Languages size={11} /> {translateLabel()}
        </button>
      </div>
    </div>
  );
}
