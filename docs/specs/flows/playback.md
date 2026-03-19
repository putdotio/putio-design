---
title: "Flow: Video Playback"
created: 2026-03-19
platforms: [tvOS, Android TV, Fire TV]
---

# Video Playback Flow

The most complex and most important flow. Every decision here affects the core experience.

## Happy Path

```
File selected (video)
  └─ Has saved position? (start_from > 0 AND < 95%)
       ├─ Yes → Resume Prompt
       │    ├─ "Continue from 42:17" → Player (seek to 42:17)
       │    └─ "Start from beginning" → Player (seek to 0)
       └─ No → Player (start from 0)

Player
  ├─ Playing (controls hidden after 5s)
  │    ├─ Any D-pad press → Show controls overlay
  │    ├─ D-pad left/right → Skip -10s / +10s
  │    ├─ D-pad left/right (hold) → Fast seek
  │    ├─ Play/pause button → Toggle playback
  │    ├─ Select/OK button → Show controls overlay
  │    └─ Menu/Back → Exit player (save position)
  │
  ├─ Controls Overlay (visible)
  │    ├─ Progress bar (focused) → D-pad left/right to scrub
  │    ├─ Subtitles button → Subtitle Picker
  │    ├─ Audio Track button → Audio Track Picker
  │    ├─ Speed button → Speed Picker
  │    ├─ Info button → toggle file info display
  │    └─ Auto-hide after 5s of no input
  │
  ├─ Subtitle Picker (modal overlay)
  │    ├─ "Off" option
  │    ├─ Embedded tracks (from file)
  │    ├─ External tracks (from API/OpenSubtitles)
  │    ├─ Select → apply immediately, dismiss picker
  │    └─ Back → dismiss picker, return to controls
  │
  ├─ Audio Track Picker (modal overlay)
  │    ├─ List all tracks: "English 5.1 (AC3)", "English 2.0 (AAC)", "Commentary"
  │    ├─ Select → apply immediately, dismiss picker
  │    └─ Back → dismiss picker, return to controls
  │
  ├─ Speed Picker (modal overlay)
  │    ├─ Options: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x, 3x
  │    ├─ Current speed highlighted
  │    ├─ Select → apply immediately, dismiss picker
  │    └─ Back → dismiss picker, return to controls
  │
  └─ End of Playback
       ├─ Auto-save position (mark as completed if >95%)
       ├─ "Up Next" screen (10s countdown)
       │    ├─ Next file in folder (alphabetical)
       │    ├─ "Play" → start next file
       │    ├─ "Cancel" / Back → return to file browser
       │    └─ Countdown expires → auto-play next (if enabled in settings)
       └─ No next file → return to file browser
```

## Position Saving

- Save position to API every 10 seconds during playback
- Also save on: pause, exit, app background, overlay open
- Debounce: don't fire more than once per 10s (avoid excessive API calls — ref UI-1462)
- Position syncs across all devices (start on TV, continue on phone)
- Mark as "completed" when position > 95% of duration → remove from Continue Watching
- On player exit (back button), always save current position

## Subtitle Flow

```
Player → Subtitles button
  └─ Fetch subtitle list (API + embedded)
       ├─ Loading → show spinner in picker
       ├─ Available → show list
       │    ├─ Embedded: from VLC-kit track enumeration
       │    ├─ External: from /files/{id}/subtitles API
       │    ├─ Merged list, grouped by language
       │    └─ Full names shown (no truncation — ref SUP-158)
       └─ None available → show "No subtitles available"

Subtitle selected → apply immediately
  ├─ Remember preference: last selected language stored per-user
  ├─ Next video: auto-select same language if available
  └─ Subtitle offset: ±0.5s increments via setting (ref SUP-155)
```

### Subtitle rendering
- **tvOS**: use native system subtitle style (what Infuse does — users expect it)
- **Android TV**: VLC-kit/libVLC renders subtitles. Respect user font size/color settings.
- **.ass/.ssa support**: VLC-kit handles natively. Render styled subtitles as-is.

## Audio Track Flow

```
Player → Audio button
  └─ Enumerate tracks from VLC-kit/libVLC
       ├─ Show: language, channel layout (5.1/2.0/7.1), codec (AAC/AC3/DTS/TrueHD)
       ├─ Currently active track highlighted
       └─ Select → switch immediately (brief buffer is OK)

HDMI passthrough:
  ├─ DTS-HD, TrueHD, Atmos → pass through HDMI bitstream
  ├─ Fallback: if receiver doesn't support → decode to PCM
  └─ Setting in Settings → Playback → "Audio passthrough" (on/off)
```

## Seek & Scrubbing

| Input | Action |
|-------|--------|
| D-pad left (tap) | Skip back 10s |
| D-pad right (tap) | Skip forward 10s |
| D-pad left (hold) | Fast rewind (accelerating: 2x → 4x → 8x) |
| D-pad right (hold) | Fast forward (accelerating: 2x → 4x → 8x) |
| Siri Remote swipe (tvOS) | Scrub through progress bar |
| Progress bar focused + D-pad | Precise scrub |

### Thumbnail preview (SUP-152)
- If file has I-frames / seek thumbnails: show preview above progress bar during scrub
- VLC-kit supports thumbnail extraction at position
- Fallback: just show timestamp, no thumbnail

## Error Handling During Playback

| Error | Behavior |
|-------|----------|
| Buffering > 10s | Show spinner + "Buffering..." |
| Buffering > 30s | Show "Playback stalled. Check your connection." + Retry/Back buttons |
| Stream URL expired | Auto-retry once (fetch new URL). If fails → "Link expired" + Back button |
| VLC-kit crash | Catch, log to Sentry, show "Playback error" + Back button. Don't crash the app. |
| Codec unsupported (rare with VLC) | "Can't play this format" → suggest web playback |
| Audio track switch fails | Toast "Couldn't switch audio" → stay on current track |
| Subtitle load fails | Toast "Couldn't load subtitles" → continue without subs (non-blocking) |
| Network loss during playback | Buffer runs out → "Connection lost" → Retry/Back. If network returns within buffer window, seamless resume. |

## Focus Behavior

| Context | Focus |
|---------|-------|
| Resume prompt | "Continue from..." button |
| Player (controls hidden) | N/A — full-screen video, any press shows controls |
| Controls overlay | Progress bar |
| Subtitle picker | Currently selected subtitle (or "Off") |
| Audio picker | Currently selected track |
| Speed picker | Current speed |
| Up Next screen | "Play" button |
| Error screen | Retry button (or Back if no retry) |

## Platform-Specific

### tvOS (Siri Remote)
- Swipe on trackpad → scrub
- Click trackpad → play/pause
- Menu button → show/hide controls (first press), exit player (second press)
- Play/Pause button on remote → always play/pause regardless of overlay state

### Android TV / Fire TV (D-pad remote)
- Center button → play/pause when controls hidden, select when controls visible
- Double-tap left/right → 10s skip (ref SUP-191, SUP-61)
- Back button → dismiss overlay first, then exit player (ref UI-1528)
- Media keys (play/pause/stop/ffwd/rew) → map directly to player actions
