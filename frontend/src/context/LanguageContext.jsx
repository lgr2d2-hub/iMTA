import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import T, { LANGUAGES, tFor } from "../lib/i18n";

const LangContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("imta_lang") || "ko"; } catch (e) { console.error("imta_lang load:", e); return "ko"; }
  });

  useEffect(() => {
    try { localStorage.setItem("imta_lang", lang); } catch (e) { console.error("imta_lang persist:", e); }
  }, [lang]);

  const t = useCallback((key) => tFor(lang, key), [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t, languages: LANGUAGES, dict: T[lang] }),
    [lang, t],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
