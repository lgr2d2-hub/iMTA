import api from "./api";

const CACHE_KEY = "imta_translation_cache_v1";

// Map a user's registered country code to the target translation language code.
// Codes are the MyMemory / ISO-639-1 codes used by the backend translation proxy.
export const COUNTRY_TO_LANG = {
  VN: "vi", CN: "zh", JP: "ja", PH: "tl", KH: "km", TH: "th",
  MN: "mn", RU: "ru", UZ: "uz", NP: "ne", MM: "my", ID: "id",
  BD: "bn", KZ: "kk", KR: "ko",
};

// Human-readable display names for the translate button label.
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

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
  catch (e) { console.error("translation cache read:", e); return {}; }
}
function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
  catch (e) { console.error("translation cache write:", e); }
}

/**
 * Translate `text` from `source` to `target`. Returns translated string on success.
 * On empty/failure throws so callers can show a toast and revert UI.
 * `id` is used as a stable cache key per resource (e.g. `post_seed_1`).
 */
export async function translateBlock({ text, target, source = "ko", id }) {
  if (!text) return "";
  if (target === source) return text;
  const cache = loadCache();
  const cacheKey = id ? `translation_${id}_${target}` : `text_${target}_${text.slice(0, 80)}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const { data } = await api.post("/translate", { text, target, source });
  const translated = (data?.translated || "").trim();
  if (!translated) throw new Error("empty_translation");
  cache[cacheKey] = translated;
  saveCache(cache);
  return translated;
}

// Backward-compatible helper used by older review/list views — returns original on failure.
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
