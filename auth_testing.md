# Auth Testing Playbook (Emergent Google Auth)

## Quick Setup
1. Frontend redirects to `https://auth.emergentagent.com/?redirect=<window.location.origin>/dashboard`
2. After Google login, lands at `/dashboard#session_id=...`
3. AuthCallback exchanges session_id -> session_token via backend `/api/auth/google/session`
4. Backend stores session in `user_sessions` collection, sets httpOnly cookie
5. ProtectedRoute calls `/api/auth/me` (sends cookie) to verify

## Create Test User & Session (mongosh)
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@imta.kr',
  name: 'Test User',
  nickname: '테스트',
  country_code: 'VN',
  country_name: 'Vietnam',
  country_flag: '🇻🇳',
  district: '강남구',
  occupation: 'student',
  onboarded: true,
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
"
```

## Test Endpoints
```bash
curl -X GET "$BACKEND_URL/api/auth/me" -H "Cookie: session_token=YOUR_TOKEN"
curl -X GET "$BACKEND_URL/api/posts"
```

## Browser Testing
```python
await page.context.add_cookies([{
    "name": "session_token", "value": "YOUR_TOKEN",
    "domain": "your-app.com", "path": "/",
    "httpOnly": True, "secure": True, "sameSite": "None"
}])
```
