# IMTA - Immigrants Time PRD

## Original Problem Statement
Build "IMTA (이민자 타임 / Immigrants-Time)" — a beautiful, mobile-first, fully interactive community platform for immigrants living in Korea with limited Korean skills. Eleven languages, Emergent Google Auth, MongoDB persistence, comprehensive Life Info directory, board with reactions, petitions, reviews, chat, notifications.

## Architecture
- Frontend: React 19 + React Router v7 + Tailwind + shadcn/ui + sonner + Inter/Noto Sans
- Backend: FastAPI + Motor (async MongoDB) + httpx
- Auth: Emergent-managed Google OAuth (session_token httpOnly cookie, 7-day expiry)
- Translation: MyMemory free API (server-proxied at /api/translate), localStorage cache
- Theme: Teal palette (#2E6B5E primary), mobile-shell (max-width 480px), bilingual KR/EN labels

## User Personas
1. Vietnamese/Chinese/Filipino worker on E-9 visa needing labor/visa info
2. International student needing daily life and Korean learning tips
3. Married immigrant looking for family centers and women's support resources
4. Newly arrived immigrant looking for emergency contacts and translation help

## Core Requirements (Static)
1. 11 languages with full UI translations (KR/EN/VI/ZH/JA/FIL/KM/TH/MN/RU/UZ)
2. Mobile-first, max-width 480px container, 44px+ tap targets, bilingual labels
3. Board: 10 categories with subcategories, 4 reaction types (helpful/trustworthy/unhelpful/untrustworthy)
4. Life Info: 9 categories with ALL real Korean contact data (35+ family centers, 14 support centers, 10 Korean ed centers, etc.)
5. Petitions: 5 pre-loaded with exact signature counts (234125/134425/89432/67218/45891)
6. Reviews: 5 categories, 4 pre-loaded (Sieun 2★, Seohyeon 4★, Seunghwan 1★, 강남성모 5★)
7. Chat lobby: 10 channels (6 default country + 4 user-created)
8. Two FABs on every protected page (green write-post left, blue chat-lobby right)
9. Onboarding modal captures nickname/country/district/occupation before app access
10. Country flag emoji shown next to every author across posts/comments/reviews/chat

## What's Implemented (2026-02 — initial MVP)
- Full Emergent Google Auth flow with session cookie + AuthCallback hash handling
- Onboarding modal (blocking) with 60+ countries, 25 Seoul gu, 6 occupations
- Dashboard with 2x2 tile menu and feature tips
- Board with 10-category accordion, post detail with 4 reactions, save, share, comments
- Life Info directory with all real-world hotline + center data (9 categories)
- Petitions list/detail/create/sign with D-day countdown, progress bar, idempotent signing
- Reviews list/create with 5-star rating, like, translate, search, category tabs
- Chat lobby as slide-up sheet with channel list and per-channel messaging
- Notifications panel with auto-seeded sample notifications + mark all read
- Profile page with 4 activity tabs and edit profile dialog
- Language picker (11 languages) in header + login page with localStorage persistence
- Translation button on posts/petitions/reviews via MyMemory proxy + localStorage cache
- Sample seed data auto-loaded on backend startup (5 posts, 5 petitions, 4 reviews, 20 channels, 6 chat messages)

## 2026-02 follow-up — Anonymous comments + Working translate flow (verified iteration_3)
- Anonymous comments: comment input now has a checkbox "익명으로 작성 / Post anonymously" below the send button. When ON, POST includes `is_anonymous: true`; backend `author_info` already masks user_id="" + nickname="익명" + flag="🕶️". Toggle auto-resets to OFF after submit. New comments render with a `UserRound` lucide icon instead of nationality flag.
- Translate / View Original flow: rebuilt around new `TranslateButton` + `translateBlock` helper. Target language is now derived from `currentUser.country_code` via `COUNTRY_TO_LANG` map (VN→vi, CN→zh, JP→ja, PH→tl, KH→km, TH→th, MN→mn, RU→ru, UZ→uz, NP→ne, MM→my, ID→id, BD→bn, KZ→kk, KR→ko, else→en). Button label includes destination ("이 글 번역하기 (→ Tiếng Việt)"). Spinner during fetch; italic "(번역됨 / Translated)" label above translated content; toggle restores original. localStorage cache key `translation_<id>_<blockKey>_<lang>` under namespace `imta_translation_cache_v1` — repeat translations served from cache without re-hitting MyMemory. Same-language guard toasts `already_same_lang`. On failure (empty/banner from MyMemory) backend returns `""` and frontend toasts `translate_failed` then reverts UI.
- Applied to: post detail, petition detail, review cards, and per-comment translate buttons.
- Backend `/api/translate` proxy: 2000 char limit; banner detection (`INVALID TARGET`, `INVALID SOURCE`, `PLEASE SELECT`, `MYMEMORY WARNING`) returns empty string instead of echoing the error.

## 2026-02 update — P0 critical bug fixes (verified iteration_2)
- Review posting flow: discrete validation toasts (missing category / empty place / content < 50 chars), submit dispatches `imta:reviews-updated` custom event with `detail.category` so the Reviews page switches tab + refreshes automatically. Char counter `0/50` added in modal.
- Notification backend triggers: comment → notify post author + prior commenters (`reply`), petition sign → notify petition creator, chat message → notify channel members. Self-notifications suppressed. ChatLobby now auto-joins on channel open so future messages fan-out to all participants.
- NotificationContext: 30-second `setInterval` polling + `visibilitychange` listener re-fetches on tab focus.
- ChatLobby restructure: 3 sections — Global (everyone), My Country (filtered by `user.country_code`), Interests (everyone) with `+ 채팅방 만들기` button that opens `CreateChannelModal` (30-emoji grid, name + description, validates ≥2 chars, auto-opens the new channel).
- Backend `ChannelCreate` model now accepts `icon`; created channels persist the chosen emoji.
- i18n: 13 new keys added to ko/en (other locales fall back to ko via `tFor`).

## Test Results (iteration_1.json)
- Backend: 15/15 pytest pass (100%)
- Frontend: all 6 protected pages render, FABs visible, language switch verified, onboarding modal verified
- No critical or minor issues

## Prioritized Backlog
P1 — Likes on posts persisted separately from reactions; My Liked Posts page wiring
P1 — Add language-specific full UI sweep validation for non-CJK locales (mn/uz/km/th)
P2 — Real-time chat via WebSocket (currently polling on channel open)
P2 — PWA manifest + service worker for "Add to Home Screen"
P2 — Infinite scroll on board list (currently shows all)
P2 — Back-to-top button after 500px scroll
P3 — Refactor server.py into routers (auth/posts/petitions/reviews/chat)
P3 — Aggregation $lookup for posts list to avoid N+1

## Next Tasks
- Validate UI on small Android (375px) device
- Polish per-language nav labels for less-translated locales
- Add invite/share image for petitions to grow signatures
