---
title: "put.io TV App — Feature Spec"
created: 2026-03-19
status: draft
platforms: [tvOS, Android TV, Fire TV]
player: VLC-kit (tvOS) / libVLC (Android TV)
---

# put.io TV App — Feature Spec

Covers tvOS (SwiftUI + VLC-kit) and Android TV (Compose + libVLC). Both implement the same spec using platform-native patterns.

No conversion flow. No HLS dependency. Play anything natively.

---

## Auth

- Device code pairing: show code on TV → user enters at `put.io/link`
- QR code option: scan with phone camera → auto-authenticates
- Token persisted in platform keychain (iOS Keychain / Android EncryptedSharedPreferences)
- Auto-login on next launch if token is valid
- Token refresh handled by SDK
- Logout available from Settings

### TV-specific considerations
- No keyboard input for email/password — code pairing only
- Code should be large, high-contrast, easy to read from couch distance
- Show "waiting for authentication..." with a spinner after code is displayed
- Timeout after 10 minutes, show "try again"

---

## Home Screen

The landing screen after auth. Optimized for "continue where you left off."

### Rows
1. **Continue Watching** — last 10-20 played files with progress indicator
2. **Recent Files** — last 20 files added to account
3. **Pinned Folders** — user-selected favorite folders (future, if API supports)

### Behavior
- Focus starts on Continue Watching, first item
- Empty state: "Nothing here yet. Add files at put.io" with QR code to web app
- Rows scroll horizontally, screen scrolls vertically between rows
- Each item shows: filename (parsed), file type icon, progress bar (if applicable)

---

## File Browser

The core navigation experience. Folders → files → actions.

### Navigation
- Root shows top-level files/folders
- Enter folder → show contents with breadcrumb
- Back button → parent folder
- Breadcrumb shown as "Files > Movies > 2026" in top bar

### List View
- List only — no grid. TV is a list device (see design decisions)
- Each row: file type icon, parsed filename, size, date added
- Filename parsing: `The.Wire.S03E04.1080p.BluRay.x264-DEMAND.mkv` → "The Wire · S03E04" with quality/source badges
- Folders show item count
- Video files show duration if available

### Sort
- Options: name (A-Z, Z-A), date added (newest, oldest), size (largest, smallest)
- Sort preference persisted per folder (local storage)
- Global default in Settings, per-folder override

### Actions (long-press / menu button)
- Play (video/audio files)
- Info (size, format, codec, date added)
- Delete / move to trash
- (Future) Add to favorites / pin folder

---

## Search

### Interface
- Search entry from Home screen and File Browser (top bar)
- Platform-native keyboard:
  - tvOS: Siri dictation + on-screen keyboard
  - Android TV: voice search + D-pad grid keyboard
- Results displayed as file list (same component as File Browser)

### History
- Last 10 searches stored locally
- Shown as suggestions when search is opened
- "Clear search history" option
- Individual search deletable (swipe on tvOS, long-press on Android TV)

---

## Video Player

The most important screen. VLC-kit/libVLC means every format plays natively.

### Playback
- Plays MKV, MP4, AVI, WMV, x264, x265, HEVC — anything VLC supports
- No conversion wait. No "converting..." screen. Instant playback.
- Resume from last position (timestamp stored via API, synced across devices)
- Seek: D-pad left/right for 10s skip, hold for fast seek
- Progress bar with thumbnail preview (if available)
- Playback speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x

### Subtitle Selection
- Auto-detect embedded subtitles from file
- Fetch external subtitles from put.io API (OpenSubtitles integration)
- Subtitle picker overlay: language + source (embedded/external)
- Remember last subtitle preference per language
- Subtitle appearance: size, color, background (configurable in Settings)

### Audio Track Selection
- List all audio tracks from file (e.g., English 5.1, English 2.0, Commentary)
- Show codec info (AAC, AC3, DTS, DTS-HD, TrueHD)
- HDMI audio passthrough for HD audio codecs (DTS-HD, TrueHD, Atmos)
- Remember last audio track preference

### Player UI (overlay)
- Title bar: parsed filename, resolution, codec
- Bottom bar: progress, current time / total time, playback speed indicator
- Auto-hide after 5 seconds of no input
- Show on any D-pad press

### End of Playback
- "Up Next" — next file in same folder (alphabetical/name order)
- Auto-play next after 10s countdown (configurable, off by default)
- Option to go back to file list

---

## Audio Player

For music, podcasts, audiobooks.

### Playback
- Background playback continues when navigating away
- Now Playing bar at bottom of all screens (mini player)
- Full-screen audio player: album art (if available), put.io logo fallback
- Same seek/skip controls as video
- Playback speed: same options as video

