import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { BOARD_CATEGORIES } from "../lib/constants";
import { timeAgo } from "../lib/translate";
import api from "../lib/api";
import { Eye, MessageCircle, ThumbsUp } from "lucide-react";

export default function Board() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postsByCat, setPostsByCat] = useState({});
  const [openCat, setOpenCat] = useState(null);

  useEffect(() => {
    api.get("/posts").then(({ data }) => {
      const grouped = {};
      (data || []).forEach((p) => {
        grouped[p.category_id] = grouped[p.category_id] || [];
        grouped[p.category_id].push(p);
      });
      setPostsByCat(grouped);
    }).catch(() => setPostsByCat({}));
  }, []);

  const userChips = user ? [user.country_flag, user.district, user.occupation].filter(Boolean) : [];

  return (
    <div className="px-4 py-4 fade-up" data-testid="board-page">
      <div className="mb-3">
        <div className="text-lg font-bold">{t("nav_board")} 💬</div>
        {userChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2" data-testid="user-filter-chips">
            {userChips.map((c, i) => (
              <span key={i} className="imta-chip">{c}</span>
            ))}
          </div>
        )}
      </div>

      <Accordion type="single" collapsible value={openCat} onValueChange={setOpenCat}>
        {BOARD_CATEGORIES.map((cat) => {
          const posts = postsByCat[cat.id] || [];
          return (
            <AccordionItem key={cat.id} value={cat.id} className="bg-white rounded-xl border mb-2 px-3" data-testid={`category-${cat.id}`}>
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">{cat.icon}</div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold">{cat.korean}</div>
                    <div className="text-xs text-gray-500">{cat.english}</div>
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
                      onClick={() => navigate(`/board/${cat.id}/${p.post_id}`)}
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
    </div>
  );
}
