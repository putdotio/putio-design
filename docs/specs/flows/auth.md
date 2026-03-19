---
title: "Flow: Authentication"
created: 2026-03-19
platforms: [tvOS, Android TV, Fire TV]
---

# Auth Flow

## Happy Path

```
App Launch
  ├─ Has valid token? → Home Screen
  └─ No token → Auth Screen
       ├─ Display device code + QR code
       │    ├─ Code: large, high-contrast, 6 chars
       │    └─ QR: links to put.io/link?code=XXXXXX
       ├─ Poll API every 5s for token
       │    ├─ Token received → Store in keychain → Home Screen
       │    └─ 10min timeout → "Code expired" → Retry button → new code
       └─ Alternative: "Enter token manually" (hidden, for debugging)
```

## States

| State | Screen | Focus | Transition |
|-------|--------|-------|------------|
| `no_token` | Auth screen with code + QR | Retry button (initially hidden) | Auto-transitions on token |
| `polling` | Same screen, "Waiting..." spinner | No interactive focus needed | 5s interval API poll |
| `timeout` | Same screen, "Code expired" | Retry button (focused) | Press → new code → polling |
| `error` | Auth screen with error message | Retry button (focused) | Press → new code → polling |
| `authenticated` | Home screen | First row, first item | Fade transition |

## Edge Cases

- **Network drops during polling** — show inline "No connection" below code, keep polling. Don't navigate away.
- **Token revoked after auth** — API returns 401 on any request → clear token → back to Auth screen with "Session expired" message.
- **Multiple TVs same account** — each TV gets its own device code, same account token. No conflict.
- **App backgrounded during polling** — resume polling on foreground. Don't reset code unless 10min elapsed.

## Multi-Account (SUP-179)

- After auth, store token with account label (username)
- Settings → Accounts → list of authenticated accounts
- "Add account" → new device code flow
- "Switch account" → select from list → reload Home with new token
- "Remove account" → confirm → delete token from keychain
- Active account indicator in Settings header

## Focus Behavior

- On auth screen: nothing focusable until timeout (code is display-only)
- On timeout: Retry button auto-focused
- On transition to Home: first item in Continue Watching (or Your Files if empty)
