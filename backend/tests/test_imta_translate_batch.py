"""IMTA batch translate (||| separator) regression tests for iter 4."""
import os
import pytest
import requests

BASE_URL = (os.environ.get("BACKEND_URL") or "https://korea-migrants.preview.emergentagent.com").rstrip("/")
SESSION_TOKEN = "test_session_1779718769701"


@pytest.fixture(scope="session")
def auth():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {SESSION_TOKEN}"})
    return s


# ---- Batch translate with ||| separator ----
def test_batch_translate_ko_to_vi_preserves_separator(auth):
    joined = "안녕하세요 ||| 감사합니다 ||| 좋은 하루 보내세요"
    r = auth.post(f"{BASE_URL}/api/translate", json={"text": joined, "target": "vi", "source": "ko"})
    assert r.status_code == 200, r.text
    d = r.json()
    out = (d.get("translated") or "").strip()
    assert out, "expected non-empty translation"
    # Frontend uses /\s*\|\|\|\s*/ to split
    import re
    parts = re.split(r"\s*\|\|\|\s*", out)
    assert len(parts) == 3, f"expected 3 parts, got {len(parts)}: {out!r}"
    for p in parts:
        assert p.strip(), f"empty part in {parts!r}"


def test_batch_translate_ko_to_ja_preserves_separator(auth):
    joined = "안녕하세요 ||| 감사합니다 ||| 좋은 하루 보내세요"
    r = auth.post(f"{BASE_URL}/api/translate", json={"text": joined, "target": "ja", "source": "ko"})
    assert r.status_code == 200, r.text
    out = (r.json().get("translated") or "").strip()
    assert out
    import re
    parts = re.split(r"\s*\|\|\|\s*", out)
    assert len(parts) == 3, f"split mismatch: {out!r}"


def test_user_country_code_is_vn(auth):
    """Ensure test user is VN so frontend auto-translate runs."""
    r = auth.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200, r.text
    u = r.json()
    assert u.get("country_code") == "VN", f"expected VN, got {u.get('country_code')}"


def test_posts_list_returns_seed(auth):
    r = auth.get(f"{BASE_URL}/api/posts")
    assert r.status_code == 200
    posts = r.json()
    assert any(p.get("post_id") == "post_seed_1" for p in posts)


def test_petitions_list_returns_seed(auth):
    r = auth.get(f"{BASE_URL}/api/petitions")
    assert r.status_code == 200
    pets = r.json()
    assert any(p.get("petition_id") == "pet_seed_1" for p in pets)


def test_post_seed_1_has_comments(auth):
    r = auth.get(f"{BASE_URL}/api/posts/post_seed_1/comments")
    assert r.status_code == 200
    comments = r.json()
    assert isinstance(comments, list)
    assert len(comments) >= 1
