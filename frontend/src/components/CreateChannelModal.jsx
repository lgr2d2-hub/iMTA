import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// Curated emoji set tailored to the IMTA community.
const EMOJI_CHOICES = [
  "💬","🌍","🎉","💍","💼","🎓","🍜","🏠","⚽","🎵",
  "📷","✈️","🛒","🏥","📚","💪","🎨","🐾","☕","🌸",
  "🚴","🎮","🧘","🤝","💡","🎤","🌶️","🎬","💸","🛠️",
];

export function CreateChannelModal({ open, onOpenChange, onCreated }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💬");
  const [busy, setBusy] = useState(false);

  const reset = () => { setName(""); setDescription(""); setIcon("💬"); };

  const submit = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    const trimmed = name.trim();
    if (trimmed.length < 2) { toast.error(t("channel_name_too_short")); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/chat/channels", { name: trimmed, description: description.trim(), icon });
      toast.success(t("success"));
      reset();
      onOpenChange(false);
      if (onCreated) onCreated(data);
    } catch (e) {
      const msg = e?.response?.data?.detail || t("error");
      toast.error(typeof msg === "string" ? msg : t("error"));
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md" data-testid="create-channel-modal">
        <DialogHeader><DialogTitle>{t("create_channel")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">{t("pick_emoji")}</label>
            <div className="grid grid-cols-10 gap-1.5 mt-1.5 p-2 rounded-lg bg-gray-50 max-h-32 overflow-y-auto" data-testid="emoji-grid">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`text-xl h-9 w-9 rounded-md flex items-center justify-center transition ${icon === e ? "bg-imta text-white ring-2 ring-imta" : "hover:bg-white"}`}
                  data-testid={`emoji-${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">{t("channel_name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("channel_name_ph")}
              maxLength={40}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-imta"
              data-testid="channel-name-input"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">{t("description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("channel_desc_ph")}
              maxLength={200}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-white text-sm outline-none min-h-[64px] focus:ring-2 focus:ring-imta"
              data-testid="channel-desc-input"
            />
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="btn-ghost">{t("cancel")}</button>
          <button onClick={submit} disabled={busy} className="btn-primary" data-testid="channel-submit-btn">{busy ? "..." : t("submit")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
