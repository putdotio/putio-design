---
title: "Flow: Settings"
created: 2026-03-19
platforms: [tvOS, Android TV, Fire TV]
---

# Settings Flow

## Structure

```
Home → Account
  └─ Account Screen
       ├─ Header: avatar + username + disk usage bar + Sign Out button
       │
       ├─ Section: Playback Settings
       │    ├─ Tunnel Route → Route Picker (list of routes)
       │    ├─ Remember playback position (toggle)
       │    ├─ Show subtitles (toggle)
       │    ├─ Don't auto-select subtitles (toggle, visible only if show subtitles = on)
       │    ├─ Subtitle offset → ±0.5s increment picker
       │    ├─ Subtitle appearance → size (S/M/L), background (on/off)
       │    ├─ Audio passthrough (toggle) — HDMI bitstream for HD codecs
       │    ├─ Auto-play next file (toggle)
       │    └─ Default playback speed → speed picker
       │
       ├─ Section: Storage
       │    ├─ Disk usage: used / total with progress bar
       │    └─ (Future: storage breakdown by type)
       │
       ├─ Section: Security
       │    ├─ App Lock → PIN setup / change / disable
       │    └─ (Future: per-folder PIN)
       │
       ├─ Section: App Info
       │    ├─ App version + build number
       │    ├─ Device model + OS version
       │    ├─ VLC-kit/libVLC version
       │    ├─ Diagnostics → Diagnostics screen
       │    ├─ Open source licenses
       │    └─ "Manage account at put.io" + QR code
       │
       └─ Section: Accounts (multi-account)
            ├─ Current account (highlighted)
            ├─ Other accounts (switch)
            ├─ Add account → Auth flow
            └─ Remove account → confirm → delete token
```

## Setting Changes

All settings changes are **immediate** — no "Save" button. Toggle = instant apply. Picker selection = instant apply.

| Setting | Storage | Sync |
|---------|---------|------|
| Tunnel route | API (`/settings`) | Synced across devices |
| Remember position | API (`use_start_from`) | Synced |
| Show subtitles | API (`hide_subtitles`) | Synced |
| Don't auto-select subtitles | API (`dont_autoselect_subtitles`) | Synced |
| Subtitle offset | Local storage | Per-device |
| Subtitle appearance | Local storage | Per-device |
| Audio passthrough | Local storage | Per-device |
| Auto-play next | Local storage | Per-device |
| Default playback speed | Local storage | Per-device |
| App Lock PIN | Platform keychain | Per-device |

## Tunnel Route Picker

```
Settings → Tunnel Route
  └─ List of available routes (from API)
       ├─ Each row: route display name (e.g., "Amsterdam", "London")
       ├─ Current route: checkmark icon
       ├─ Select → API call → immediate effect
       └─ Back → return to settings
```

## Diagnostics Flow

```
Settings → Diagnostics
  └─ Diagnostics Screen
       ├─ Connection Test → ping API, show latency (ms)
       ├─ Playback Test → play known test file
       │    ├─ Success: show codec info, resolution, bitrate
       │    └─ Failure: show error details
       ├─ Device Info: model, OS, app version, VLC version
       ├─ Network Info: connection type, IP, CDN endpoint
       └─ "Copy All" → clipboard (for support tickets)
```

## Focus Behavior

- Enter settings: focus first item in Playback Settings
- After toggle change: stay focused on same item
- After picker selection: return focus to the setting row
- Sign Out: confirmation dialog → "Yes" focused
- Back: return to Home, focus "Account" row

## Edge Cases

- **API failure on setting change** — show toast "Couldn't save setting", revert toggle to previous state
- **Tunnel route change during playback** — doesn't affect current stream. New route applies to next playback.
- **Sign out with app lock enabled** — clear PIN along with token
- **Disk usage near 100%** — progress bar turns red, show warning text
