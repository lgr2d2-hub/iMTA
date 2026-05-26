import React from "react";
import { useLang } from "../context/LanguageContext";
import { LANGUAGES } from "../lib/i18n";
import { Globe } from "lucide-react";
import { Logo } from "../components/Logo";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "../components/ui/dropdown-menu";

export default function Login() {
  const { lang, setLang, t } = useLang();
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="imta-shell flex flex-col min-h-screen" data-testid="login-page">
      <div className="flex justify-end p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border text-sm" data-testid="login-lang-picker">
            <Globe size={14} /> <span>{current.flag}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} data-testid={`login-lang-${l.code}`}>
                {l.flag} {l.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center fade-up">
        <Logo size={120} clickable={false} testId="login-logo" />
        <p className="text-sm text-gray-600 mt-2">{t("app_name")}</p>
        <p className="text-xs text-gray-500 max-w-xs mt-3 leading-relaxed">{t("app_tagline")}</p>

        <button
          onClick={handleLogin}
          className="mt-10 w-full max-w-xs bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 rounded-full py-3 px-5 flex items-center justify-center gap-3 font-semibold shadow-sm transition"
          data-testid="google-login-btn"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {t("sign_in")}
        </button>

        <div className="mt-10 grid grid-cols-3 gap-2 max-w-xs w-full">
          {["💬", "🏥", "📋"].map((e) => (
            <div key={e} className="bg-white border rounded-xl py-3 text-2xl">{e}</div>
          ))}
        </div>
      </div>

      <div className="text-center text-[11px] text-gray-400 pb-5">
        IMTA · Immigrants-Time © 2026
      </div>
    </div>
  );
}
