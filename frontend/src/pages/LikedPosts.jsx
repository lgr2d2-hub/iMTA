import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { PostCard } from "../components/PostCard";
import { ProfileSubHeader, LoadingSkeleton, ErrorState, EmptyState } from "../components/ProfileShared";

export default function LikedPosts() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const { data } = await api.get("/me/liked");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setItems([]);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  return (
    <div className="fade-up" data-testid="liked-posts-page">
      <ProfileSubHeader title={t("liked_posts")} />
      {items === null && <LoadingSkeleton />}
      {error && <ErrorState onRetry={load} />}
      {items && !error && items.length === 0 && (
        <EmptyState message={t("empty_liked")} />
      )}
      {items && items.length > 0 && (
        <div className="px-4 space-y-2 pb-6">
          {items.map((p) => <PostCard key={p.post_id} post={p} lang={lang} />)}
        </div>
      )}
    </div>
  );
}
