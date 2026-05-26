"""IMTA translate proxy + anonymous comment regression tests."""
import os
import uuid
import pytest
import requests

BASE_URL = (os.environ.get("BACKEND_URL") or "https://korea-migrants.preview.emergentagent.com").rstrip("/")
SESSION_TOKEN = "test_session_1779718769701"  # 테스트 user, country_code=VN


@pytest.fixture(scope="session")
def auth():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {SESSION_TOKEN}"})
    return s


# ---- Anonymous comment (P0) ----
def test_anonymous_comment_returns_masked_author(auth):
    post_id = "post_seed_1"
    r = auth.post(
        f"{BASE_URL}/api/posts/{post_id}/comments",
        json={"content": f"TEST anon {uuid.uuid4().hex[:6]}", "is_anonymous": True},
    )
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["is_anonymous"] is True
    assert d["author"]["nickname"] == "익명"
    assert d["author"]["country_flag"] == "🕶️"
    # Real user_id must be masked
    assert d["author"]["user_id"] == ""


def test_non_anonymous_comment_returns_real_author(auth):
    post_id = "post_seed_1"
    r = auth.post(
        f"{BASE_URL}/api/posts/{post_id}/comments",
        json={"content": f"TEST real {uuid.uuid4().hex[:6]}", "is_anonymous": False},
    )
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["is_anonymous"] is False
    assert d["author"]["nickname"] == "테스트"
    assert d["author"]["country_flag"] == "🇻🇳"


def test_anonymous_comment_persists_in_list(auth):
    post_id = "post_seed_1"
    unique = f"TEST anon persist {uuid.uuid4().hex[:8]}"
    r = auth.post(
        f"{BASE_URL}/api/posts/{post_id}/comments",
        json={"content": unique, "is_anonymous": True},
    )
    assert r.status_code == 200
    g = auth.get(f"{BASE_URL}/api/posts/{post_id}/comments")
    assert g.status_code == 200
    matches = [c for c in g.json() if c.get("content") == unique]
    assert len(matches) == 1
    c = matches[0]
    assert c["is_anonymous"] is True
    assert c["author"]["nickname"] == "익명"
    assert c["author"]["country_flag"] == "🕶️"


# ---- Translate proxy (P0) ----
def test_translate_ko_to_vi(auth):
    r = auth.post(f"{BASE_URL}/api/translate", json={"text": "안녕하세요", "target": "vi", "source": "ko"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert "translated" in d
    assert isinstance(d["translated"], str)
    assert len(d["translated"].strip()) > 0
    # MyMemory typically returns "Xin chào" for 안녕하세요 — but we don't pin exact string.
    assert d["translated"].strip() != ""


def test_translate_ko_to_zh(auth):
    r = auth.post(f"{BASE_URL}/api/translate", json={"text": "안녕하세요", "target": "zh", "source": "ko"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert len(d["translated"].strip()) > 0


def test_translate_ko_to_ja(auth):
    r = auth.post(f"{BASE_URL}/api/translate", json={"text": "안녕하세요", "target": "ja", "source": "ko"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert len(d["translated"].strip()) > 0


def test_translate_empty_text(auth):
    r = auth.post(f"{BASE_URL}/api/translate", json={"text": "   ", "target": "vi", "source": "ko"})
    assert r.status_code == 200
    assert r.json()["translated"] == ""


def test_translate_handles_long_text_2000_char_cap(auth):
    """Backend was bumped to 2000 char limit (from 500)."""
    long_text = "안녕하세요 " * 200  # ~1400 chars
    r = auth.post(f"{BASE_URL}/api/translate", json={"text": long_text, "target": "vi", "source": "ko"})
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d.get("translated"), str)
    assert len(d["translated"]) > 0
