"""IMTA - Immigrants Time backend (FastAPI + MongoDB + Emergent Google Auth)."""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="IMTA API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("imta")

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


# ============================================================
# Models
# ============================================================
class OnboardingPayload(BaseModel):
    nickname: str
    country_code: str
    country_name: str
    country_flag: str
    district: str
    occupation: str


class PostCreate(BaseModel):
    category_id: str
    sub_category_id: Optional[str] = None
    title: str
    content: str
    is_anonymous: bool = False


class ReactionPayload(BaseModel):
    reaction_type: str  # helpful|trustworthy|unhelpful|untrustworthy


class CommentCreate(BaseModel):
    content: str
    is_anonymous: bool = False


class PetitionCreate(BaseModel):
    title: str
    description: str
    category: str
    deadline: str  # ISO date string


class ReviewCreate(BaseModel):
    category: str
    place_name: str
    rating: int = Field(ge=1, le=5)
    content: str
    is_anonymous: bool = False


class ChatMessageCreate(BaseModel):
    content: str


class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = ""


# ============================================================
# Helpers
# ============================================================
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(default=None),
) -> Dict[str, Any]:
    """Resolve current user from cookie or Authorization header."""
    token = session_token
    if not token:
        auth = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_optional_user(request: Request, session_token: Optional[str] = Cookie(default=None)) -> Optional[Dict[str, Any]]:
    try:
        return await get_current_user(request, session_token)
    except HTTPException:
        return None


# ============================================================
# Auth Routes (Emergent Google Auth)
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
# ============================================================
@api.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient(timeout=15) as http_client:
        r = await http_client.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": session_id})
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        data = r.json()

    email = data["email"]
    name = data.get("name", email.split("@")[0])
    picture = data.get("picture", "")
    session_token = data["session_token"]

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture, "last_login": now_iso()}},
        )
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "nickname": "",
            "country_code": "",
            "country_name": "",
            "country_flag": "",
            "district": "",
            "occupation": "",
            "onboarded": False,
            "created_at": now_iso(),
            "last_login": now_iso(),
        }
        await db.users.insert_one(user.copy())

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one(
        {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": expires_at.isoformat(),
            "created_at": now_iso(),
        }
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )
    user = clean(user)
    return {"user": user}


@api.get("/auth/me")
async def me(user: Dict[str, Any] = Depends(get_current_user)):
    return clean(user)


@api.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(default=None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.post("/auth/onboarding")
async def complete_onboarding(payload: OnboardingPayload, user: Dict[str, Any] = Depends(get_current_user)):
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {**payload.model_dump(), "onboarded": True}},
    )
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return clean(updated)


