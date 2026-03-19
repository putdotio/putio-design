---
title: "Flow: Error Recovery"
created: 2026-03-19
platforms: [tvOS, Android TV, Fire TV]
---

# Error Recovery Flow

Every error has a defined recovery path. The user should never be stuck.

## Error → Recovery Matrix

| Error | Where it happens | What user sees | Recovery action | Where user ends up |
|-------|-----------------|----------------|-----------------|-------------------|
| **No network** | Any screen | "Can't connect to put.io" | Retry button | Same screen (retry request) |
| **Network drops mid-browse** | File browser | "Connection lost" + loaded items still visible | Retry button (load more) | Same folder, same scroll position |
| **Network drops mid-playback** | Player | Buffer depletes → "Connection lost" | Retry / Back | Retry = resume playback. Back = file browser. |
| **401 Unauthorized** | Any API call | "Session expired" | Auto-redirect | Auth screen (clear token) |
| **401 during playback** | Player | Playback stops | Save position → Auth screen | Auth → Home (don't restore player) |
| **404 File not found** | File action / playback | "File not found" | Toast + stay | Current screen, refresh list |
| **404 Folder** | File browser | "Folder not found" | Auto-navigate | Parent folder |
| **429 Rate limit** | Any API call | "Too many requests" | Auto-retry after delay | Same screen (transparent to user if retry succeeds) |
| **429 persistent** | Multiple calls | "Slow down. Try again in a moment." | Manual retry button | Same screen |
| **5xx Server error** | Any API call | "Something went wrong on our end" | Retry button | Same screen |
| **VLC-kit playback failure** | Player | "Can't play this file" | "Try on web" (QR) / Back | QR screen or file browser |
| **Subtitle load failure** | Player (subtitle fetch) | Toast: "Couldn't load subtitles" | None (non-blocking) | Player continues without subs |
| **Audio track switch failure** | Player (track switch) | Toast: "Couldn't switch audio" | None (non-blocking) | Player continues with current track |
| **Conversion failure** | Conversion screen (web only) | "Conversion failed" | Retry / Back | Retry = re-trigger. Back = file browser. |
| **Stream URL expired** | Player | Brief stall | Auto-retry (fetch new URL) | Player resumes (transparent) |
| **Stream URL expired (retry fails)** | Player | "Playback link expired" | Back button | File browser |
| **Timeout (10s)** | Any API call | "Request timed out" | Retry button | Same screen |
| **Buffering timeout (30s)** | Player | "Playback stalled" | Retry / Back / Change route | Player retry or file browser |
| **Unknown error** | Anywhere | "Something unexpected happened. Error ID: [id]" | Retry / Back | Same screen |
| **App crash recovery** | App relaunch | Normal launch | None | Home screen (state restored from API) |

## Recovery Principles

1. **Never leave the user stuck** — every error screen has at least one actionable button (Retry or Back)
2. **Non-blocking errors are toasts** — subtitle/audio failures don't interrupt playback
3. **Blocking errors are full-screen** — network loss, auth expiry, server errors replace content
4. **Auto-retry before showing error** — rate limits and expired URLs get one silent retry
5. **Preserve context when possible** — after retry success, user is exactly where they were
6. **Auth errors are nuclear** — clear token, go to auth screen. Don't try to be clever.
7. **Save playback position on every error** — user never loses their place
8. **Include error ID for unknowns** — Sentry trace ID in the message so support can look it up
9. **Degrade gracefully** — network drop during browse shows stale data + error banner, not empty screen

## Offline / Degraded Network

```
Network drops
  ├─ Currently on Home → show banner "No connection" above rows
  │    └─ Continue Watching / Recent: show cached data (stale but visible)
  │
  ├─ Currently in File Browser → show banner + keep loaded items
  │    └─ Load more / refresh: show error inline at bottom
  │
  ├─ Currently in Player → buffer depletes
  │    └─ Show "Connection lost" overlay after buffer runs out
  │    └─ Auto-retry every 5s silently
  │    └─ If network returns within buffer: seamless resume
  │
  └─ Currently in Settings → show banner
       └─ Setting changes queued locally, synced when online (toggle stays visual)

Network returns
  └─ Banner dismisses automatically
  └─ Pending requests retry automatically
  └─ No user action needed
```

## Toast vs Full-Screen Error Decision

```
Is the user's primary task blocked?
  ├─ Yes → Full-screen error (Retry/Back buttons)
  │    Examples: can't load files, can't authenticate, playback failed
  └─ No → Toast notification (auto-dismiss after 5s)
       Examples: subtitle load failed, audio switch failed, setting save failed
```
