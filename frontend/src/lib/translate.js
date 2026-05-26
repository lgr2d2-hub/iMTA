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
 * Batch-translate a list of {id, text} items in a single API call using a "|||"
 * separator, with localStorage caching per item.
 *
 * Returns a map: { [id]: translated_text }.
 * Items already present in cache are served without an API call.
 * Throws if the API fails or if the response cannot be split back into the
 * expected number of parts — callers should fall back to original text.
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

  const joined = pending.map((p) => p.text).join(SEP);
  const { data } = await api.post("/translate", { text: joined, target, source });
  const translated = (data?.translated || "").trim();
  if (!translated) throw new Error("empty_translation");
  // Translation engines sometimes collapse whitespace around the separator.
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
