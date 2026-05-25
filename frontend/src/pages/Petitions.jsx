import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { PETITION_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

function daysLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default function Petitions() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState("votes");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const load = (s = sort) => {
    api.get(`/petitions?sort=${s}`).then(({ data }) => setItems(data || [])).catch(() => setItems([]));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sort]);

  const filtered = items.filter((p) => {
    if (category && p.category !== category) return false;
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-4 py-4 fade-up" data-testid="petitions-page">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-bold">{t("nav_petitions")} 📢</div>
          <div className="text-xs text-gray-600 mt-0.5">{t("tips_petitions")}</div>
        </div>
        <button onClick={() => setCreateOpen(true)} className="p-2 rounded-full bg-imta text-white" data-testid="create-petition-btn">
          <Plus size={18} />
        </button>
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
          <button key={c.id} onClick={() => setCategory(c.id)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${category === c.id ? "bg-imta text-white" : "bg-white border"}`} data-testid={`petition-cat-${c.id}`}>{catLabel(c, lang)}</button>
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
                <div className="font-semibold text-sm leading-snug">{p.title}</div>
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

      <CreatePetitionDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => load()} user={user} t={t} />
    </div>
  );
}

function CreatePetitionDialog({ open, onOpenChange, onCreated, user, t }) {
  const { lang } = useLang();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    if (!title.trim() || !description.trim() || !category) { toast.error(t("error")); return; }
    setBusy(true);
    try {
      const deadline = new Date(Date.now() + days * 86400000).toISOString();
      await api.post("/petitions", { title: title.trim(), description: description.trim(), category, deadline });
      toast.success(t("success"));
      onOpenChange(false);
      setTitle(""); setDescription(""); setCategory(""); setDays(30);
      onCreated?.();
    } catch { toast.error(t("error")); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="create-petition-modal">
        <DialogHeader><DialogTitle>{t("create_petition")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("title")} className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none" data-testid="petition-title-input" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="petition-cat-select"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>{PETITION_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{catLabel(c, lang)}</SelectItem>)}</SelectContent>
          </Select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("description")} className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none min-h-[140px]" data-testid="petition-desc-input" />
          <div>
            <label className="text-xs text-gray-600">{t("deadline")} ({days} {t("days_unit")})</label>
            <input type="range" min={7} max={90} value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="w-full" data-testid="petition-deadline-slider" />
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="btn-ghost">{t("cancel")}</button>
          <button onClick={submit} disabled={busy} className="btn-primary" data-testid="petition-submit-btn">{busy ? "..." : t("submit")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
