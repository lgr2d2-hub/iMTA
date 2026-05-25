import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { NotificationPanel } from "./NotificationPanel";
import { ChatLobby } from "./ChatLobby";
import { WritePostModal } from "./WritePostModal";
import { OnboardingModal } from "./OnboardingModal";
import { Pencil, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);

  const onboardingNeeded = user && !user.onboarded;

  return (
    <div className="imta-shell">
      <Header
        onOpenMenu={() => setMenuOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
      />
      <main className="pb-32">{children}</main>

      <button
        onClick={() => setWriteOpen(true)}
        className="imta-fab imta-fab-write"
        aria-label="write post"
        data-testid="fab-write-post"
      >
        <Pencil size={22} />
      </button>
      <button
        onClick={() => setChatOpen(true)}
        className="imta-fab imta-fab-chat"
        aria-label="chat lobby"
        data-testid="fab-chat-lobby"
      >
        <MessageCircle size={22} />
      </button>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <NotificationPanel open={notifOpen} onOpenChange={setNotifOpen} />
      <ChatLobby open={chatOpen} onOpenChange={setChatOpen} />
      <WritePostModal
        open={writeOpen}
        onOpenChange={setWriteOpen}
        onCreated={(p) => navigate(`/board/${p.category_id}/${p.post_id}`)}
      />

      <OnboardingModal open={!!onboardingNeeded} />
    </div>
  );
}
