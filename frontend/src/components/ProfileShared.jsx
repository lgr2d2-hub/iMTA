import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLang } from "../context/LanguageContext";

export function ProfileSubHeader({ title }) {
  const navigate = useNavigate();
  const { t } = useLang();
  return (
    <div className="px-4 py-4 flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
        aria-label={t("back")}
        data-testid="profile-sub-back"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="text-lg font-bold">{title}</div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-2 px-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`skel-${i}`} className="bg-white border border-gray-100 rounded-xl p-3 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mt-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3 mt-2" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ onRetry }) {
  const { t } = useLang();
  return (
    <div className="text-center py-12 px-4" data-testid="error-state">
      <div className="text-3xl mb-2">⚠️</div>
      <div className="text-sm text-gray-700">{t("fetch_error")}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 btn-primary text-sm"
          data-testid="retry-btn"
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="text-center py-16 px-6 text-sm text-gray-500" data-testid="empty-state">
      {message}
    </div>
  );
}
