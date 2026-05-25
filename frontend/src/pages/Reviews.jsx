import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { REVIEW_CATEGORIES } from "../lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Plus, Search, ThumbsUp, Languages, Star } from "lucide-react";
import { toast } from "sonner";
import { translateText, timeAgo } from "../lib/translate";

export default function Reviews() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [category, setCategory] = useState("restaurant");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    api.get(`/reviews?${params}`).then(({ data }) => setItems(data || [])).catch(() => setItems([]));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [category]);

  return (
    <div className="px-4 py-4 fade-up" data-testid="reviews-page">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-bold">{t("nav_reviews")} ⭐</div>
          <div className="text-xs text-gray-600 mt-0.5">{t("tips_reviews")}</div>
        </div>
        <button onClick={() => setCreateOpen(true)} className="p-2 rounded-full bg-imta text-white" data-testid="create-review-btn">
          <Plus size={18} />
        </button>
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
            {c.icon} {c.korean} / {c.english}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="text-center text-xs text-gray-400 py-8">{t("no_posts")}</div>}
        {items.map((r) => <ReviewCard key={r.review_id} r={r} t={t} lang={lang} onChange={load} />)}
      </div>

      <CreateReviewDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} user={user} t={t} />
    </div>
  );
}

function ReviewCard({ r, t, lang, onChange }) {
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [likes, setLikes] = useState(r.likes || 0);

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
          <Languages size={11} /> {translating ? t("translating") : (translated ? t("original") : t("translate"))}
        </button>
      </div>
    </div>
  );
}

function CreateReviewDialog({ open, onOpenChange, onCreated, user, t }) {
  const [category, setCategory] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [anon, setAnon] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    if (!category || !placeName.trim() || content.trim().length < 50) { toast.error(t("error")); return; }
    setBusy(true);
    try {
      await api.post("/reviews", { category, place_name: placeName.trim(), rating, content: content.trim(), is_anonymous: anon });
      toast.success(t("success"));
      onOpenChange(false);
      setCategory(""); setPlaceName(""); setRating(5); setContent(""); setAnon(false);
      onCreated?.();
    } catch { toast.error(t("error")); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="create-review-modal">
        <DialogHeader><DialogTitle>{t("create_review")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="review-cat-select"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>{REVIEW_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.korean} / {c.english}</SelectItem>)}</SelectContent>
          </Select>
          <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder={t("place_name")} className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none" data-testid="review-place-input" />
          <div>
            <label className="text-xs text-gray-600">{t("rating")}</label>
            <div className="flex gap-1 mt-1" data-testid="review-rating-stars">
              {[1,2,3,4,5].map((i) => (
                <button key={i} onClick={() => setRating(i)} data-testid={`rating-star-${i}`}>
                  <Star size={28} className={i <= rating ? "star-on fill-current" : "star-off"} />
                </button>
              ))}
            </div>
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("review_ph")} className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none min-h-[120px]" data-testid="review-content-input" />
          <div className="flex items-center justify-between"><span className="text-sm">{t("anonymous")}</span><Switch checked={anon} onCheckedChange={setAnon} data-testid="review-anon-switch" /></div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="btn-ghost">{t("cancel")}</button>
          <button onClick={submit} disabled={busy} className="btn-primary" data-testid="review-submit-btn">{busy ? "..." : t("submit")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
