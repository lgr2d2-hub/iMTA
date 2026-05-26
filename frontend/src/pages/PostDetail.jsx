import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Share2, Send, UserRound, Languages } from "lucide-react";
import api from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { REACTION_TYPES } from "../lib/constants";
import { timeAgo } from "../lib/translate";
import { useAutoTranslateBlocks, useAutoTranslateList } from "../lib/useAutoTranslate";
import { BlockShimmer, TitleShimmer } from "../components/Shimmer";
import { toast } from "sonner";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}`);
      setPost(data);
    } catch (e) { console.error("PostDetail.load post:", e); }
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data || []);
    } catch (e) { console.error("PostDetail.load comments:", e); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [postId]);

  // Auto-translate post title + body and the full comment list on mount for non-KR users.
  const blocks = post ? { title: post.title, body: post.content } : null;
  const {
    translated: postTrans,
    loading: postTranslating,
    failed: postFailed,
    active,
  } = useAutoTranslateBlocks(post ? `post_${post.post_id}` : null, blocks);

  const { map: cMap, loading: cLoading, failed: cFailed } =
    useAutoTranslateList(comments, "comment_id", "content");

  const react = async (type) => {
    if (!user) { toast.error(t("login_required")); return; }
    try {
      const { data } = await api.post(`/posts/${postId}/react`, { reaction_type: type });
      setPost((p) => ({ ...p, reactions: data.reactions, my_reaction: data.my_reaction }));
    } catch (e) { console.error("PostDetail.react:", e); }
  };

  const toggleSave = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    const { data } = await api.post(`/posts/${postId}/save`);
    setPost((p) => ({ ...p, is_saved: data.is_saved }));
    toast.success(t("success"));
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ url, title: post?.title });
      else { await navigator.clipboard.writeText(url); toast.success(t("success")); }
    } catch (e) { console.error("PostDetail.share:", e); }
  };

  const addComment = async () => {
    if (!user) { toast.error(t("login_required")); return; }
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content: commentText.trim(),
        is_anonymous: commentAnon,
      });
      setComments((prev) => [...prev, data]);
      setCommentText("");
      setCommentAnon(false);
    } catch { toast.error(t("error")); }
  };

  if (!post) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-8 h-8 border-2 border-imta border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const hasTranslation = active && postTrans && !postFailed;
  const showTranslated = hasTranslation && !showOriginal;
  const displayTitle = showTranslated ? postTrans.title : post.title;
  const displayBody = showTranslated ? postTrans.body : post.content;
  const isAnonAuthor = post.is_anonymous || post.author?.nickname === "익명";

  return (
    <div className="px-4 py-4 fade-up" data-testid="post-detail-page">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 mb-3" data-testid="back-btn">
        <ArrowLeft size={16} /> {t("back")}
      </button>

      <div className="imta-card p-4">
        <h1 className="text-lg font-bold leading-tight" data-testid="post-title">
          {postTranslating && !postTrans ? <TitleShimmer /> : displayTitle}
        </h1>
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
          {isAnonAuthor ? (
            <span className="flex items-center gap-1">
              <UserRound size={12} className="text-gray-400" />
              {t("anonymous_short")}
            </span>
          ) : (
            <span>{post.author?.country_flag} {post.author?.nickname}</span>
          )}
          <span>·</span>
          <span>{timeAgo(post.created_at, lang)}</span>
          <span>·</span>
          <span>{post.views} {t("views")}</span>
        </div>

        {showTranslated && (
          <div className="text-[11px] italic text-gray-400 mt-3" data-testid="post-translated-label">
            {t("translated_label")}
          </div>
        )}
        {postTranslating && !postTrans ? (
          <BlockShimmer lines={4} />
        ) : (
          <div className="whitespace-pre-wrap text-sm text-gray-800 mt-2 leading-relaxed" data-testid="post-content">
            {displayBody}
          </div>
        )}
        {active && postFailed && (
          <div className="text-[11px] text-gray-400 mt-2" data-testid="post-translate-fallback">
            {t("translation_fallback")}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-4 flex-wrap" data-testid="post-actions">
          {hasTranslation && (
            <button
              onClick={() => setShowOriginal((s) => !s)}
              className="text-xs px-3 py-1.5 rounded-full bg-imta-light text-imta font-medium flex items-center gap-1"
              data-testid="toggle-original-btn"
            >
              <Languages size={12} />
              {showOriginal ? t("view_translation") : t("original")}
            </button>
          )}
          <button onClick={toggleSave} className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${post.is_saved ? "bg-imta text-white" : "bg-gray-100 text-gray-700"}`} data-testid="save-post-btn">
            <Bookmark size={12} /> {t("save_post")}
          </button>
          <button onClick={share} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-medium flex items-center gap-1" data-testid="share-post-btn">
            <Share2 size={12} /> {t("share")}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {REACTION_TYPES.map((r) => {
            const a = post.my_reaction === r.id;
            return (
              <button
                key={r.id}
                onClick={() => react(r.id)}
                className={`px-3 py-2 rounded-xl border text-sm flex items-center justify-between transition ${a ? "bg-imta text-white border-imta" : "bg-white text-gray-700 border-gray-200 hover:border-imta"}`}
                data-testid={`reaction-${r.id}`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{r.emoji}</span>
                  <span className="text-xs font-medium">{r.korean}</span>
                </span>
                <span className="text-xs font-semibold">{post.reactions?.[r.id] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">{t("comments")} ({comments.length})</div>
        {active && cFailed && (
          <div className="text-[11px] text-gray-400 mb-2" data-testid="comments-translate-fallback">
            {t("translation_fallback")}
          </div>
        )}
        <div className="space-y-2">
          {comments.length === 0 && (
            <div className="text-xs text-gray-400 py-4 text-center">{t("no_comments")}</div>
          )}
          {comments.map((c) => (
            <CommentRow
              key={c.comment_id}
              c={c}
              translated={active ? cMap[c.comment_id] : null}
              translating={active && cLoading && !cMap[c.comment_id]}
              active={active}
              t={t}
              lang={lang}
            />
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder={t("comment_ph")}
              className="flex-1 px-3 py-2 rounded-full bg-white border text-sm outline-none focus:ring-2 focus:ring-imta"
              data-testid="comment-input"
            />
            <button onClick={addComment} className="w-10 h-10 rounded-full bg-imta text-white flex items-center justify-center" data-testid="comment-submit-btn">
              <Send size={16} />
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none pl-1" data-testid="comment-anon-label">
            <input
              type="checkbox"
              checked={commentAnon}
              onChange={(e) => setCommentAnon(e.target.checked)}
              className="w-4 h-4 accent-imta cursor-pointer"
              data-testid="comment-anon-checkbox"
            />
            <span>{t("anonymous")}</span>
            {commentAnon && (
              <span className="ml-1 inline-flex items-center gap-0.5 text-imta font-medium">
                <UserRound size={11} /> {t("anonymous_short")}
              </span>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

function CommentRow({ c, translated, translating, active, t, lang }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const isAnon = c.is_anonymous || c.author?.nickname === "익명";
  const hasTranslation = active && !!translated;
  const showTranslated = hasTranslation && !showOriginal;
  const body = showTranslated ? translated : c.content;

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
      {showTranslated && (
        <div className="text-[10px] italic text-gray-400 mt-1" data-testid={`comment-translated-label-${c.comment_id}`}>
          {t("translated_label")}
        </div>
      )}
      {translating ? (
        <BlockShimmer lines={1} />
      ) : (
        <div className="text-sm mt-1 whitespace-pre-wrap">{body}</div>
      )}
      {hasTranslation && (
        <button
          onClick={() => setShowOriginal((s) => !s)}
          className="mt-1.5 text-[10px] text-imta underline-offset-2 hover:underline"
          data-testid={`comment-toggle-${c.comment_id}`}
        >
          {showOriginal ? t("view_translation") : t("original")}
        </button>
      )}
    </div>
  );
}