@api.patch("/auth/profile")
async def update_profile(payload: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    allowed = {k: v for k, v in payload.items() if k in {"nickname", "district", "occupation", "country_code", "country_name", "country_flag"}}
    if allowed:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": allowed})
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return clean(updated)


# ============================================================
# Author projection helper
# ============================================================
async def author_info(user_id: str, is_anonymous: bool = False) -> Dict[str, str]:
    if is_anonymous:
        return {"user_id": "", "nickname": "익명", "country_flag": "🕶️"}
    u = await db.users.find_one({"user_id": user_id}, {"_id": 0, "nickname": 1, "country_flag": 1, "country_name": 1, "user_id": 1, "name": 1})
    if not u:
        return {"user_id": user_id, "nickname": "Unknown", "country_flag": "🌍"}
    return {
        "user_id": u.get("user_id", user_id),
        "nickname": u.get("nickname") or u.get("name") or "User",
        "country_flag": u.get("country_flag") or "🌍",
        "country_name": u.get("country_name") or "",
    }


async def push_notification(*, user_id: str, n_type: str, title: str, body: str, **extras) -> None:
    """Insert a notification row for `user_id`. No-op if user_id is empty/None."""
    if not user_id:
        return
    doc = {
        "notification_id": f"n_{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "type": n_type,
        "title": title,
        "body": body,
        "read": False,
        "created_at": now_iso(),
        **extras,
    }
    try:
        await db.notifications.insert_one(doc)
    except Exception as e:
        logger.warning("notification push failed: %s", e)


# ============================================================
# Posts (Board)
# ============================================================
@api.get("/posts")
async def list_posts(category_id: Optional[str] = None, limit: int = 100):
    query: Dict[str, Any] = {}
    if category_id:
        query["category_id"] = category_id
    cursor = db.posts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    for p in items:
        p["author"] = await author_info(p["user_id"], p.get("is_anonymous", False))
        p["comment_count"] = await db.comments.count_documents({"post_id": p["post_id"]})
    return items


@api.get("/posts/{post_id}")
async def get_post(post_id: str, user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.posts.update_one({"post_id": post_id}, {"$inc": {"views": 1}})
    post["views"] = post.get("views", 0) + 1
    post["author"] = await author_info(post["user_id"], post.get("is_anonymous", False))
    post["comment_count"] = await db.comments.count_documents({"post_id": post_id})
    if user:
        my_reaction = await db.post_reactions.find_one({"post_id": post_id, "user_id": user["user_id"]}, {"_id": 0})
        post["my_reaction"] = my_reaction.get("reaction_type") if my_reaction else None
        saved = await db.saved_posts.find_one({"post_id": post_id, "user_id": user["user_id"]}, {"_id": 0})
        post["is_saved"] = bool(saved)
    return post


@api.post("/posts")
async def create_post(payload: PostCreate, user: Dict[str, Any] = Depends(get_current_user)):
    post = {
        "post_id": f"post_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "category_id": payload.category_id,
        "sub_category_id": payload.sub_category_id or "",
        "title": payload.title,
        "content": payload.content,
        "is_anonymous": payload.is_anonymous,
        "views": 0,
        "reactions": {"helpful": 0, "trustworthy": 0, "unhelpful": 0, "untrustworthy": 0},
        "created_at": now_iso(),
    }
    await db.posts.insert_one(post.copy())
    post = clean(post)
    post["author"] = await author_info(user["user_id"], payload.is_anonymous)
    post["comment_count"] = 0
    return post


@api.post("/posts/{post_id}/react")
async def react_post(post_id: str, payload: ReactionPayload, user: Dict[str, Any] = Depends(get_current_user)):
    if payload.reaction_type not in {"helpful", "trustworthy", "unhelpful", "untrustworthy"}:
        raise HTTPException(status_code=400, detail="Invalid reaction")

    existing = await db.post_reactions.find_one({"post_id": post_id, "user_id": user["user_id"]}, {"_id": 0})
    inc: Dict[str, int] = {}
    if existing:
        old = existing["reaction_type"]
        if old == payload.reaction_type:
            await db.post_reactions.delete_one({"post_id": post_id, "user_id": user["user_id"]})
            inc[f"reactions.{old}"] = -1
        else:
            await db.post_reactions.update_one(
                {"post_id": post_id, "user_id": user["user_id"]},
                {"$set": {"reaction_type": payload.reaction_type}},
            )
            inc[f"reactions.{old}"] = -1
            inc[f"reactions.{payload.reaction_type}"] = 1
    else:
        await db.post_reactions.insert_one(
            {"post_id": post_id, "user_id": user["user_id"], "reaction_type": payload.reaction_type, "created_at": now_iso()}
        )
        inc[f"reactions.{payload.reaction_type}"] = 1
    if inc:
        await db.posts.update_one({"post_id": post_id}, {"$inc": inc})
    post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
    return {"reactions": post["reactions"], "my_reaction": payload.reaction_type if not existing or existing["reaction_type"] != payload.reaction_type else None}


@api.post("/posts/{post_id}/save")
async def toggle_save(post_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    existing = await db.saved_posts.find_one({"post_id": post_id, "user_id": user["user_id"]}, {"_id": 0})
    if existing:
        await db.saved_posts.delete_one({"post_id": post_id, "user_id": user["user_id"]})
        return {"is_saved": False}
    await db.saved_posts.insert_one({"post_id": post_id, "user_id": user["user_id"], "created_at": now_iso()})
    return {"is_saved": True}


@api.get("/posts/{post_id}/comments")
async def list_comments(post_id: str):
    cursor = db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1)
    items = await cursor.to_list(500)
    for c in items:
        c["author"] = await author_info(c["user_id"], c.get("is_anonymous", False))
    return items


@api.post("/posts/{post_id}/comments")
async def add_comment(post_id: str, payload: CommentCreate, user: Dict[str, Any] = Depends(get_current_user)):
    comment = {
        "comment_id": f"cmt_{uuid.uuid4().hex[:12]}",
        "post_id": post_id,
        "user_id": user["user_id"],
        "content": payload.content,
        "is_anonymous": payload.is_anonymous,
        "likes": 0,
        "created_at": now_iso(),
    }
    await db.comments.insert_one(comment.copy())
    comment = clean(comment)
    comment["author"] = await author_info(user["user_id"], payload.is_anonymous)

    # Notification triggers — fan out only to people who didn't write this comment.
    post = await db.posts.find_one({"post_id": post_id}, {"_id": 0, "user_id": 1, "category_id": 1, "title": 1})
    if post:
        commenter_name = comment["author"].get("nickname") or "Someone"
        notified: set = {user["user_id"]}
        # 1) Notify post author about the new comment
        if post["user_id"] not in notified:
            await push_notification(
                user_id=post["user_id"], n_type="comment",
                title="내 글에 댓글이 달렸습니다",
                body=f"{commenter_name}님이 댓글을 달았습니다",
                post_id=post_id, category_id=post.get("category_id", ""),
            )
            notified.add(post["user_id"])
        # 2) Notify everyone who previously commented on this post ("reply" notification)
        prior = await db.comments.find(
            {"post_id": post_id, "user_id": {"$nin": list(notified)}}, {"_id": 0, "user_id": 1}
        ).to_list(200)
        for c in prior:
            uid = c.get("user_id")
            if uid and uid not in notified:
                await push_notification(
                    user_id=uid, n_type="reply",
                    title="내 댓글에 답장",
                    body=f"{commenter_name}님이 답장했습니다",
                    post_id=post_id, category_id=post.get("category_id", ""),
                )
                notified.add(uid)
    return comment


# ============================================================
# My activity
# ============================================================
@api.get("/me/posts")
async def my_posts(user: Dict[str, Any] = Depends(get_current_user)):
    items = await db.posts.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    for p in items:
        p["author"] = await author_info(user["user_id"], p.get("is_anonymous", False))
        p["comment_count"] = await db.comments.count_documents({"post_id": p["post_id"]})
    return items


@api.get("/me/saved")
async def my_saved(user: Dict[str, Any] = Depends(get_current_user)):
    saves = await db.saved_posts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    ids = [s["post_id"] for s in saves]
    items = await db.posts.find({"post_id": {"$in": ids}}, {"_id": 0}).to_list(200)
    for p in items:
        p["author"] = await author_info(p["user_id"], p.get("is_anonymous", False))
        p["comment_count"] = await db.comments.count_documents({"post_id": p["post_id"]})
        p["is_saved"] = True
    return items


@api.get("/me/liked")
async def my_liked(user: Dict[str, Any] = Depends(get_current_user)):
    reactions = await db.post_reactions.find(
        {"user_id": user["user_id"], "reaction_type": "helpful"}, {"_id": 0}
    ).to_list(500)
    ids = [r["post_id"] for r in reactions]
    items = await db.posts.find({"post_id": {"$in": ids}}, {"_id": 0}).to_list(500)
    for p in items:
        p["author"] = await author_info(p["user_id"], p.get("is_anonymous", False))
        p["comment_count"] = await db.comments.count_documents({"post_id": p["post_id"]})
    return items


@api.get("/me/comments")
async def my_comments(user: Dict[str, Any] = Depends(get_current_user)):
    items = await db.comments.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    # Attach the parent post title + category_id so the page can render context + link
    post_ids = list({c["post_id"] for c in items})
    posts = await db.posts.find({"post_id": {"$in": post_ids}}, {"_id": 0, "post_id": 1, "title": 1, "category_id": 1}).to_list(500)
    by_id = {p["post_id"]: p for p in posts}
    for c in items:
        parent = by_id.get(c["post_id"])
        c["post_title"] = parent.get("title") if parent else ""
        c["category_id"] = parent.get("category_id") if parent else ""
    return items


# ============================================================
# Petitions
# ============================================================
@api.get("/petitions")
async def list_petitions(sort: str = "votes"):
    cursor = db.petitions.find({}, {"_id": 0})
    items = await cursor.to_list(500)
    if sort == "votes":
        items.sort(key=lambda x: x.get("signature_count", 0), reverse=True)
    else:
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items


@api.get("/petitions/{petition_id}")
async def get_petition(petition_id: str, user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    p = await db.petitions.find_one({"petition_id": petition_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if user:
        sig = await db.petition_signatures.find_one({"petition_id": petition_id, "user_id": user["user_id"]}, {"_id": 0})
        p["has_signed"] = bool(sig)
    return p


@api.post("/petitions")
async def create_petition(payload: PetitionCreate, user: Dict[str, Any] = Depends(get_current_user)):
    p = {
        "petition_id": f"pet_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "deadline": payload.deadline,
        "signature_count": 0,
        "status": "active",
        "created_at": now_iso(),
    }
    await db.petitions.insert_one(p.copy())
    return clean(p)


@api.post("/petitions/{petition_id}/sign")
async def sign_petition(petition_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    existing = await db.petition_signatures.find_one({"petition_id": petition_id, "user_id": user["user_id"]}, {"_id": 0})
    if existing:
        return {"already_signed": True}
    await db.petition_signatures.insert_one(
        {"petition_id": petition_id, "user_id": user["user_id"], "created_at": now_iso()}
    )
    await db.petitions.update_one({"petition_id": petition_id}, {"$inc": {"signature_count": 1}})
    p = await db.petitions.find_one({"petition_id": petition_id}, {"_id": 0})
    # Notify petition creator (skip self-signs)
    if p and p.get("user_id") and p["user_id"] != user["user_id"]:
        await push_notification(
            user_id=p["user_id"], n_type="signature",
            title="내 청원에 새 서명",
            body="새로운 서명이 추가되었습니다",
            petition_id=petition_id,
        )
    return {"signature_count": p["signature_count"], "has_signed": True}


# ============================================================
# Reviews
# ============================================================
@api.get("/reviews")
async def list_reviews(category: Optional[str] = None, q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category:
        query["category"] = category
    if q:
        query["$or"] = [{"place_name": {"$regex": q, "$options": "i"}}, {"content": {"$regex": q, "$options": "i"}}]
    items = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    for r in items:
        r["author"] = await author_info(r["user_id"], r.get("is_anonymous", False))
    return items


@api.post("/reviews")
async def create_review(payload: ReviewCreate, user: Dict[str, Any] = Depends(get_current_user)):
    r = {
        "review_id": f"rev_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "category": payload.category,
        "place_name": payload.place_name,
        "rating": payload.rating,
        "content": payload.content,
        "is_anonymous": payload.is_anonymous,
        "likes": 0,
        "created_at": now_iso(),
    }
    await db.reviews.insert_one(r.copy())
    r = clean(r)
    r["author"] = await author_info(user["user_id"], payload.is_anonymous)
    return r


@api.post("/reviews/{review_id}/like")
async def like_review(review_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    existing = await db.review_likes.find_one({"review_id": review_id, "user_id": user["user_id"]}, {"_id": 0})
    if existing:
        await db.review_likes.delete_one({"review_id": review_id, "user_id": user["user_id"]})
        await db.reviews.update_one({"review_id": review_id}, {"$inc": {"likes": -1}})
        r = await db.reviews.find_one({"review_id": review_id}, {"_id": 0})
        return {"likes": r["likes"], "liked": False}
    await db.review_likes.insert_one({"review_id": review_id, "user_id": user["user_id"], "created_at": now_iso()})
    await db.reviews.update_one({"review_id": review_id}, {"$inc": {"likes": 1}})
    r = await db.reviews.find_one({"review_id": review_id}, {"_id": 0})
    return {"likes": r["likes"], "liked": True}


# ============================================================
# Chat
# ============================================================
@api.get("/chat/channels")
async def list_channels(user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    items = await db.chat_channels.find({}, {"_id": 0}).sort("member_count", -1).to_list(500)
    return items


@api.post("/chat/channels")
async def create_channel(payload: ChannelCreate, user: Dict[str, Any] = Depends(get_current_user)):
    ch = {
        "channel_id": f"ch_{uuid.uuid4().hex[:10]}",
        "name": payload.name,
        "description": payload.description or "",
        "icon": "💬",
        "channel_type": "interest",
        "country_code": None,
        "is_default": False,
        "member_count": 1,
        "created_by": user["user_id"],
        "created_at": now_iso(),
    }
    await db.chat_channels.insert_one(ch.copy())
    # Auto-join creator
    await db.chat_members.insert_one(
        {"channel_id": ch["channel_id"], "user_id": user["user_id"], "created_at": now_iso()}
    )
    return clean(ch)


@api.post("/chat/channels/{channel_id}/join")
async def join_channel(channel_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    existing = await db.chat_members.find_one({"channel_id": channel_id, "user_id": user["user_id"]}, {"_id": 0})
    if not existing:
        await db.chat_members.insert_one(
            {"channel_id": channel_id, "user_id": user["user_id"], "created_at": now_iso()}
        )
        await db.chat_channels.update_one({"channel_id": channel_id}, {"$inc": {"member_count": 1}})
    return {"joined": True}


@api.get("/chat/channels/{channel_id}/messages")
async def list_messages(channel_id: str):
    items = await db.chat_messages.find({"channel_id": channel_id}, {"_id": 0}).sort("created_at", 1).to_list(200)
    for m in items:
        m["author"] = await author_info(m["user_id"], False)
    return items


@api.post("/chat/channels/{channel_id}/messages")
async def post_message(channel_id: str, payload: ChatMessageCreate, user: Dict[str, Any] = Depends(get_current_user)):
    msg = {
        "message_id": f"msg_{uuid.uuid4().hex[:10]}",
        "channel_id": channel_id,
        "user_id": user["user_id"],
        "content": payload.content,
        "created_at": now_iso(),
    }
    await db.chat_messages.insert_one(msg.copy())
    msg = clean(msg)
    msg["author"] = await author_info(user["user_id"], False)

    # Notify other members (or channel creator if no member tracking yet)
    channel = await db.chat_channels.find_one({"channel_id": channel_id}, {"_id": 0})
    if channel:
        members = await db.chat_members.find(
            {"channel_id": channel_id, "user_id": {"$ne": user["user_id"]}}, {"_id": 0, "user_id": 1}
        ).to_list(500)
        targets = [m["user_id"] for m in members]
        if not targets and channel.get("created_by") and channel["created_by"] != user["user_id"]:
            targets = [channel["created_by"]]
        for uid in targets[:50]:  # cap to avoid notification storms
            await push_notification(
                user_id=uid, n_type="chat",
                title="새 채팅 메시지",
                body=f"{channel.get('name', '채널')}에 새 메시지가 있습니다",
                channel_id=channel_id,
            )
    return msg


# ============================================================
# Notifications
# ============================================================
@api.get("/notifications")
async def list_notifications(user: Dict[str, Any] = Depends(get_current_user)):
    items = await db.notifications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    if not items:
        # Seed three demo notifications for new users with navigation targets
        seed = [
            {"notification_id": f"n_{uuid.uuid4().hex[:8]}", "user_id": user["user_id"], "type": "comment", "title": "내 글에 댓글이 달렸습니다", "body": "비자 연장 성공 후기에 새 댓글이 있어요", "post_id": "post_seed_1", "category_id": "visa", "read": False, "created_at": now_iso()},
            {"notification_id": f"n_{uuid.uuid4().hex[:8]}", "user_id": user["user_id"], "type": "reply", "title": "내 댓글에 답장", "body": "Maria님이 답장을 남겼습니다", "post_id": "post_seed_5", "category_id": "daily", "read": False, "created_at": now_iso()},
            {"notification_id": f"n_{uuid.uuid4().hex[:8]}", "user_id": user["user_id"], "type": "chat", "title": "새 채팅 메시지", "body": "Global 채널에서 멘션됨", "channel_id": "ch_global", "read": False, "created_at": now_iso()},
        ]
        await db.notifications.insert_many([s.copy() for s in seed])
        items = seed
        for s in items:
            s.pop("_id", None)
    return items


@api.post("/notifications/read-all")
async def read_all(user: Dict[str, Any] = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}


# ============================================================
# Translation proxy (MyMemory free API)
# ============================================================
class TranslatePayload(BaseModel):
    text: str
    target: str
    source: Optional[str] = "ko"


@api.post("/translate")
async def translate(payload: TranslatePayload):
    if not payload.text.strip():
        return {"translated": ""}
    try:
        async with httpx.AsyncClient(timeout=10) as http_client:
            r = await http_client.get(
                "https://api.mymemory.translated.net/get",
                params={"q": payload.text[:500], "langpair": f"{payload.source}|{payload.target}"},
            )
            data = r.json()
            translated = data.get("responseData", {}).get("translatedText", payload.text)
            return {"translated": translated}
    except Exception as e:
        logger.warning("translation failed: %s", e)
        return {"translated": payload.text}


@api.get("/")
async def root():
    return {"app": "IMTA", "status": "ok"}


@api.get("/stats")
async def community_stats():
    users = await db.users.count_documents({})
    posts = await db.posts.count_documents({})
    sigs = await db.petition_signatures.count_documents({})
    # include hard-seeded signature counts as part of "total signatures"
    pets = await db.petitions.find({}, {"_id": 0, "signature_count": 1}).to_list(50)
    sigs += sum(p.get("signature_count", 0) for p in pets)
    return {"users": users, "posts": posts, "signatures": sigs}


# ============================================================
# Seeding
# ============================================================
SEED_USERS = [
    {"user_id": "seed_nguyen", "nickname": "응우옌", "country_flag": "🇻🇳", "country_name": "Vietnam"},
    {"user_id": "seed_nana", "nickname": "Nana", "country_flag": "🇻🇳", "country_name": "Vietnam"},
    {"user_id": "seed_anon", "nickname": "익명", "country_flag": "🕶️", "country_name": ""},
    {"user_id": "seed_liwei", "nickname": "리웨이", "country_flag": "🇨🇳", "country_name": "China"},
    {"user_id": "seed_maria", "nickname": "Maria", "country_flag": "🇵🇭", "country_name": "Philippines"},
]

SEED_POSTS = [
    {
        "post_id": "post_seed_1",
        "user_id": "seed_nguyen",
        "category_id": "visa",
        "sub_category_id": "visa-extension",
        "title": "비자 연장 성공했습니다! E-9→E-7 변경 후기",
        "content": "E-9 비자 만료 6개월 전부터 준비했습니다. 회사에서 추천서를 받고 한국어 능력시험(TOPIK 4급) 자격증, 경력증명서, 소득증명서를 모두 갖췄어요. 출입국관리사무소 예약은 한 달 전에 했고, 서류는 정확하게 준비하는 게 가장 중요합니다. 결과적으로 3주만에 승인 받았어요!",
        "is_anonymous": False,
        "views": 1840,
        "reactions": {"helpful": 278, "trustworthy": 165, "unhelpful": 4, "untrustworthy": 1},
    },
    {
        "post_id": "post_seed_2",
        "user_id": "seed_nana",
        "category_id": "labor",
        "sub_category_id": "employment",
        "title": "Hi, I'm a Vietnamese parent looking for job certifications for foreigners",
        "content": "Hello everyone, I am from Vietnam and I have been in Korea for 3 years. I'd like to know which certifications help foreigners find better jobs here. Has anyone taken HRD-Korea exams or the OPIc? Any advice on stable office jobs welcomed!",
        "is_anonymous": False,
        "views": 942,
        "reactions": {"helpful": 278, "trustworthy": 102, "unhelpful": 8, "untrustworthy": 2},
    },
    {
        "post_id": "post_seed_3",
        "user_id": "seed_anon",
        "category_id": "housing",
        "sub_category_id": "tenant-rights",
        "title": "집주인이 외국인이라고 보증금 돌려주지 않아요. 도와주세요",
        "content": "2년 계약 끝나고 이사 나갔는데 집주인이 보증금 1000만원을 한 달째 안 돌려줍니다. 처음엔 영수증 달라더니, 이제는 연락도 안 받아요. 이런 경우 어떻게 해야 하나요? 변호사가 필요할까요?",
        "is_anonymous": True,
        "views": 521,
        "reactions": {"helpful": 34, "trustworthy": 28, "unhelpful": 1, "untrustworthy": 0},
    },
    {
        "post_id": "post_seed_4",
        "user_id": "seed_liwei",
        "category_id": "korean",
        "sub_category_id": "topik",
        "title": "TOPIK 4급 독학 3개월 합격 후기 공유합니다",
        "content": "안녕하세요! 중국에서 온 리웨이입니다. 한국어를 독학으로 3개월 공부해서 TOPIK 4급에 합격했어요. 주요 교재는 '연세 한국어'와 EBS 두리안, 그리고 매일 한국 드라마 1편씩 자막 없이 봤습니다. 공부법 자세히 댓글에서 답변드릴게요!",
        "is_anonymous": False,
        "views": 1230,
        "reactions": {"helpful": 89, "trustworthy": 67, "unhelpful": 2, "untrustworthy": 0},
    },
    {
        "post_id": "post_seed_5",
        "user_id": "seed_maria",
        "category_id": "daily",
        "sub_category_id": "food",
        "title": "Guys, I just got scammed at a restaurant. OMG please help",
        "content": "I went to a small restaurant in 강남 and the menu had no English. They charged me 80,000 won for 2 people - I thought it would be much cheaper. The waiter said it's the foreigner price. Is this legal? What should I do?",
        "is_anonymous": False,
        "views": 612,
        "reactions": {"helpful": 34, "trustworthy": 19, "unhelpful": 6, "untrustworthy": 12},
    },
]

SEED_PETITIONS = [
    {"petition_id": "pet_seed_1", "user_id": "seed_nguyen", "title": "외국인 근로자 직장 이동 제한 완화를 요청합니다", "description": "현재 E-9 비자 근로자는 3년 동안 직장을 4번까지만 옮길 수 있고, 사업주 동의가 필수입니다. 이는 외국인 근로자가 부당한 대우를 받아도 회사를 옮기지 못하게 만드는 구조적 문제입니다. 자유로운 이직 보장을 요청합니다.", "category": "labor", "deadline_days": 15, "signature_count": 234125, "status": "active"},
    {"petition_id": "pet_seed_2", "user_id": "seed_anon", "title": "외국인이라는 이유로 계약 거부 관행 중단을 촉구합니다", "description": "주거, 통신, 금융 등 일상 계약에서 외국인이라는 이유만으로 거부되는 사례가 빈번합니다. 외국인 차별 금지법 제정을 통해 이러한 관행을 근절해야 합니다.", "category": "discrimination", "deadline_days": 20, "signature_count": 134425, "status": "active"},
    {"petition_id": "pet_seed_3", "user_id": "seed_maria", "title": "이민자 대상 무료 한국어 교육 확대를 요청합니다", "description": "한국어 능력 부족은 이민자가 한국 사회에 정착하는 데 가장 큰 장벽입니다. 지역별 무료 한국어 교실, 온라인 강의, 1대1 튜터링 등 다양한 형태의 무료 교육 프로그램 확대를 요청합니다.", "category": "education", "deadline_days": 30, "signature_count": 89432, "status": "active"},
    {"petition_id": "pet_seed_4", "user_id": "seed_liwei", "title": "건강보험 외국인 적용 기준 개선을 촉구합니다", "description": "현행 외국인 건강보험은 6개월 거주 요건과 높은 보험료로 진입 장벽이 큽니다. 단기 체류 외국인을 위한 단기 가입 옵션과 보험료 경감 제도 마련을 요청합니다.", "category": "medical", "deadline_days": 45, "signature_count": 67218, "status": "active"},
    {"petition_id": "pet_seed_5", "user_id": "seed_nana", "title": "다국어 행정 서비스 의무화를 요청합니다", "description": "출입국, 세무, 의료, 교육 등 주요 공공 서비스의 다국어 안내를 의무화해야 합니다. 특히 베트남어, 중국어, 영어, 필리핀어 등 주요 이민자 언어를 우선 지원해야 합니다.", "category": "admin", "deadline_days": 60, "signature_count": 45891, "status": "active"},
]

SEED_REVIEWS = [
    {"review_id": "rev_seed_1", "user_id": "seed_nguyen", "category": "restaurant", "place_name": "Sieun Restaurant", "rating": 2, "content": "음식은 괜찮은데 사장님이 불친절해요. 외국인이라고 무시하는 듯한 태도가 느껴졌어요. 다시 가고 싶지 않아요.", "is_anonymous": False, "likes": 23},
    {"review_id": "rev_seed_2", "user_id": "seed_maria", "category": "market", "place_name": "Seohyeon Market", "rating": 4, "content": "외국 식재료가 거의 다 있어요! 베트남, 필리핀, 태국 향신료까지 다양해서 정말 좋아요. 사장님도 친절해요.", "is_anonymous": False, "likes": 41},
    {"review_id": "rev_seed_3", "user_id": "seed_anon", "category": "housing", "place_name": "Seunghwan Villa", "rating": 1, "content": "외국인이라고 보증금을 2배 요구했어요. 다른 한국인 입주자에게 물어보니 절반이었습니다. 차별이에요. 절대 가지 마세요.", "is_anonymous": True, "likes": 88},
    {"review_id": "rev_seed_4", "user_id": "seed_liwei", "category": "hospital", "place_name": "강남 성모병원 국제진료센터", "rating": 5, "content": "영어로 진료가 가능하고 의료진이 매우 친절했어요. 통역사도 상주해 있어서 안심하고 진료받았습니다. 비용도 합리적이에요.", "is_anonymous": False, "likes": 56},
]

SEED_CHANNELS = [
    {"channel_id": "ch_global", "name": "🌍 Global", "description": "All immigrants welcome", "icon": "🌍", "channel_type": "global", "country_code": None, "is_default": True, "member_count": 34821},
    {"channel_id": "ch_vn", "name": "🇻🇳 Vietnam", "description": "Cộng đồng Việt Nam tại Hàn Quốc", "icon": "🇻🇳", "channel_type": "country", "country_code": "VN", "is_default": True, "member_count": 8234},
    {"channel_id": "ch_cn", "name": "🇨🇳 China", "description": "在韩中国人社区", "icon": "🇨🇳", "channel_type": "country", "country_code": "CN", "is_default": True, "member_count": 6102},
    {"channel_id": "ch_ph", "name": "🇵🇭 Philippines", "description": "Pinoy community in Korea", "icon": "🇵🇭", "channel_type": "country", "country_code": "PH", "is_default": True, "member_count": 3456},
    {"channel_id": "ch_kh", "name": "🇰🇭 Cambodia", "description": "សហគមន៍ខ្មែរនៅកូរ៉េ", "icon": "🇰🇭", "channel_type": "country", "country_code": "KH", "is_default": True, "member_count": 2891},
    {"channel_id": "ch_mn", "name": "🇲🇳 Mongolia", "description": "Солонгос дахь Монгол", "icon": "🇲🇳", "channel_type": "country", "country_code": "MN", "is_default": True, "member_count": 2103},
    {"channel_id": "ch_ru", "name": "🇷🇺 Russia", "description": "Русскоязычное сообщество в Корее", "icon": "🇷🇺", "channel_type": "country", "country_code": "RU", "is_default": True, "member_count": 1842},
    {"channel_id": "ch_jp", "name": "🇯🇵 Japan", "description": "韓国在住の日本人コミュニティ", "icon": "🇯🇵", "channel_type": "country", "country_code": "JP", "is_default": True, "member_count": 1633},
    {"channel_id": "ch_th", "name": "🇹🇭 Thailand", "description": "ชุมชนคนไทยในเกาหลี", "icon": "🇹🇭", "channel_type": "country", "country_code": "TH", "is_default": True, "member_count": 1421},
    {"channel_id": "ch_uz", "name": "🇺🇿 Uzbekistan", "description": "Koreyadagi O'zbek jamoasi", "icon": "🇺🇿", "channel_type": "country", "country_code": "UZ", "is_default": True, "member_count": 1284},
    {"channel_id": "ch_np", "name": "🇳🇵 Nepal", "description": "Nepali community in Korea", "icon": "🇳🇵", "channel_type": "country", "country_code": "NP", "is_default": True, "member_count": 1156},
    {"channel_id": "ch_mm", "name": "🇲🇲 Myanmar", "description": "Myanmar community in Korea", "icon": "🇲🇲", "channel_type": "country", "country_code": "MM", "is_default": True, "member_count": 982},
    {"channel_id": "ch_id", "name": "🇮🇩 Indonesia", "description": "Komunitas Indonesia di Korea", "icon": "🇮🇩", "channel_type": "country", "country_code": "ID", "is_default": True, "member_count": 1342},
    {"channel_id": "ch_in", "name": "🇮🇳 India", "description": "Indian community in Korea", "icon": "🇮🇳", "channel_type": "country", "country_code": "IN", "is_default": True, "member_count": 1098},
    {"channel_id": "ch_bd", "name": "🇧🇩 Bangladesh", "description": "Bangladeshi community in Korea", "icon": "🇧🇩", "channel_type": "country", "country_code": "BD", "is_default": True, "member_count": 856},
    {"channel_id": "ch_kz", "name": "🇰🇿 Kazakhstan", "description": "Қазақстандық қауымдастық Кореяда", "icon": "🇰🇿", "channel_type": "country", "country_code": "KZ", "is_default": True, "member_count": 612},
    {"channel_id": "ch_20s", "name": "20s only lol", "description": "Only for our young immigrants", "icon": "🎉", "channel_type": "interest", "country_code": None, "is_default": False, "member_count": 2349},
    {"channel_id": "ch_married", "name": "Married migrants? Join in!", "description": "Married immigrants community", "icon": "💍", "channel_type": "interest", "country_code": None, "is_default": False, "member_count": 34827},
    {"channel_id": "ch_seoul_worker", "name": "서울 직장인 모임", "description": "Seoul workers meetup", "icon": "💼", "channel_type": "interest", "country_code": None, "is_default": False, "member_count": 1203},
    {"channel_id": "ch_students", "name": "유학생 모임", "description": "International students hub", "icon": "🎓", "channel_type": "interest", "country_code": None, "is_default": False, "member_count": 4567},
]

SEED_CHAT_MESSAGES = [
    {"channel_id": "ch_global", "user_id": "seed_maria", "content": "Hi everyone! New here. Just moved to Seoul last week 👋"},
    {"channel_id": "ch_global", "user_id": "seed_nguyen", "content": "Welcome Maria! Where are you from?"},
    {"channel_id": "ch_global", "user_id": "seed_maria", "content": "Philippines! Looking for grocery stores with Filipino ingredients :)"},
    {"channel_id": "ch_global", "user_id": "seed_liwei", "content": "Try Itaewon area! There's a Filipino market on the side street."},
    {"channel_id": "ch_vn", "user_id": "seed_nguyen", "content": "Có bạn nào ở Gangnam không? Mình muốn làm quen!"},
    {"channel_id": "ch_vn", "user_id": "seed_nana", "content": "Mình ở Mapo, nhưng hay đi Gangnam cuối tuần 😄"},
]


async def seed_database():
    """Seed if collections are empty."""
    if await db.users.count_documents({"user_id": {"$in": [u["user_id"] for u in SEED_USERS]}}) == 0:
        for u in SEED_USERS:
            doc = {**u, "email": f"{u['user_id']}@seed.imta", "onboarded": True, "district": "강남구", "occupation": "worker", "created_at": now_iso()}
            await db.users.insert_one(doc)

    if await db.posts.count_documents({}) == 0:
        for p in SEED_POSTS:
            doc = {**p, "created_at": (datetime.now(timezone.utc) - timedelta(days=SEED_POSTS.index(p) + 1)).isoformat()}
            await db.posts.insert_one(doc)

    if await db.petitions.count_documents({}) == 0:
        for pet in SEED_PETITIONS:
            days = pet.pop("deadline_days")
            doc = {**pet, "deadline": (datetime.now(timezone.utc) + timedelta(days=days)).isoformat(), "created_at": (datetime.now(timezone.utc) - timedelta(days=days // 3)).isoformat()}
            await db.petitions.insert_one(doc)

    if await db.reviews.count_documents({}) == 0:
        for r in SEED_REVIEWS:
            doc = {**r, "created_at": (datetime.now(timezone.utc) - timedelta(days=SEED_REVIEWS.index(r) + 2)).isoformat()}
            await db.reviews.insert_one(doc)

    if await db.chat_channels.count_documents({"channel_type": {"$exists": True}}) == 0:
        # Migrate: clear old channels lacking the new schema, then reseed.
        await db.chat_channels.delete_many({"channel_type": {"$exists": False}})
        for c in SEED_CHANNELS:
            await db.chat_channels.insert_one({**c, "created_at": now_iso()})

    if await db.chat_messages.count_documents({}) == 0:
        for i, m in enumerate(SEED_CHAT_MESSAGES):
            doc = {**m, "message_id": f"msg_seed_{i}", "created_at": (datetime.now(timezone.utc) - timedelta(hours=len(SEED_CHAT_MESSAGES) - i)).isoformat()}
            await db.chat_messages.insert_one(doc)


# ============================================================
# Startup / CORS
# ============================================================
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=r"https?://.*",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    try:
        await seed_database()
        logger.info("seed completed")
    except Exception as e:
        logger.exception("seed error: %s", e)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
