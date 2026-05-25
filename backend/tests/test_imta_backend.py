"""IMTA backend regression tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("BACKEND_URL") or "https://korea-migrants.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

# Test user pre-seeded via mongosh (see /app/memory/test_credentials.md)
SESSION_TOKEN = "test_session_1779718769701"
USER_ID = "test_user_1779718769701"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_client():
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SESSION_TOKEN}",
    })
    return s


# --- Health ---
def test_health(client):
    r = client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# --- Seeded data ---
def test_posts_seed(client):
    r = client.get(f"{BASE_URL}/api/posts")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 5
    flags = {p["author"]["country_flag"] for p in items}
    # Check that seeded country flags exist among authors
    assert flags & {"🇻🇳", "🇨🇳", "🇵🇭", "🕶️"}
    nicknames = {p["author"]["nickname"] for p in items}
    assert {"응우옌", "Nana", "익명", "리웨이", "Maria"}.issubset(nicknames)


def test_petitions_seed(client):
    r = client.get(f"{BASE_URL}/api/petitions")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 5
    counts = sorted([p["signature_count"] for p in items], reverse=True)
    assert counts[:5] == [234125, 134425, 89432, 67218, 45891]


def test_reviews_seed(client):
    r = client.get(f"{BASE_URL}/api/reviews")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 4
    by_name = {x["place_name"]: x for x in items}
    assert by_name["Sieun Restaurant"]["rating"] == 2
    assert by_name["Seohyeon Market"]["rating"] == 4
    assert by_name["Seunghwan Villa"]["rating"] == 1
    assert any("강남 성모병원" in n for n in by_name) and any(x["rating"] == 5 for x in items)


def test_chat_channels_seed(client):
    r = client.get(f"{BASE_URL}/api/chat/channels")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 10
    defaults = sum(1 for c in items if c.get("is_default"))
    assert defaults == 6


# --- Auth ---
def test_auth_unauthenticated(client):
    r = client.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_protected_endpoint_blocked(client):
    r = client.post(f"{BASE_URL}/api/posts", json={"category_id": "x", "title": "t", "content": "c"})
    assert r.status_code == 401


def test_auth_me(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200, r.text
    u = r.json()
    assert u["user_id"] == USER_ID
    assert u["nickname"] == "테스트"
    assert u["onboarded"] is True


def test_google_session_invalid(client):
    r = client.post(f"{BASE_URL}/api/auth/google/session", json={"session_id": "INVALID"})
    assert r.status_code in (400, 401)


# --- Posts CRUD ---
def test_create_post_react_save_comment_and_persist(auth_client):
    payload = {"category_id": "visa", "sub_category_id": "tips", "title": "TEST_post", "content": "TEST content", "is_anonymous": False}
    r = auth_client.post(f"{BASE_URL}/api/posts", json=payload)
    assert r.status_code == 200, r.text
    post = r.json()
    pid = post["post_id"]
    assert post["title"] == "TEST_post"
    assert post["author"]["nickname"] == "테스트"

    # GET
    g = auth_client.get(f"{BASE_URL}/api/posts/{pid}")
    assert g.status_code == 200
    assert g.json()["title"] == "TEST_post"

    # React
    rr = auth_client.post(f"{BASE_URL}/api/posts/{pid}/react", json={"reaction_type": "helpful"})
    assert rr.status_code == 200
    assert rr.json()["reactions"]["helpful"] == 1

    # Save (toggle)
    sv = auth_client.post(f"{BASE_URL}/api/posts/{pid}/save")
    assert sv.status_code == 200 and sv.json()["is_saved"] is True

    # Comment
    c = auth_client.post(f"{BASE_URL}/api/posts/{pid}/comments", json={"content": "TEST_comment", "is_anonymous": False})
    assert c.status_code == 200
    lst = auth_client.get(f"{BASE_URL}/api/posts/{pid}/comments")
    assert lst.status_code == 200 and len(lst.json()) >= 1


# --- Petition sign idempotent ---
def test_sign_petition_idempotent(auth_client):
    r = auth_client.post(f"{BASE_URL}/api/petitions/pet_seed_3/sign")
    assert r.status_code == 200
    body = r.json()
    # Either first sign or already_signed
    assert ("signature_count" in body) or body.get("already_signed") is True

    # Second call should be already_signed
    r2 = auth_client.post(f"{BASE_URL}/api/petitions/pet_seed_3/sign")
    assert r2.status_code == 200
    assert r2.json().get("already_signed") is True


# --- Reviews ---
def test_create_and_like_review(auth_client):
    r = auth_client.post(f"{BASE_URL}/api/reviews", json={"category": "restaurant", "place_name": "TEST_place", "rating": 5, "content": "TEST_review", "is_anonymous": False})
    assert r.status_code == 200
    rid = r.json()["review_id"]
    lk = auth_client.post(f"{BASE_URL}/api/reviews/{rid}/like")
    assert lk.status_code == 200
    assert lk.json()["likes"] == 1 and lk.json()["liked"] is True


# --- Chat ---
def test_chat_message_post(auth_client):
    r = auth_client.post(f"{BASE_URL}/api/chat/channels/ch_global/messages", json={"content": "TEST_msg"})
    assert r.status_code == 200
    assert r.json()["content"] == "TEST_msg"
    lst = auth_client.get(f"{BASE_URL}/api/chat/channels/ch_global/messages")
    assert lst.status_code == 200
    assert any(m["content"] == "TEST_msg" for m in lst.json())


# --- Notifications ---
def test_notifications_seed_and_read_all(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/notifications")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 3
    # read-all
    ra = auth_client.post(f"{BASE_URL}/api/notifications/read-all")
    assert ra.status_code == 200
    r2 = auth_client.get(f"{BASE_URL}/api/notifications")
    assert all(n.get("read") is True for n in r2.json())


# --- Translate ---
def test_translate(client):
    r = client.post(f"{BASE_URL}/api/translate", json={"text": "안녕하세요", "target": "en", "source": "ko"})
    assert r.status_code == 200
    t = r.json()["translated"]
    assert isinstance(t, str) and len(t) > 0
