---
title: "Flow: Video Conversion"
created: 2026-03-19
platforms: [web, tv-web]
note: Native apps with VLC-kit skip this entirely. This flow only applies to web and web-based TV apps that depend on HLS.
---

# Video Conversion Flow

## Context

put.io's server-side conversion generates HLS streams from uploaded files. This is required for:
- **Web app** — browser `<video>` can't play MKV/x265/DTS natively
- **TV-web** (Tizen, LG, Vizio) — same browser limitation

**Native apps (iOS, tvOS, Android, Android TV) skip this flow entirely** thanks to VLC-kit/libVLC.

## Conversion States

```
File uploaded / transfer completed
  └─ file.need_convert?
       ├─ false → CONVERSION_NOT_NEEDED → Play immediately (MP4/HLS direct)
       └─ true → Check conversion status
            ├─ NOT_AVAILABLE → "Can't convert this file" → offer download instead
            ├─ IN_QUEUE → "Waiting to convert..." (position in queue if available)
            ├─ CONVERTING → "Converting... X%" (progress bar)
            ├─ COMPLETED → Play (HLS ready)
            └─ ERROR → "Conversion failed" → Retry button → re-trigger conversion
```

## States

| State | UI | Actions |
|-------|-----|---------|
| `CONVERSION_NOT_NEEDED` | Hidden — go straight to player | — |
| `NOT_AVAILABLE` | "This file can't be converted" | "Download original" button |
| `IN_QUEUE` | Poster + "Waiting to convert..." + spinner | Cancel button, position indicator |
| `CONVERTING` | Poster + progress bar + percentage | Cancel button |
| `COMPLETED` | Hidden — go straight to player | — |
| `ERROR` | Poster + "Conversion failed" | Retry button, Back button |

## Polling

- Poll `GET /files/{id}/mp4` every 5 seconds while `IN_QUEUE` or `CONVERTING`
- Stop polling on: `COMPLETED`, `ERROR`, `NOT_AVAILABLE`, user navigates away
- On `COMPLETED` → auto-transition to player (don't make user press play again)

## Conversion Screen UI

```
┌──────────────────────────────────────────┐
│                                          │
│         [File poster/screenshot]         │
│                                          │
│          "The Wire · S03E04"             │
│                                          │
│     ████████████░░░░░░░░░░  63%          │
│                                          │
│        Converting your file...           │
│                                          │
│           [ Cancel ]                     │
│                                          │
└──────────────────────────────────────────┘
```

## Edge Cases

- **User navigates away during conversion** — conversion continues server-side. On return, check status and resume from current state.
- **Conversion takes very long (>30min)** — show estimated time if API provides it. Otherwise just spinner + percentage.
- **File is both convertible and directly playable** — prefer direct play (MP4 stream). Only show conversion flow for HLS if MP4 isn't available.
- **Multiple files need conversion** — each file independent. No batch conversion UI on TV.
- **Network drop during polling** — show "Can't check conversion status" with retry. Don't assume conversion failed.

## Native App Behavior

On native apps (VLC-kit/libVLC), the `withConversionStatus` wrapper is removed entirely:

```
File selected → Player (immediate)
```

No conversion check, no waiting, no progress screen. The `need_convert` field is ignored. VLC plays the original file directly.

**Fallback:** If VLC-kit fails to play a file (extremely rare):
1. Log error to Sentry
2. Show "Can't play this file" 
3. Offer: "Try on web at put.io" (show QR code to the file's web URL)
4. Do NOT fall back to conversion flow on native — it defeats the purpose

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /files/{id}/mp4` | Check conversion status |
| `POST /files/{id}/mp4` | Trigger conversion |
| `DELETE /files/{id}/mp4` | Cancel conversion |
