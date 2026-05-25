import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLang } from "../context/LanguageContext";
import { COUNTRIES, SEOUL_DISTRICTS, OCCUPATIONS } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import api from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function OnboardingModal({ open }) {
  const { t, lang } = useLang();
  const { setUser } = useAuth();
  const [nickname, setNickname] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [district, setDistrict] = useState("");
  const [occupation, setOccupation] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (nickname.length < 2 || nickname.length > 20 || !countryCode || !district || !occupation) {
      toast.error(t("error"));
      return;
    }
    const country = COUNTRIES.find((c) => c.code === countryCode);
    setBusy(true);
    try {
      const { data } = await api.post("/auth/onboarding", {
        nickname,
        country_code: country.code,
        country_name: country.name,
        country_flag: country.flag,
        district,
        occupation,
      });
      setUser(data);
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md p-0 overflow-hidden [&>button.absolute]:hidden" data-testid="onboarding-modal">
        <div className="bg-gradient-to-br from-[#2E6B5E] to-[#4DB8A8] px-5 py-6 text-white">
          <div className="text-2xl font-bold">{t("onboarding_title")}</div>
          <div className="text-sm opacity-90 mt-1">{t("onboarding_sub")}</div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">{t("nickname")}</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t("nickname_ph")}
              maxLength={20}
              className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-imta"
              data-testid="onboarding-nickname"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">{t("country")}</label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger data-testid="onboarding-country"><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent className="max-h-72">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.flag} {lang === "ko" ? c.korean : c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">{t("district")}</label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger data-testid="onboarding-district"><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent className="max-h-72">
                {SEOUL_DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">{t("occupation")}</label>
            <Select value={occupation} onValueChange={setOccupation}>
              <SelectTrigger data-testid="onboarding-occupation"><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent>
                {OCCUPATIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{catLabel(o, lang, "occupation")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="px-5 py-4 bg-gray-50">
          <button onClick={submit} disabled={busy} className="btn-primary w-full" data-testid="onboarding-submit">
            {busy ? "..." : t("complete")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