### Platform Integration
- tvOS: Now Playing info on Apple TV home screen
- Android TV: media session for system media controls

---

## Continue Watching

### Data
- Stored server-side via API (file ID + timestamp)
- Synced across all devices — start on TV, continue on phone
- Only video/audio files with progress > 0% and < 95%
- Files at > 95% considered "completed" and removed from list

### UI
- Horizontal row on Home screen
- Each item: thumbnail/poster (file screenshot from API), filename, progress bar
- Select → resume playback from stored position

---

## History

### Data
- Full play history from API
- Sorted by last played (newest first)

### UI
- Vertical scrollable list
- Each row: filename, last played date, duration watched
- Select → play from beginning (not resume — that's Continue Watching)
- "Clear all history" in list header or Settings

---

## Trash

- List of deleted files (from API)
- Each row: filename, date deleted, size
- Actions: restore, delete permanently
- "Empty trash" option with confirmation dialog
- Empty state: "Trash is empty" with checkmark

---

## Favorites / Pinned Folders

- Star/pin folders for quick access (SUP-34)
- Pinned folders appear as a row on Home screen
- Toggle favorite: long-press → "Add to Favorites" / "Remove from Favorites"
- Synced via API — pin on phone, see on TV
- Limit: 10 pinned folders (UI constraint, not API)
- Great for: "Movies", "TV Shows", "Music" — the folders users navigate to 90% of the time

---

## Diagnostics

- Available from Settings → About → Diagnostics
- **Connection test**: ping API, show latency
- **Playback test**: play a known test file, report success/failure + codec info
- **Device info**: model, OS version, app version, VLC-kit/libVLC version
- **Copy to clipboard**: one-tap copy all diagnostic info for support tickets
- **Network info**: connection type, IP, CDN endpoint

---

## Settings

### Sections

**Account**
- Username, email
- Plan name + storage used / total
- "Manage account at put.io" with QR code

**Playback**
- Default subtitle language (from list of available)
- Default audio track preference (original / specific language)
- Playback speed default
- Auto-play next file: on/off
- Subtitle appearance: size (small/medium/large), background (on/off)

**Storage**
- Sort default (global)
- (Future) Default view preferences

**About**
- App version, build number
- Device info (for support)
- Diagnostics: test API connection, test playback
- Open source licenses

**Account Actions**
- Logout (with confirmation)

---

## Tunnel / Route Selection

put.io routes traffic through different geographic endpoints. Users pick which route to use (affects download speeds and content availability).

- Available from Settings → Tunnel Route
- List of available routes from API
- Current route highlighted with checkmark
- Select → immediately apply, no restart needed
- Show route display name (e.g., "Amsterdam", "London", "New York")

---

## Resume Playback Prompt

When opening a file with saved progress, show a pre-player overlay:

- File poster/screenshot as background
- Progress bar showing watched portion (yellow) vs remaining (white)
- Two buttons:
  - **"Continue playing from [timestamp]"** (focused by default)
  - **"Start from the beginning"**
- Selecting either dismisses overlay and starts playback
- If no saved progress, skip straight to player

This is a critical UX pattern — the current app has it and it's good. Keep it.

---

## Error States & Loading

Every screen needs defined error and empty states:

| Screen | Empty state | Error state |
|--------|-------------|-------------|
| Home | "Welcome! Add files at put.io" + QR | Retry button + error message |
| Files (folder) | "This folder is empty" | Retry button |
| Search | "Search your files" (before query) / "No results" (after) | Retry button |
| History | "No playback history yet" | Retry button |
| Trash | "Trash is empty ✓" | Retry button |
| Continue Watching | Row hidden (not shown on home) | Row hidden |

### Loading patterns
- Initial app load: splash screen with put.io logo
- Screen transitions: fade animation (not push)
- Data loading: activity indicator centered on screen
- Pull-to-refresh: not applicable on TV (use explicit "Refresh" button in file actions)
- Video buffering: activity indicator over black background

### Error Handling Architecture

Errors are never shown raw. Every error goes through a localization chain that maps it to a user-friendly message + recovery suggestion.

**Error localizer chain** (ordered by priority):
1. **Network error** — "Can't connect to put.io. Check your internet connection." → Recovery: "Make sure your TV is connected to Wi-Fi"
2. **Auth error (401)** — "Session expired" → Recovery: "Please sign in again"
3. **Rate limit (429)** — "Too many requests" → Recovery: "Please try again in a moment" + include rate limit ID for support
4. **Timeout** — "Request timed out" → Recovery: "Check your connection and try again"
5. **Not found (404)** — "File not found" → Recovery: "This file may have been deleted"
6. **File not reachable** — "Can't reach this file right now" → Recovery: "Try a different tunnel route in Settings"
7. **Server error (5xx)** — "Something went wrong on our end" → Recovery: "Try again in a few minutes. If this persists, contact support@put.io"
8. **Known API error (catch-all)** — Logs to Sentry, shows trace ID → Recovery: "Contact support@put.io with this ID: [trace_id]"
9. **Unknown error (catch-all)** — Logs to Sentry, shows error ID → Recovery: "Something unexpected happened. Error ID: [error_id]"

**Error UI components:**

```yaml
ErrorState:
  props:
    message: string        # "Can't connect to put.io"
    recovery:
      type: instruction | action | none
      description: string  # "Check your internet connection"
      action: retry | settings | auth | none
  layout:
    - Warning icon (⚠️ styled, not emoji)
    - Message text (heading weight)
    - Recovery description (body weight, muted color)
    - Action button if applicable ("Try Again", "Go to Settings", "Sign In")
  platform notes:
    tv: action button gets focus automatically
```

**Error boundary:**
- Wraps every screen at the navigator level
- Catches unhandled React errors
- Renders ErrorState with localized error
- Logs to Sentry with full context

**Player-specific errors:**
| Error | Message | Recovery |
|-------|---------|----------|
| VLC codec unsupported | "Can't play this file format" | "Try playing on web at put.io" |
| Stream URL expired | "Playback link expired" | "Go back and try again" (auto-retry once) |
| No audio tracks | "No audio found in this file" | "This file may be corrupted" |
| Subtitle load failed | "Couldn't load subtitles" | Continue playback without subs (non-blocking) |
| Buffering timeout (30s) | "Playback stalled" | "Check your connection. Try a different tunnel route." |

**Principles:**
- Never show raw error codes, stack traces, or API responses
- Every error has a recovery suggestion — never leave the user stuck
- Include Sentry trace/error ID for unknown errors so support can look them up
- Subtitle/non-critical errors are toasts, not full-screen blockers
- Player errors offer "go back" as escape hatch, never trap user in error state

---

## Remote Config & Feature Flags

The current app uses remote config for:
- Buffer settings (per-platform tuning)
- Playback type preference (HLS vs MP4 — becomes irrelevant with VLC-kit for most cases)
- Feature flags (enable/disable features server-side)

Keep this pattern. Useful for:
- Gradual VLC-kit rollout (fall back to HLS if VLC-kit crashes)
- A/B testing home screen layouts
- Disabling features during incidents

---

## Sentry / Error Reporting

- Crash reporting via Sentry (current app already has this)
- Set user context on login (user_id, username)
- Set config context (remote config, user config)
- Breadcrumbs for: navigation events, playback start/stop/error, API errors

---

## Update Notifier

- Check for app updates on launch
- If update available, show modal: "A new version is available. Update now?"
- "Update" button → open platform app store
- "Later" button → dismiss, don't ask again for 24h
- Force update option for critical releases (remote config flag)

---

## Design References

HTML prototypes exist for all TV screens in `prototypes/`:

### tvOS
- `tvos-home-v1.html` through `tvos-home-v11-scandi.html` (9 variants)
- `tvos-files-native.html`, `tvos-files-v2.html`, `tvos-files-tvos26.html`
- `tvos-player-v2-clean.html`, `tvos-player-tvos26.html`
- `tvos-search-v2-clean.html`
- `tvos-settings-v2-clean.html`

### Android TV
- `androidtv-home-v1.html`, `androidtv-home-native.html`, `androidtv-home-googletv.html`
- `androidtv-files-v2-clean.html`, `androidtv-files-googletv.html`
- `androidtv-player-v2-clean.html`
- `androidtv-search-v2-clean.html`
- `androidtv-browse-native.html`

### Roku (deferred)
- `roku-files.html` + 3 variants

Review these prototypes to inform final design direction. The `*-native.html` and `*-tvos26.html` variants follow platform conventions most closely.

---

## Platform-Specific Notes

### tvOS (SwiftUI + VLC-kit)
- Use `FocusState` for navigation
- Top shelf extension: Continue Watching items
- Siri integration: "Play [filename] on put.io"
- Siri Remote: swipe for seek, click for play/pause, menu for back
- MobileVLCKit for playback

### Android TV (Compose + libVLC)
- Use Leanback Compose components where appropriate
- D-pad focus management via `FocusRequester`
- Voice search integration via Android TV search provider
- Home screen channels: Continue Watching as a channel
- libVLC-android for playback
- Also covers Fire TV (same APK, test with Fire TV remote)

### Back Button Behavior (all platforms)

Precise back button / menu button behavior (ref: UI-1528):

```
Player overlay visible → dismiss overlay (stay in player)
Player (no overlay)    → exit player → return to file list
Search results         → back to search input
Search input           → back to previous screen
File browser (subfolder) → parent folder
File browser (root)    → home screen
Home screen            → system (exit app / app switcher)
Any modal/dialog       → dismiss modal first
```

Fire TV specifically: back button must dismiss playback menu/overlay before exiting player. Never skip straight out.

### Voice Search

- tvOS: Siri — "Play [filename] on put.io", "Search put.io for [query]"
- Android TV: Google Assistant — same intents
- Fire TV: Alexa — same intents
- Implementation: register as a search provider, respond to system search intents with file results

---

## Pagination

All list endpoints use cursor-based pagination. Never load everything at once.

### Pattern
```
Request:  GET /files/list?parent_id=0&per_page=50
Response: { files: [...], cursor: "abc123" }

Next page: GET /files/list?parent_id=0&per_page=50&cursor=abc123
Last page: { files: [...], cursor: null }
```

### Implementation
- **Infinite scroll** on all list screens (files, search results, history, trash)
- Load first page on screen mount
- Load next page when user scrolls within 5 items of the bottom
- Show inline loading indicator at bottom of list while fetching next page
- Keep all loaded pages in memory (append, don't replace)
- `per_page` default: 50 (tunable via remote config)
- On error loading next page: show inline "Load more" retry button at bottom, don't break existing list

### Platform notes
- tvOS: `List` with `.onAppear` on a sentinel item near the bottom triggers next page
- Android TV: `LazyColumn` with `LazyListState` monitoring last visible index
- Both: D-pad scrolling should feel smooth — prefetch aggressively

### Virtualized List Rendering

TV hardware is weak. Lists must be virtualized — only render what's on screen + a small buffer.

**Requirements:**
- Only mount visible items + 5 items above/below viewport (overscan buffer)
- Recycle item views — don't create/destroy on scroll
- Estimated item height must be consistent (no layout jumps)
- Maintain scroll position when new pages append
- Focus management must survive recycling — focused item stays focused after rerender

**Platform implementation:**
- tvOS (SwiftUI): `List` with `LazyVStack` — SwiftUI handles virtualization natively. Use `.id()` for stable identity.
- Android TV (Compose): `LazyColumn` — Compose handles virtualization. Use `key` parameter for stable identity. Consider `Leanback` `VerticalGridView` for grid layouts.
- Current RN app uses `FlashList` (Shopify) with `estimatedItemSize: 152` — this works well, keep the same principle.

**Performance targets:**
- Scroll at 60fps with 1000+ items loaded
- First page render < 100ms after data arrives
- No dropped frames during D-pad rapid scroll (hold down button)
- Memory: don't keep more than ~200 item views alive at once

**Anti-patterns to avoid:**
- `FlatList` without `getItemLayout` — causes scroll jank
- Re-rendering entire list on single item state change — use stable keys + memoized items
- Inline closures in render items — allocates on every render
- Loading thumbnails synchronously — async with placeholder

### Cursor usage
- Cursor is opaque — don't parse or store it beyond the current session
- Cursor is also used for bulk operations (e.g., "restore all trash" sends cursor instead of individual IDs)
- On sort change: reset cursor, reload from page 1

---

## API Dependencies

| Endpoint | Used by |
|----------|---------|
| `POST /oauth2/device/code` | Auth — generate device code |
| `GET /oauth2/device/code/{code}` | Auth — poll for token |
| `GET /files/list` | File Browser |
| `GET /files/search` | Search |
| `GET /files/{id}` | File info, player metadata |
| `GET /files/{id}/subtitles` | Subtitle selection |
| `GET /files/{id}/url` | Direct file URL for VLC playback |
| `GET /events/list` | History |
| `GET /files/{id}/start-from` | Continue Watching — get position |
| `POST /files/{id}/start-from` | Continue Watching — save position |
| `DELETE /files/{id}` | Delete file |
| `GET /account/info` | Settings — account info |
| `GET /trash/list` | Trash |
| `POST /trash/{id}/restore` | Trash — restore file |
| `DELETE /trash/{id}` | Trash — permanent delete |
| `DELETE /trash/empty` | Trash — empty all |

---

*This spec is the contract. Agents implement it. Humans review it. The spec is the product.*
