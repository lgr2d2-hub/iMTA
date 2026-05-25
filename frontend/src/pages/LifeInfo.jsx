import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { LIFE_INFO_CATEGORIES } from "../lib/lifeInfo";
import { useLang } from "../context/LanguageContext";
import { catLabel } from "../lib/i18n";
import { Phone, Globe, Mail } from "lucide-react";

export default function LifeInfo() {
  const { t, lang } = useLang();

  return (
    <div className="px-4 py-4 fade-up" data-testid="lifeinfo-page">
      <div className="mb-3">
        <div className="text-lg font-bold">{t("nav_lifeinfo")} ℹ️</div>
        <div className="text-xs text-gray-600 mt-0.5">{t("tips_lifeinfo")}</div>
      </div>

      <Accordion type="single" collapsible>
        {LIFE_INFO_CATEGORIES.map((cat) => (
          <AccordionItem key={cat.id} value={cat.id} className="bg-white rounded-xl border mb-2 px-3" data-testid={`lifeinfo-cat-${cat.id}`}>
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{cat.icon}</div>
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold">{catLabel(cat, lang)}</div>
                  {lang !== "ko" && <div className="text-xs text-gray-500">{cat.korean}</div>}
                </div>
                <span className="text-xs text-gray-400">{cat.items.length}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2 space-y-2">
                {cat.items.map((it, i) => (
                  <div key={i} className="p-3 rounded-lg border border-gray-100 bg-white" data-testid={`lifeinfo-item-${cat.id}-${i}`}>
                    <div className="text-sm font-semibold">{it.name}</div>
                    {it.description && <div className="text-xs text-gray-600 mt-0.5">{it.description}</div>}
                    {it.email && <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Mail size={11} /> {it.email}</div>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {it.phone && (
                        <a
                          href={`tel:${it.phone.replace(/-/g, "")}`}
                          className="text-xs px-3 py-1.5 rounded-full bg-imta text-white font-medium flex items-center gap-1"
                          data-testid={`call-${cat.id}-${i}`}
                        >
                          <Phone size={11} /> {t("call")} {it.phone}
                        </a>
                      )}
                      {it.url && (
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-full bg-imta-light text-imta font-medium flex items-center gap-1"
                          data-testid={`visit-${cat.id}-${i}`}
                        >
                          <Globe size={11} /> {t("visit")}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
