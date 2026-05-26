import React, { useState } from "react";
import { Languages } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { translateBlock, getTargetLang, getTargetLangName } from "../lib/translate";

/**
 * Reusable translate / view-original button.
 *
 * Props:
 *  - id: stable id used as cache key (e.g. `post_seed_1` or `comment_xyz`)
 *  - blocks: { [key: string]: string } original text blocks to translate
 *            (e.g. { title: post.title, body: post.content })
 *  - source: source language (default 'ko')
 *  - onResult: (translatedMap | null) => void  — called with translated blocks
 *              on success, or null when the user toggles back to the original.
 *  - size: 'sm' | 'md' (default 'md')
 */
export function TranslateButton({ id, blocks, source = "ko", onResult, size = "md" }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState(false);

  const targetLang = getTargetLang(user?.country_code);
  const targetName = getTargetLangName(user?.country_code);

  const click = async () => {
    if (busy) return;
    if (shown) {
      // Toggle back to original.
      onResult(null);
      setShown(false);
      return;
    }
    if (targetLang === source) {
      toast.info(t("already_same_lang"));
      return;
    }
    setBusy(true);
    try {
      const entries = Object.entries(blocks || {}).filter(([, v]) => (v || "").trim());
      const results = {};
      for (const [k, v] of entries) {
        // eslint-disable-next-line no-await-in-loop
        const tr = await translateBlock({ text: v, target: targetLang, source, id: `${id}_${k}` });
        results[k] = tr;
      }
      onResult(results);
      setShown(true);
    } catch (e) {
      console.error("translate button:", e);
      toast.error(t("translate_failed"));
      onResult(null);
      setShown(false);
    } finally {
      setBusy(false);
    }
  };

  const label = busy
    ? t("translating")
    : shown
      ? t("original")
      : `${t("translate_post")} (→ ${targetName})`;

  const classes = size === "sm"
    ? "text-[11px] px-2 py-1 rounded-full bg-imta-light text-imta font-medium flex items-center gap-1"
    : "text-xs px-3 py-1.5 rounded-full bg-imta-light text-imta font-medium flex items-center gap-1";

  return (
    <button onClick={click} disabled={busy} className={classes} data-testid={`translate-btn-${id}`}>
      {busy ? (
        <span className="w-3 h-3 border-2 border-imta border-t-transparent rounded-full animate-spin" />
      ) : (
        <Languages size={size === "sm" ? 10 : 12} />
      )}
      <span className="truncate max-w-[180px]">{label}</span>
    </button>
  );
}
