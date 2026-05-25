import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { ProfileSubHeader, LoadingSkeleton, ErrorState, EmptyState } from "../components/ProfileShared";
import { timeAgo } from "../lib/translate";

export default function MyComments() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const { data } = await api.get("/me/comments");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setItems([]);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  return (
    <div className="fade-up" data-testid="my-comments-page">
      <ProfileSubHeader title={t("my_comments")} />
      {items === null && <LoadingSkeleton />}
      {error && <ErrorState onRetry={load} />}
      {items && !error && items.length === 0 && (
        <EmptyState message={t("empty_my_comments")} />
      )}
      {items && items.length > 0 && (
        <div className="px-4 space-y-2 pb-6">
          {items.map((c) => (
            <div key={c.comment_id} className="imta-card p-3" data-testid={`mycomment-${c.comment_id}`}>
              {c?.post_title && (
                <button
                  onClick={() => navigate(`/board/${c.category_id}/${c.post_id}`)}
                  className="text-xs text-gray-500 underline-offset-2 hover:underline line-clamp-1 text-left w-full"
                >
                  ↳ {c.post_title}
                </button>
              )}
              <div className="text-sm mt-1">{c?.content || ""}</div>
              <div className="text-xs text-gray-400 mt-1">{timeAgo(c?.created_at, lang)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
