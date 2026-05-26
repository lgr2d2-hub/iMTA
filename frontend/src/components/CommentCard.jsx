import React, { useState } from "react";
import { UserRound } from "lucide-react";
import { TranslateButton } from "./TranslateButton";
import { timeAgo } from "../lib/translate";
import { useLang } from "../context/LanguageContext";

export function CommentCard({ c }) {
  const { t, lang } = useLang();
  const [translated, setTranslated] = useState(null);
  const isAnon = c.is_anonymous || c.author?.nickname === "익명";

  return (
    <div className="imta-card p-3" data-testid={`comment-${c.comment_id}`}>
      <div className="text-xs text-gray-500 flex items-center gap-1.5">
        {isAnon ? (
          <span className="flex items-center gap-1 text-gray-500">
            <UserRound size={12} className="text-gray-400" />
            <span>{t("anonymous_short")}</span>
          </span>
        ) : (
          <span>{c.author?.country_flag} {c.author?.nickname}</span>
        )}
        <span>·</span>
        <span>{timeAgo(c.created_at, lang)}</span>
      </div>
      {translated && (
        <div className="text-[10px] italic text-gray-400 mt-1" data-testid={`comment-translated-label-${c.comment_id}`}>
          {t("translated_label")}
        </div>
      )}
      <div className="text-sm mt-1 whitespace-pre-wrap">{translated?.body || c.content}</div>
      <div className="mt-1.5">
        <TranslateButton
          id={`comment_${c.comment_id}`}
          blocks={{ body: c.content }}
          onResult={setTranslated}
          size="sm"
        />
      </div>
    </div>
  );
}
