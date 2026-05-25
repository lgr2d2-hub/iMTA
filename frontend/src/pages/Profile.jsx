import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import api from "../lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { SEOUL_DISTRICTS, OCCUPATIONS } from "../lib/constants";
import { catLabel } from "../lib/i18n";
import { Edit, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "../lib/translate";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "posts");
  const [myPosts, setMyPosts] = useState([]);
  const [mySaved, setMySaved] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    api.get("/me/posts").then(({ data }) => setMyPosts(data || [])).catch(() => {});
    api.get("/me/saved").then(({ data }) => setMySaved(data || [])).catch(() => {});
    api.get("/me/comments").then(({ data }) => setMyComments(data || [])).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="px-4 py-4 fade-up" data-testid="profile-page">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 mb-3"><ArrowLeft size={16} /> {t("back")}</button>

      <div className="imta-card p-5 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-imta-light flex items-center justify-center text-4xl">
          {user.country_flag || "🌍"}
        </div>
        <div className="text-lg font-bold mt-3" data-testid="profile-nickname">{user.nickname || user.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{user.country_name} · {user.district || "-"}</div>
        <div className="text-xs text-gray-500">{catLabel(OCCUPATIONS.find((o) => o.value === user.occupation), lang) || "-"}</div>
        <button onClick={() => setEditOpen(true)} className="mt-3 text-xs px-4 py-1.5 rounded-full bg-imta text-white inline-flex items-center gap-1" data-testid="edit-profile-btn">
          <Edit size={12} /> {t("edit_profile")}
        </button>
      </div>

      <div className="mt-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-4 bg-white border rounded-xl">
            <TabsTrigger value="posts" data-testid="tab-posts">{t("my_posts")}</TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">{t("my_comments")}</TabsTrigger>
            <TabsTrigger value="liked" data-testid="tab-liked">{t("liked_posts")}</TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved">{t("saved_posts")}</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            <ItemList items={myPosts} onClick={(p) => navigate(`/board/${p.category_id}/${p.post_id}`)} emptyText={t("no_posts")} lang={lang} />
          </TabsContent>
          <TabsContent value="comments">
            <div className="space-y-2 mt-2">
              {myComments.length === 0 && <div className="text-center text-xs text-gray-400 py-6">{t("no_comments")}</div>}
              {myComments.map((c) => (
                <div key={c.comment_id} className="imta-card p-3 text-sm">
                  <div className="text-xs text-gray-500">{timeAgo(c.created_at, lang)}</div>
                  <div>{c.content}</div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="liked">
            <div className="text-center text-xs text-gray-400 py-6">{t("no_posts")}</div>
          </TabsContent>
          <TabsContent value="saved">
            <ItemList items={mySaved} onClick={(p) => navigate(`/board/${p.category_id}/${p.post_id}`)} emptyText={t("no_posts")} lang={lang} />
          </TabsContent>
        </Tabs>
      </div>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={user} onSaved={setUser} t={t} lang={lang} />
    </div>
  );
}

function ItemList({ items, onClick, emptyText, lang }) {
  if (!items?.length) return <div className="text-center text-xs text-gray-400 py-6">{emptyText}</div>;
  return (
    <div className="space-y-2 mt-2">
      {items.map((p) => (
        <button key={p.post_id} onClick={() => onClick(p)} className="w-full text-left imta-card p-3" data-testid={`profile-item-${p.post_id}`}>
          <div className="font-semibold text-sm line-clamp-2">{p.title}</div>
          <div className="text-xs text-gray-500 mt-1">{timeAgo(p.created_at, lang)}</div>
        </button>
      ))}
    </div>
  );
}

function EditProfileDialog({ open, onOpenChange, user, onSaved, t }) {
  const [nickname, setNickname] = useState(user.nickname || "");
  const [district, setDistrict] = useState(user.district || "");
  const [occupation, setOccupation] = useState(user.occupation || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setNickname(user.nickname || ""); setDistrict(user.district || ""); setOccupation(user.occupation || ""); }, [user]);

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await api.patch("/auth/profile", { nickname, district, occupation });
      onSaved(data);
      toast.success(t("success"));
      onOpenChange(false);
    } catch { toast.error(t("error")); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="edit-profile-modal">
        <DialogHeader><DialogTitle>{t("edit_profile")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">{t("nickname")}</label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} className="w-full px-3 py-2 rounded-lg border bg-white text-sm" data-testid="edit-nickname" />
          </div>
          <div>
            <label className="text-xs text-gray-600">{t("district")}</label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger data-testid="edit-district"><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent className="max-h-72">{SEOUL_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{t("occupation")}</label>
            <Select value={occupation} onValueChange={setOccupation}>
              <SelectTrigger data-testid="edit-occupation"><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent>{OCCUPATIONS.map((o) => <SelectItem key={o.value} value={o.value}>{catLabel(o, lang)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="btn-ghost">{t("cancel")}</button>
          <button onClick={save} disabled={busy} className="btn-primary" data-testid="edit-save-btn">{busy ? "..." : t("save")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
