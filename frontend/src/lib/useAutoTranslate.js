import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTargetLang, shouldAutoTranslate, translateBatch, translateBlock } from "./translate";

/**
 * Auto-translate a list of items on mount/update.
 *
 * Returns `{ map, loading, failed }`:
 *  - map: { [id]: translated_text }  (only populated when active+success)
 *  - loading: true while the batch call is in flight
 *  - failed: true when translation could not complete (caller should show
 *    the silent fallback note and render original text)
 *  - target: resolved target lang ("vi", "zh", "ko", etc.)
 *  - active: whether auto-translate is enabled for the current user
 *
 * Usage:
 *   const { map, loading, failed, active } = useAutoTranslateList(posts, "post_id", "title");
 *   const titleFor = (p) => map[p.post_id] || p.title;
 */
export function useAutoTranslateList(items, idKey, fieldKey) {
  const { user } = useAuth();
  const target = getTargetLang(user?.country_code);
  const active = shouldAutoTranslate(user?.country_code);
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // Stable signature: rerun when ids or fieldKey or target changes.
  const sig = (items || []).map((it) => `${it?.[idKey]}|${(it?.[fieldKey] || "").length}`).join(",");

  useEffect(() => {
    if (!active || !items?.length) { setMap({}); setLoading(false); setFailed(false); return; }
    const payload = items
      .filter((it) => (it?.[fieldKey] || "").trim())
      .map((it) => ({ id: String(it[idKey]), text: it[fieldKey] }));
    if (payload.length === 0) { setMap({}); return; }
    let cancelled = false;
    setLoading(true); setFailed(false);
    translateBatch({ items: payload, target })
      .then((m) => { if (!cancelled) setMap(m); })
      .catch((e) => {
        if (cancelled) return;
        console.warn("auto-translate batch failed:", e?.message);
        setMap({});
        setFailed(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, target, active]);

  return { map, loading, failed, target, active };
}

/**
 * Auto-translate a small set of named blocks for a single resource on mount.
 * Shape:  blocks = { title: "...", body: "..." }, id = "post_seed_1"
 * Returns { translated, loading, failed, active, target } where translated is
 * { [key]: text } or null if failed/inactive.
 */
export function useAutoTranslateBlocks(id, blocks) {
  const { user } = useAuth();
  const target = getTargetLang(user?.country_code);
  const active = shouldAutoTranslate(user?.country_code);
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const sig = id + "|" + Object.entries(blocks || {})
    .map(([k, v]) => `${k}:${(v || "").length}`)
    .join(",");

  useEffect(() => {
    if (!active || !id || !blocks) { setTranslated(null); setLoading(false); setFailed(false); return; }
    const entries = Object.entries(blocks).filter(([, v]) => (v || "").trim());
    if (entries.length === 0) { setTranslated(null); return; }
    let cancelled = false;
    setLoading(true); setFailed(false);
    (async () => {
      try {
        const out = {};
        // Sequential to respect MyMemory free-tier rate limits and to fail fast.
        for (const [key, value] of entries) {
          // eslint-disable-next-line no-await-in-loop
          out[key] = await translateBlock({ text: value, target, id: `${id}_${key}` });
        }
        if (!cancelled) setTranslated(out);
      } catch (e) {
        if (cancelled) return;
        console.warn("auto-translate blocks failed:", e?.message);
        setTranslated(null);
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, target, active]);

  return { translated, loading, failed, active, target };
}
