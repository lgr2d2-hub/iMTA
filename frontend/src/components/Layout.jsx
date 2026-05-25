import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { NotificationPanel } from "./NotificationPanel";
import { ChatLobby } from "./ChatLobby";
import { WritePostModal } from "./WritePostModal";
import { CreateReviewModal } from "./CreateReviewModal";
import { CreatePetitionModal } from "./CreatePetitionModal";
import { OnboardingModal } from "./OnboardingModal";
import { Pencil, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Determine which create action the green FAB triggers based on current path.
// Returns null when the FAB should be hidden.
function getFabAction(pathname) {
  if (/^\/board(\/|$)/.test(pathname)) return "post";
  if (/^\/reviews(\/|$)/.test(pathname)) return "review";
  if (/^\/petitions(\/|$)/.test(pathname)) return "petition";
  return null;
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [writePostOpen, setWritePostOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [petitionOpen, setPetitionOpen] = useState(false);

  const onboardingNeeded = user && !user.onboarded;
  const fabAction = getFabAction(location.pathname);

  const onClickFab = () => {
    if (fabAction === "post") setWritePostOpen(true);
    else if (fabAction === "review") setReviewOpen(true);
    else if (fabAction === "petition") setPetitionOpen(true);
  };

  return (
    <div className="imta-shell">
      <Header
        onOpenMenu={() => setMenuOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
      />
      <main className="pb-32">{children}</main>

      {fabAction && (
        <button
          onClick={onClickFab}
          className="imta-fab imta-fab-write"
          aria-label="create"
          data-testid="fab-write-post"
          data-action={fabAction}
        >
          <Pencil size={22} />
        </button>
      )}
      <button
        onClick={() => setChatOpen(true)}
        className="imta-fab imta-fab-chat"
        aria-label="chat lobby"
        data-testid="fab-chat-lobby"
      >
        <MessageCircle size={22} />
      </button>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <NotificationPanel
        open={notifOpen}
        onOpenChange={setNotifOpen}
        onOpenChat={() => setChatOpen(true)}
      />
      <ChatLobby open={chatOpen} onOpenChange={setChatOpen} />
      <WritePostModal
        open={writePostOpen}
        onOpenChange={setWritePostOpen}
        onCreated={(p) => navigate(`/board/${p.category_id}/${p.post_id}`)}
      />
      <CreateReviewModal open={reviewOpen} onOpenChange={setReviewOpen} />
      <CreatePetitionModal open={petitionOpen} onOpenChange={setPetitionOpen} />

      <OnboardingModal open={!!onboardingNeeded} />
    </div>
  );
}
