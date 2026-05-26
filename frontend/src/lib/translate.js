import api from "./api";

const CACHE_KEY = "imta_translation_cache_v1";
const SEP = " ||| ";

// Map a user's registered country code to the target translation language code.
export const COUNTRY_TO_LANG = {
  VN: "vi", CN: "zh", JP: "ja", PH: "tl", KH: "km", TH: "th",
  MN: "mn", RU: "ru", UZ: "uz", NP: "ne", MM: "my", ID: "id",
  BD: "bn", KZ: "kk", KR: "ko",
};

export const LANG_DISPLAY = {
  vi: "Tiếng Việt", zh: "中文", ja: "日本語", tl: "Filipino",
  km: "ភាសាខ្មែរ", th: "ภาษาไทย", mn: "Монгол", ru: "Русский",
  uz: "O'zbek", ne: "नेपाली", my: "မြန်မာဘာသာ", id: "Bahasa Indonesia",
  bn: "বাংলা", kk: "Қазақша", ko: "한국어", en: "English",
};

export function getTargetLang(countryCode) {
  if (!countryCode) return "en";
  return COUNTRY_TO_LANG[countryCode.toUpperCase()] || "en";
}

export function getTargetLangName(countryCode) {
  return LANG_DISPLAY[getTargetLang(countryCode)] || "English";
}

export function shouldAutoTranslate(countryCode) {
  // Auto-translate for everyone EXCEPT Korean users.
  return Boolean(countryCode) && countryCode.toUpperCase() !== "KR";
}

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
  catch (e) { console.error("translation cache read:", e); return {}; }
}
function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
  catch (e) { console.error("translation cache write:", e); }
}

/**
 * Translate a single block of text (used by detail pages for title/body).
 * Throws on empty/failed translation so callers can show a fallback.
 */
export async function translateBlock({ text, target, source = "ko", id }) {
  if (!text) return "";
  if (target === source) return text;
  const cache = loadCache();
  const cacheKey = id ? `trans_${id}_${target}` : `text_${target}_${text.slice(0, 80)}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const { data } = await api.post("/translate", { text, target, source });
  const translated = (data?.translated || "").trim();
  if (!translated) throw new Error("empty_translation");
  cache[cacheKey] = translated;
  saveCache(cache);
  return translated;
}

/**
 * Run async task factories with a concurrency limit and return a settled array
 * shaped like `Promise.allSettled`. Used by `translateBatch` to avoid firing
 * 12+ parallel MyMemory requests when the combined-call fallback path runs.
 */
async function settledLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const idx = cursor;
      cursor += 1;
      try { results[idx] = { status: "fulfilled", value: await tasks[idx]() }; }
      catch (e) { results[idx] = { status: "rejected", reason: e }; }
    }
  }
  const n = Math.min(limit, tasks.length);
  await Promise.all(Array.from({ length: n }, worker));
  return results;
}

/**
 * Batch-translate a list of {id, text} items in a single API call using a "|||"
 * separator, with localStorage caching per item.
 *
 * Returns a map: { [id]: translated_text }.
 * Items already present in cache are served without an API call.
 * If the batch response cannot be split back into the expected number of parts
 * (MyMemory occasionally drops/merges the separator on long lists), the
 * function automatically falls back to one API call per remaining item, with a
 * small concurrency limit. All cache writes happen in ONE saveCache at the end
 * to avoid the read-modify-write race between parallel writers.
 */
export async function translateBatch({ items, target, source = "ko" }) {
  if (!items?.length || !target || target === source) {
    return Object.fromEntries((items || []).map((i) => [i.id, i.text]));
  }
  const cache = loadCache();
  const result = {};
  const pending = [];
  items.forEach(({ id, text }) => {
    const key = `trans_${id}_${target}`;
    if (cache[key]) result[id] = cache[key];
    else if ((text || "").trim()) pending.push({ id, text });
    else result[id] = text || "";
  });
  if (pending.length === 0) return result;

  // Try a single combined call first — cheapest path when it works.
  try {
    const joined = pending.map((p) => p.text).join(SEP);
    const { data } = await api.post("/translate", { text: joined, target, source });
    const translated = (data?.translated || "").trim();
    if (!translated) throw new Error("empty_translation");
    const parts = translated.split(/\s*\|\|\|\s*/);
    if (parts.length !== pending.length) {
      throw new Error(`split_mismatch_${parts.length}_vs_${pending.length}`);
    }
    pending.forEach((p, i) => {
      const out = (parts[i] || "").trim() || p.text;
      result[p.id] = out;
      cache[`trans_${p.id}_${target}`] = out;
    });
    saveCache(cache);
    return result;
  } catch (e) {
    console.warn("translateBatch combined call failed, falling back per-item:", e?.message);
  }

  // Per-item fallback — direct /translate calls, concurrency-limited, single
  // cache write at the end to avoid the parallel-write race.
  const tasks = pending.map((p) => async () => {
    const { data } = await api.post("/translate", { text: p.text, target, source });
    const tr = (data?.translated || "").trim();
    if (!tr) throw new Error("empty");
    return { id: p.id, text: tr };
  });
  const settled = await settledLimit(tasks, 4);
  let okCount = 0;
  settled.forEach((s, i) => {
    const p = pending[i];
    if (s.status === "fulfilled") {
      result[p.id] = s.value.text;
      cache[`trans_${p.id}_${target}`] = s.value.text;
      okCount += 1;
    } else {
      result[p.id] = p.text;
    }
  });
  saveCache(cache);
  if (okCount === 0) throw new Error("all_items_failed");
  return result;
}

// Backward-compatible helper used by older review/list views.
export async function translateText(text, target, source = "ko") {
  try { return await translateBlock({ text, target, source }); }
  catch (e) { console.error("translateText:", e); return text; }
}

export function timeAgo(iso, lang = "ko") {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  const labels = {
    ko: { m: "분 전", h: "시간 전", d: "일 전", now: "방금 전" },
    en: { m: "m ago", h: "h ago", d: "d ago", now: "just now" },
    vi: { m: "phút trước", h: "giờ trước", d: "ngày trước", now: "vừa xong" },
    zh: { m: "分钟前", h: "小时前", d: "天前", now: "刚刚" },
    ja: { m: "分前", h: "時間前", d: "日前", now: "たった今" },
    fil: { m: "min", h: "h", d: "d", now: "ngayon" },
    km: { m: "នាទីមុន", h: "ម៉ោងមុន", d: "ថ្ងៃ​មុន", now: "ឥឡូវ" },
    th: { m: "นาที", h: "ชม", d: "วัน", now: "เพิ่ง" },
    mn: { m: "мин", h: "ц", d: "өдөр", now: "дөнгөж" },
    ru: { m: "мин", h: "ч", d: "д", now: "только что" },
    uz: { m: "daq", h: "soat", d: "kun", now: "hozir" },
  };
  const L = labels[lang] || labels.ko;
  if (diff < 60) return L.now;
  if (diff < 3600) return `${Math.floor(diff / 60)} ${L.m}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${L.h}`;
  return `${Math.floor(diff / 86400)} ${L.d}`;
}
