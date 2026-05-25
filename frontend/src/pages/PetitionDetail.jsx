import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Languages, Share2, Check } from "lucide-react";
import { translateText, timeAgo } from "../lib/translate";
import { toast } from "sonner";

function daysLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default function PetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/petitions/${id}`);
      setP(data);
    } catch { /* noop */ }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const sign = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    try {
      const { data } = await api.post(`/petitions/${id}/sign`);
      if (data.already_signed) {
        toast.info(t("signed"));
        return;
      }
      setP((prev) => ({ ...prev, signature_count: data.signature_count, has_signed: true }));
      toast.success(t("signed"));
    } catch { toast.error(t("error")); }
  };

  const doTranslate = async () => {
    if (translated) { setTranslated(null); return; }
    setTranslating(true);
    const tt = await translateText(p.description, lang);
    setTranslated(tt);
    setTranslating(false);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ url: window.location.href, title: p.title });
      else { await navigator.clipboard.writeText(window.location.href); toast.success(t("success")); }
    } catch { /* noop */ }
  };

  if (!p) {
    return <div className="px-4 py-10 text-center"><div className="w-8 h-8 border-2 border-imta border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  const dleft = daysLeft(p.deadline);
  const progress = Math.min(100, (p.signature_count / 300000) * 100);

  return (
    <div className="px-4 py-4 fade-up" data-testid="petition-detail">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 mb-3" data-testid="back-btn">
        <ArrowLeft size={16} /> {t("back")}
      </button>

      <div className="imta-card p-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-lg font-bold leading-tight">{p.title}</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold whitespace-nowrap">D-{dleft}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">{timeAgo(p.created_at, lang)}</div>

        <div className="mt-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2E6B5E] to-[#4DB8A8]" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <span className="text-imta font-bold text-base">{p.signature_count.toLocaleString()}</span> {t("signatures")}
          </div>
        </div>

        <div className="whitespace-pre-wrap text-sm text-gray-800 mt-4 leading-relaxed" data-testid="petition-description">
          {translated || p.description}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={doTranslate} className="text-xs px-3 py-1.5 rounded-full bg-imta-light text-imta font-medium flex items-center gap-1" data-testid="translate-petition-btn">
            <Languages size={12} /> {translating ? t("translating") : (translated ? t("original") : t("translate_post"))}
          </button>
          <button onClick={share} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 font-medium flex items-center gap-1" data-testid="share-petition-btn">
            <Share2 size={12} /> {t("share")}
          </button>
        </div>

        <button
          onClick={sign}
          disabled={p.has_signed}
          className={`mt-4 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${p.has_signed ? "bg-green-600 text-white" : "btn-primary"}`}
          data-testid="sign-petition-btn"
        >
          {p.has_signed ? <><Check size={16} /> {t("signed")}</> : `✍️ ${t("sign_petition")}`}
        </button>
      </div>
    </div>
  );
}
