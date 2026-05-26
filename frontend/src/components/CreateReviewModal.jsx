import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { REVIEW_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export function CreateReviewModal({ open, onOpenChange }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [anon, setAnon] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = () => { setCategory(""); setPlaceName(""); setRating(5); setContent(""); setAnon(false); };

  const submit = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    if (!category) { toast.error(t("select_review_category")); return; }
    if (!placeName.trim()) { toast.error(t("enter_place_name")); return; }
    if (content.trim().length < 50) { toast.error(t("review_too_short")); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/reviews", {
        category, place_name: placeName.trim(), rating, content: content.trim(), is_anonymous: anon,
      });
      toast.success(t("success"));
      reset();
      onOpenChange(false);
      // Pass the new review's category so the list page switches tab + refreshes.
      window.dispatchEvent(new CustomEvent("imta:reviews-updated", { detail: { category: data?.category || category } }));
    } catch (e) {
      const msg = e?.response?.data?.detail || t("error");
      toast.error(typeof msg === "string" ? msg : t("error"));
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md" data-testid="create-review-modal">
        <DialogHeader><DialogTitle>{t("create_review")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="review-cat-select"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>{REVIEW_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {catLabel(c, lang, "review")}</SelectItem>)}</SelectContent>
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
          <div className="text-[11px] text-right text-gray-400" data-testid="review-char-count">{content.trim().length}/50</div>
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
