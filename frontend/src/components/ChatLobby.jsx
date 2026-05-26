import React, { useEffect, useMemo, useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Send, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateChannelModal } from "./CreateChannelModal";

function ChannelRow({ c, onClick, t }) {
  return (
    <button
      data-testid={`channel-${c.channel_id}`}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 mx-2 my-1 rounded-xl hover:bg-gray-50 text-left"
    >
      <div className="w-10 h-10 rounded-full bg-imta-light flex items-center justify-center text-xl">{c.icon || "💬"}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{c.name}</div>
        <div className="text-xs text-gray-500 truncate">
          {c.description ? c.description : `${(c.member_count || 0).toLocaleString()} ${t("members")}`}
        </div>
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-imta text-white font-medium">{t("join")}</span>
    </button>
  );
}

function SectionHeader({ label, count }) {
  return (
    <div className="px-4 pt-4 pb-1 flex items-center justify-between">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-[10px] text-gray-400">{count}</div>
    </div>
  );
}

export function ChatLobby({ open, onOpenChange }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const scrollRef = useRef(null);

  const loadChannels = () => api.get("/chat/channels").then(({ data }) => setChannels(data || [])).catch(() => {});

  useEffect(() => {
    if (!open) return;
    loadChannels();
  }, [open]);

  useEffect(() => {
    if (!active) return;
    api.get(`/chat/channels/${active.channel_id}/messages`).then(({ data }) => {
      setMessages(data || []);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
    }).catch(() => setMessages([]));
  }, [active]);

  // Group channels into Global / Country / Interest. Country shows only the
  // user's own country channel; if their country has no dedicated channel,
  // the section is hidden.
  const { globalCh, countryCh, interestCh } = useMemo(() => {
    const userCC = (user?.country_code || "").toUpperCase();
    const g = channels.filter((c) => c.channel_type === "global");
    const co = channels.filter((c) => c.channel_type === "country" && (c.country_code || "").toUpperCase() === userCC);
    const i = channels.filter((c) => c.channel_type === "interest");
    return { globalCh: g, countryCh: co, interestCh: i };
  }, [channels, user]);

  const send = async () => {
    if (!text.trim() || !active) return;
    try {
      const { data } = await api.post(`/chat/channels/${active.channel_id}/messages`, { content: text.trim() });
      setMessages((prev) => [...prev, data]);
      setText("");
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
    } catch {
      toast.error(t("login_required"));
    }
  };

  const handleCreated = (ch) => {
    setChannels((prev) => [ch, ...prev]);
    setActive(ch);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setActive(null); }}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 flex flex-col" data-testid="chat-lobby">
        {!active ? (
          <>
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle className="text-lg">{t("chat_lobby")}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto pb-6">
              {/* Global */}
              {globalCh.length > 0 && (
                <>
                  <SectionHeader label={t("section_global")} count={globalCh.length} />
                  {globalCh.map((c) => (
                    <ChannelRow key={c.channel_id} c={c} t={t} onClick={() => setActive(c)} />
                  ))}
                </>
              )}

              {/* Country (filtered by user's country_code) */}
              {countryCh.length > 0 && (
                <>
                  <SectionHeader label={t("section_country")} count={countryCh.length} />
                  {countryCh.map((c) => (
                    <ChannelRow key={c.channel_id} c={c} t={t} onClick={() => setActive(c)} />
                  ))}
                </>
              )}

              {/* Interest */}
              <div className="px-4 pt-4 pb-1 flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("section_interest")}</div>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="text-xs px-2.5 py-1 rounded-full bg-imta text-white font-medium flex items-center gap-1"
                  data-testid="create-channel-btn"
                >
                  <Plus size={12} /> {t("create_channel")}
                </button>
              </div>
              {interestCh.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400" data-testid="interest-empty">
                  {t("no_interest_channels")}
                </div>
              ) : (
                interestCh.map((c) => (
                  <ChannelRow key={c.channel_id} c={c} t={t} onClick={() => setActive(c)} />
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="px-3 pt-3 pb-2 border-b flex items-center gap-2">
              <button onClick={() => setActive(null)} className="p-1 rounded hover:bg-gray-100" data-testid="chat-back">
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1">
                <div className="font-semibold text-sm">{active.name}</div>
                <div className="text-xs text-gray-500">{(active.member_count || 0).toLocaleString()} {t("members")}</div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-2 bg-[#F8FAFB]">
              {messages.map((m) => (
                <div key={m.message_id} className="flex gap-2" data-testid={`message-${m.message_id}`}>
                  <div className="w-8 h-8 rounded-full bg-imta-light flex items-center justify-center text-base flex-shrink-0">
                    {m.author?.country_flag || "🌍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">{m.author?.nickname || "User"}</div>
                    <div className="bg-white rounded-lg px-3 py-2 text-sm shadow-sm inline-block max-w-full break-words">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">{t("no_comments")}</div>
              )}
            </div>
            <div className="p-3 border-t bg-white flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("message_ph")}
                className="flex-1 px-3 py-2 rounded-full bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-imta"
                data-testid="chat-input"
              />
              <button
                onClick={send}
                className="w-10 h-10 rounded-full bg-imta text-white flex items-center justify-center"
                data-testid="chat-send-btn"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}

        <CreateChannelModal open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />
      </SheetContent>
    </Sheet>
  );
}
