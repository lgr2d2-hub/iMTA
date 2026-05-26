import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { BOARD_CATEGORIES } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { timeAgo } from "../lib/translate";
import api from "../lib/api";
import { Eye, MessageCircle, ThumbsUp, Search } from "lucide-react";

export default function Board() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/posts").then(({ data }) => setAllPosts(data || [])).catch(() => setAllPosts([]));
  }, []);

  const postsByCat = useMemo(() => {
    const grouped = {};
    allPosts.forEach((p) => {
      grouped[p.category_id] = grouped[p.category_id] || [];
      grouped[p.category_id].push(p);
    });
    return grouped;
  }, [allPosts]);

  const searching = query.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!searching) return [];
    const q = query.toLowerCase();
    return allPosts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q),
    );
  }, [allPosts, query, searching]);

  const userChips = user ? [user.country_flag, user.district, user.occupation].filter(Boolean) : [];

  const goPost = (p) => navigate(`/board/${p.category_id}/${p.post_id}`);
  const catFor = (id) => BOARD_CATEGORIES.find((c) => c.id === id);

  return (
    <div className="px-4 py-4 fade-up" data-testid="board-page">
      <div className="mb-3">
        <div className="text-lg font-bold">{t("nav_board")} 💬</div>
        {userChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2" data-testid="user-filter-chips">
            {userChips.map((c) => (
              <span key={c} className="imta-chip">{c}</span>
            ))}
          </div>
        )}
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search_posts_ph")}
          className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-imta"
          style={{ borderRadius: 10 }}
          data-testid="board-search-input"
        />
      </div>

      {searching ? (
        <div className="space-y-2" data-testid="board-search-results">
          {searchResults.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-10">{t("no_results")} 🔍</div>
          ) : (
            searchResults.map((p) => {
              const cat = catFor(p.category_id);
              return (
                <button
                  key={p.post_id}
                  onClick={() => goPost(p)}
                  className="w-full text-left imta-card p-3"
                  data-testid={`search-result-${p.post_id}`}
                >
                  <div className="font-semibold text-sm line-clamp-2">{p.title}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {cat && <span className="imta-chip">{cat.icon} {catLabel(cat, lang, "board")}</span>}
                    <span className="text-xs text-gray-500">{p.author?.country_flag} {p.author?.nickname}</span>
                    <span className="text-xs text-gray-400">· {timeAgo(p.created_at, lang)}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1.5 line-clamp-2">{p.content}</div>
                </button>
              );
            })
          )}
        </div>
      ) : (
        <Accordion type="single" collapsible>
          {BOARD_CATEGORIES.map((cat) => {
            const posts = postsByCat[cat.id] || [];
            return (
              <AccordionItem key={cat.id} value={cat.id} className="bg-white rounded-xl border mb-2 px-3" data-testid={`category-${cat.id}`}>
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{cat.icon}</div>
                    <div className="text-left flex-1">
                      <div className="text-sm font-semibold">{catLabel(cat, lang, "board")}</div>
                      {lang !== "ko" && <div className="text-xs text-gray-500">{cat.korean}</div>}
                    </div>
                    <span className="text-xs text-gray-400">{posts.length}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-2 space-y-2">
                    {posts.length === 0 && (
                      <div className="text-xs text-gray-400 py-4 text-center">{t("no_posts")}</div>
                    )}
                    {posts.map((p) => (
                      <button
                        key={p.post_id}
                        onClick={() => goPost(p)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                        data-testid={`post-card-${p.post_id}`}
                      >
                        <div className="font-semibold text-sm line-clamp-2">{p.title}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>{p.author?.country_flag} {p.author?.nickname}</span>
                          <span>·</span>
                          <span>{timeAgo(p.created_at, lang)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Eye size={12} /> {p.views || 0}</span>
                          <span className="flex items-center gap-1"><MessageCircle size={12} /> {p.comment_count || 0}</span>
                          <span className="flex items-center gap-1"><ThumbsUp size={12} /> {p.reactions?.helpful || 0}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
