import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { PETITION_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export function CreatePetitionModal({ open, onOpenChange }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);

  const reset = () => { setTitle(""); setDescription(""); setCategory(""); setDays(30); };

  const submit = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    if (!title.trim() || !description.trim() || !category) { toast.error(t("error")); return; }
    setBusy(true);
    try {
      const deadline = new Date(Date.now() + days * 86400000).toISOString();
      await api.post("/petitions", { title: title.trim(), description: description.trim(), category, deadline });
      toast.success(t("success"));
      reset();
      onOpenChange(false);
      window.dispatchEvent(new Event("imta:petitions-updated"));
    } catch { toast.error(t("error")); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md" data-testid="create-petition-modal">
        <DialogHeader><DialogTitle>{t("create_petition")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("title")} className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none" data-testid="petition-title-input" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="petition-cat-select"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>{PETITION_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{catLabel(c, lang, "petition")}</SelectItem>)}</SelectContent>
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
