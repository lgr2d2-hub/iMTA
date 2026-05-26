import api from "./api";

const CACHE_KEY = "imta_translation_cache_v1";

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch (e) {
    console.error("translation cache read:", e);
    return {};
  }
}
function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("translation cache write:", e);
  }
}

export async function translateText(text, target, source = "ko") {
  if (!text || !target || target === source) return text;
  const cache = loadCache();
  const key = `${source}|${target}|${text}`;
  if (cache[key]) return cache[key];
  try {
    const { data } = await api.post("/translate", { text, target, source });
    const translated = data?.translated || text;
    cache[key] = translated;
    saveCache(cache);
    return translated;
  } catch (e) {
    console.error("translateText:", e);
    return text;
  }
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
