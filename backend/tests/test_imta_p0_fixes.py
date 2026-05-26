"""IMTA P0 fixes regression: review return shape, chat channel icon, notification fan-out."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = (os.environ.get("BACKEND_URL") or "https://korea-migrants.preview.emergentagent.com").rstrip("/")
SESSION_TOKEN = "test_session_1779718769701"  # 테스트 user, country_code=VN
USER_ID = "test_user_1779718769701"


@pytest.fixture(scope="session")
def auth():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {SESSION_TOKEN}"})
    return s


# ---- Reviews: full response shape (P0 #1) ----
def test_create_review_returns_full_object(auth):
    payload = {
        "category": "restaurant",
        "place_name": f"TEST_place_{uuid.uuid4().hex[:6]}",
        "rating": 4,
        "content": "TEST review content " * 5,
        "is_anonymous": False,
    }
    r = auth.post(f"{BASE_URL}/api/reviews", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ["review_id", "category", "place_name", "rating", "content", "author"]:
        assert k in d, f"missing key {k}"
    assert d["category"] == "restaurant"
    assert d["rating"] == 4
    assert d["author"]["nickname"] == "테스트"
    # GET persistence
    g = auth.get(f"{BASE_URL}/api/reviews?category=restaurant")
    assert g.status_code == 200
    assert any(x["review_id"] == d["review_id"] for x in g.json())


# ---- Chat channels: icon round-trip (P0 #3) ----
def test_create_channel_persists_icon(auth):
    name = f"TEST_ch_{uuid.uuid4().hex[:6]}"
    r = auth.post(f"{BASE_URL}/api/chat/channels", json={"name": name, "description": "test", "icon": "🚴"})
    assert r.status_code == 200, r.text
    ch = r.json()
    assert ch["icon"] == "🚴"
    assert ch["channel_type"] == "interest"
    assert ch["country_code"] is None
    # GET list to verify persistence
    g = auth.get(f"{BASE_URL}/api/chat/channels")
    assert g.status_code == 200
    found = next((c for c in g.json() if c["channel_id"] == ch["channel_id"]), None)
    assert found is not None
    assert found["icon"] == "🚴"


def test_country_channel_VN_present(auth):
    """User country_code=VN must have a matching ch_vn channel in the response."""
    r = auth.get(f"{BASE_URL}/api/chat/channels")
    assert r.status_code == 200
    vn = [c for c in r.json() if c.get("channel_type") == "country" and (c.get("country_code") or "").upper() == "VN"]
    assert len(vn) == 1, "Expected exactly one VN country channel"
    assert vn[0]["channel_id"] == "ch_vn"


# ---- Notification fan-out (P0 #2) ----
def _count_notifs(session, n_type=None, key=None, val=None):
    r = session.get(f"{BASE_URL}/api/notifications")
    items = r.json() if r.status_code == 200 else []
    out = items
    if n_type:
        out = [n for n in out if n.get("type") == n_type]
    if key:
        out = [n for n in out if n.get(key) == val]
    return out


def test_comment_notification_post_author_and_no_self_notif(auth):
    """Commenting on someone else's post creates a 'comment' notification for the post author,
    but NOT for the commenter themselves."""
    # Use seeded post (author=seed_nguyen). Test user is different.
    post_id = "post_seed_1"
    # Pre-count test user's own notifications
    before_self = _count_notifs(auth, n_type="comment", key="post_id", val=post_id)
    # Comment from test_user
    c = auth.post(f"{BASE_URL}/api/posts/{post_id}/comments", json={"content": f"TEST notif {uuid.uuid4().hex[:6]}", "is_anonymous": False})
    assert c.status_code == 200
    time.sleep(0.5)
    # Test user (commenter) should NOT have a self-notification added
    after_self = _count_notifs(auth, n_type="comment", key="post_id", val=post_id)
    assert len(after_self) == len(before_self), f"Self-notification leaked: {after_self}"


def test_petition_signature_notification_not_self(auth):
    """Signing your own petition should not create a self-notification."""
    # Create a petition by test user
    p = auth.post(f"{BASE_URL}/api/petitions", json={
        "title": f"TEST_pet_{uuid.uuid4().hex[:6]}",
        "description": "TEST",
        "category": "labor",
        "deadline": "2099-01-01",
    })
    assert p.status_code == 200
    pet_id = p.json()["petition_id"]
    before = _count_notifs(auth, n_type="signature", key="petition_id", val=pet_id)
    # Self-sign
    s = auth.post(f"{BASE_URL}/api/petitions/{pet_id}/sign")
    assert s.status_code == 200
    time.sleep(0.3)
    after = _count_notifs(auth, n_type="signature", key="petition_id", val=pet_id)
    assert len(after) == len(before), "Self-signature notification leaked"


def test_chat_notification_no_self(auth):
    """Posting a message in a channel should not create a self-notification for the sender."""
    # Use an interest channel created by test user (or create one now)
    ch = auth.post(f"{BASE_URL}/api/chat/channels", json={"name": f"TEST_notif_{uuid.uuid4().hex[:6]}", "description": "", "icon": "💬"})
    assert ch.status_code == 200
    ch_id = ch.json()["channel_id"]
    before = _count_notifs(auth, n_type="chat", key="channel_id", val=ch_id)
    m = auth.post(f"{BASE_URL}/api/chat/channels/{ch_id}/messages", json={"content": "TEST self chat"})
    assert m.status_code == 200
    time.sleep(0.3)
    after = _count_notifs(auth, n_type="chat", key="channel_id", val=ch_id)
    assert len(after) == len(before), "Self chat notification leaked"


def test_regression_core_endpoints(auth):
    """auth/me, posts, petitions, reviews respond 200."""
    for path in ["/api/auth/me", "/api/posts", "/api/petitions", "/api/reviews", "/api/chat/channels"]:
        r = auth.get(f"{BASE_URL}{path}")
        assert r.status_code == 200, f"{path} -> {r.status_code}"
