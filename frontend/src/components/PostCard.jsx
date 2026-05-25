import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MessageCircle, ThumbsUp, Bookmark } from "lucide-react";
import { BOARD_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { timeAgo } from "../lib/translate";

export function PostCard({ post, lang, onUnsave, showCategory = true }) {
  const navigate = useNavigate();
  const cat = BOARD_CATEGORIES.find((c) => c.id === post?.category_id);
  if (!post) return null;
  const go = () => navigate(`/board/${post.category_id}/${post.post_id}`);

  return (
    <div className="imta-card p-3 relative" data-testid={`mypost-${post.post_id}`}>
      <button onClick={go} className="w-full text-left">
        <div className="font-semibold text-sm line-clamp-2 pr-7">{post.title}</div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-xs text-gray-500">
          {showCategory && cat && (
            <span className="imta-chip" style={{ padding: "2px 8px", fontSize: 10 }}>
              {cat.icon} {catLabel(cat, lang, "board")}
            </span>
          )}
          <span>{post?.author?.country_flag} {post?.author?.nickname}</span>
          <span className="text-gray-400">· {timeAgo(post.created_at, lang)}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
          <span className="flex items-center gap-1"><Eye size={12} /> {post.views || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comment_count || 0}</span>
          <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post?.reactions?.helpful || 0}</span>
        </div>
      </button>
      {onUnsave && (
        <button
          onClick={(e) => { e.stopPropagation(); onUnsave(post.post_id); }}
          className="absolute top-3 right-3 text-imta"
          aria-label="unsave"
          data-testid={`unsave-${post.post_id}`}
        >
          <Bookmark size={18} fill="currentColor" />
        </button>
      )}
    </div>
  );
}
