import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import { useLang } from "../context/LanguageContext";
import { BOARD_CATEGORIES } from "../lib/constants";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function WritePostModal({ open, onOpenChange, onCreated }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [categoryId, setCategoryId] = useState("");
  const [subId, setSubId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);

  const category = BOARD_CATEGORIES.find((c) => c.id === categoryId);

  const reset = () => {
    setCategoryId(""); setSubId(""); setTitle(""); setContent(""); setAnonymous(false);
  };

  const submit = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    if (!categoryId || !title.trim() || !content.trim()) { toast.error(t("error")); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/posts", {
        category_id: categoryId, sub_category_id: subId, title: title.trim(), content: content.trim(), is_anonymous: anonymous,
      });
      toast.success(t("success"));
      reset();
      onOpenChange(false);
      onCreated?.(data);
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden" data-testid="write-post-modal">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>{t("new_post")}</DialogTitle>
        </DialogHeader>
        <div className="px-5 py-3 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">{t("category")}</label>
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubId(""); }}>
              <SelectTrigger data-testid="post-category-select"><SelectValue placeholder={t("select_category")} /></SelectTrigger>
              <SelectContent>
                {BOARD_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.korean} / {c.english}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {category && (
            <div>
              <label className="text-xs font-medium text-gray-600">{t("sub_category")}</label>
              <Select value={subId} onValueChange={setSubId}>
                <SelectTrigger data-testid="post-subcategory-select"><SelectValue placeholder={t("select")} /></SelectTrigger>
                <SelectContent>
                  {category.subs.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.korean} / {s.english}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">{t("title")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("title_ph")}
              className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-imta"
              data-testid="post-title-input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">{t("content")}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("content_ph")}
              className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-imta min-h-[200px] resize-y"
              data-testid="post-content-input"
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-700">{t("anonymous")}</span>
            <Switch checked={anonymous} onCheckedChange={setAnonymous} data-testid="post-anonymous-switch" />
          </div>
        </div>
        <DialogFooter className="px-5 py-4 bg-gray-50">
          <button onClick={() => onOpenChange(false)} className="btn-ghost" data-testid="post-cancel-btn">
            {t("cancel")}
          </button>
          <button onClick={submit} disabled={busy} className="btn-primary" data-testid="post-submit-btn">
            {busy ? "..." : t("submit")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
