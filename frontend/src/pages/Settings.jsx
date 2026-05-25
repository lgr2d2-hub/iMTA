import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { ProfileSubHeader } from "../components/ProfileShared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { COUNTRIES, SEOUL_DISTRICTS, OCCUPATIONS } from "../lib/constants";
import { catLabel, LANGUAGES } from "../lib/i18n";
import { LogOut, Check } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user, setUser, logout, loading: authLoading } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [district, setDistrict] = useState("");
  const [occupation, setOccupation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
      setCountryCode(user.country_code || "");
      setDistrict(user.district || "");
      setOccupation(user.occupation || "");
    }
  }, [user]);

  if (!authLoading && !user) return <Navigate to="/login" replace />;
  if (!user) return null;

  const save = async () => {
    if (!nickname || nickname.length < 2) { toast.error(t("error")); return; }
    setBusy(true);
    try {
      const country = COUNTRIES.find((c) => c.code === countryCode) || {};
      const { data } = await api.patch("/auth/profile", {
        nickname: nickname.trim(),
        district,
        occupation,
        country_code: country.code || "",
        country_name: country.name || "",
        country_flag: country.flag || "",
      });
      setUser(data);
      toast.success(t("settings_saved"));
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fade-up pb-10" data-testid="settings-page">
      <ProfileSubHeader title={t("settings")} />

      <div className="px-4 space-y-4">
        {/* Profile section */}
        <div className="imta-card p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t("edit_profile")}</div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">{t("nickname")}</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-imta"
                data-testid="settings-nickname"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">{t("country")}</label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger data-testid="settings-country"><SelectValue placeholder={t("select")} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} {lang === "ko" ? c.korean : c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-600">{t("district")}</label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger data-testid="settings-district"><SelectValue placeholder={t("select")} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {SEOUL_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-600">{t("occupation")}</label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger data-testid="settings-occupation"><SelectValue placeholder={t("select")} /></SelectTrigger>
                <SelectContent>
                  {OCCUPATIONS.map((o) => <SelectItem key={o.value} value={o.value}>{catLabel(o, lang, "occupation")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <button
            onClick={save}
            disabled={busy}
            className="w-full btn-primary mt-4"
            data-testid="settings-save-btn"
          >
            {busy ? "..." : t("save_settings")}
          </button>
        </div>

        {/* Language section */}
        <div className="imta-card p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t("language_section")}</div>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${
                  lang === l.code ? "border-imta bg-imta-light text-imta font-semibold" : "border-gray-200 bg-white"
                }`}
                data-testid={`settings-lang-${l.code}`}
              >
                <span className="flex items-center gap-2"><span>{l.flag}</span><span className="truncate">{l.name}</span></span>
                {lang === l.code && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Account section */}
        <div className="imta-card p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t("account_section")}</div>
          <button
            onClick={async () => { await logout(); navigate("/login"); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold"
            style={{ color: "#E53E3E", background: "#FEF2F2" }}
            data-testid="settings-logout-btn"
          >
            <LogOut size={18} /> {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
