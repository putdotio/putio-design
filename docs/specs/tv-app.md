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

## Table of Contents

**Features:**
Auth · Home Screen · File Browser · Search · Video Player · Audio Player · Continue Watching · History · Trash · Favorites · Diagnostics · Settings · Tunnel · Resume Prompt

**Cross-cutting:**
Error States · Pagination · Virtualized Lists · Remote Config · Sentry · Update Notifier · App Lock

**Platform & Design:**
10-Foot UI Principles · Platform-Specific Notes · Design References · Competitive Reference (Infuse) · User Requests (Linear)

**Shared Contracts:**
Design Tokens · i18n Strings · SDK Types · Error Map

**Flows:**
Auth Flow · File Browsing Flow · Video Playback Flow · Search Flow · Video Conversion Flow · Settings Flow · Error Recovery Flow

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

---

## User Requests (from Linear)

Real feature requests from users and internal backlog. Prioritized by relevance to TV rewrite.

### Must address in rewrite
- **SUP-179: Multi-account login on TV** — ability to switch between accounts without re-pairing. Family household use case.
- **SUP-166: QR login for TV apps** — scan QR with phone instead of typing code. Already in spec, confirm implementation.
- **SUP-86: Subtitle settings on TV player** — font size, color, position. Users explicitly asked for this.
- **SUP-155: Subtitle offset** — manual timing adjustment (±0.5s increments). Essential for out-of-sync subs.
- **SUP-55: .ass subtitle support** — Advanced SubStation Alpha. VLC-kit handles this natively. Free win.
- **SUP-154: Multi-audio on tv.put.io** — select between audio tracks. Already in spec, confirm VLC-kit supports it.
- **SUP-61: Android TV fast forward/backward** — double-tap for 10s/30s skip. Already in spec.
- **SUP-51: Android TV autoplay** — play next file in folder. Already in spec as "Up Next."
- **UI-1528: Fire TV back button** — already in spec with full state machine.
- **SUP-118: Lock TV apps** — PIN/passcode to open app. Parental control. NEW — add to spec.
- **SUP-158: Truncated subtitle names** — subtitle picker must show full names, scrollable if needed.

### Nice to have
- **SUP-152: Video preview when seeking** — thumbnail scrubbing on progress bar. VLC-kit may support this.
- **SUP-111: Share with mom on TV** — generate a share link from TV, show QR code. Nice UX.
- **SUP-48: Add to queue** — queue system for sequential playback. Goes beyond "Up Next."
- **SUP-132: Multiple thumbnails/chapters** — chapter markers in progress bar. VLC-kit supports chapters.
- **SUP-156: 3x playback speed** — extend speed options beyond 2x.
- **SUP-182: Music visualization** — visual effects during audio playback. Low priority but cool.
- **SUP-49: Android TV 10-bit decoding** — VLC-kit/libVLC handles this natively. Free win.
- **SUP-60: Subtitles from "subs" folder** — scan sibling folders for subtitle files. API-level feature.
- **SUP-104: Better Arabic subtitle fonts** — font selection per language in subtitle settings.

### Won't do on TV
- SUP-194: Split downloads — web/mobile feature
- SUP-189: Batch download — web/mobile feature
- SUP-175: Convert multiple videos — irrelevant with VLC-kit
- SUP-176: Download without converting — irrelevant with VLC-kit
- SUP-71: IPTV support — separate product concern
- SUP-96: iPlayer support — separate product concern

---

## App Lock / Parental Controls (from SUP-118)

- PIN code required to open app (4-6 digits)
- Set PIN from Settings → Security
- Enter PIN on every app launch (or after 30min of inactivity)
- Option to require PIN for specific actions: delete, settings change
- PIN stored in platform keychain (not plain text)
- "Forgot PIN" → re-authenticate via put.io/link (device code flow)
- Future: per-folder PIN lock (hide adult content folders)

---

## 10-Foot UI Design Principles

Based on Apple HIG for tvOS, Google TV design guidelines, and industry best practices.

### Viewing Distance
- Users sit 3+ meters (10 feet) from screen
- Minimum body text: 36px (already in our tokens — TV body is 36)
- Minimum touch target equivalent: 80x80px focused area
- Test on real TV from real distance, not on desktop simulator

### Focus Management
- **One focused item at all times** — never leave user without a focus indicator
- **Focus should be predictable** — D-pad up/down/left/right goes where user expects
- **Remember focus position** — when returning to a screen, focus the same item they left
- **Focus ring/highlight** — clear, high-contrast. Yellow ring on dark background. Scale-up animation (tvOS convention) or border highlight (Android TV convention).
- **Don't trap focus** — every screen must have a way out via back button

### Layout
- **Horizontal rows for browsing** — Continue Watching, Recent Files, Pinned Folders
- **Vertical lists for content** — File browser, search results, history
- **One primary action per screen** — don't clutter
- **Generous whitespace** — what feels "empty" on desktop feels clean on TV
- **Safe area margins** — 2% vertical, 4% horizontal for overscan
- **No scrollbars** — use visual cues (fade at edge, partial items) to indicate more content

### Text & Readability
- Sans-serif fonts only (GT America is correct)
- High contrast: white text on dark backgrounds
- Avoid light gray text — use `text-secondary` sparingly
- Filename parsing is critical — raw torrent names are unreadable from 3 meters
- Truncate with ellipsis, never wrap to multiple lines for list items

### Animation & Motion
- Keep animations short: 150-250ms
- Use easing (not linear) for all transitions
- Focus transitions: scale up 1.05x (tvOS) or border highlight (Android TV)
- Page transitions: fade, not slide (TV convention)
- Avoid parallax effects (tvOS has these but they're distracting for a utility app)
- Player controls: fade in/out, not slide

### Accessibility
- VoiceOver (tvOS) / TalkBack (Android TV) support for all screens
- Meaningful labels for all interactive elements
- Don't rely on color alone — use icons + color for health indicators
- High contrast mode support
- Reduced motion support (respect system setting)

---

## Competitive Reference: What Infuse Gets Right

Infuse (by Firecore) is the closest competitor in the "play any file format" space on Apple TV. What they nail:

1. **Direct play, no transcoding** — exactly what VLC-kit gives us
2. **Native tvOS subtitle rendering** — uses system subtitle style, not custom overlay
3. **Minimal clicks to play** — browse → select → playing. Three taps max.
4. **Metadata enrichment** — auto-fetches movie/show info, posters, descriptions. put.io could do filename parsing instead (lighter, no external API dependency)
5. **Chapter support** — shows chapter markers on seek bar
6. **Dolby Vision / Atmos passthrough** — VLC-kit supports this too

What Infuse gets wrong (put.io's opportunity):
1. **Requires media server setup** (Plex/Emby/Jellyfin) — put.io is the server
2. **Subscription fatigue** — Infuse Pro is $10/year on top of Plex/server costs
3. **No cloud storage** — it's just a player, not a storage solution
4. **No transfer/download management** — put.io fetches content for you

---

## Shared Contracts

These are the cross-platform contracts that keep native apps consistent without shared code.

### Design Tokens

Single source of truth: `putio-design/tokens/`. Generated into platform-specific formats.

```yaml
colors:
  brand-yellow: "#FDCE45"
  brand-yellow-hover:
    dark: "#FCBE03"
    light: "#FDD868"
  background:
    dark: { app: "gray1", html: "black" }
    light: { app: "white", html: "gray2" }
  text: { dark: "gray12", light: "gray12" }
  text-secondary: { dark: "gray11", light: "gray11" }
  health-good: "green9"
  health-warning: "yellow9"
  health-error: "red9"
  overlay-inline: { dark: "blackA9", light: "blackA3" }
  overlay-full: { dark: "blackA11", light: "blackA9" }

# Color system: Radix UI semantic scale (gray, green, red, yellow)
# Each color has 12 steps. Use step names from Radix conventions.
# Brand yellow (#FDCE45) overrides yellow.solid on both themes.

typography:
  font-family: "GT America"
  font-family-mono: "GT America Mono"
  weights: { regular: 400, medium: 500, bold: 700 }
  # TV sizes are larger than mobile/web (viewed from 3m+ distance)
  tv:
    heading: { size: 64, weight: medium, family: gt-america }
    label: { size: 48, weight: medium, family: gt-america }
    body: { size: 36, weight: regular, family: gt-america }
    caption: { size: 32, weight: regular, family: gt-america }
    smol: { size: 24, weight: regular, family: gt-america }

spacing:
  # TV spacing is larger than mobile/web
  tv: { xxs: 4, xs: 8, sm: 16, md: 32, lg: 64, xl: 128, xxl: 256 }

radii:
  default: 12

overscan-safe-margins:
  # TV overscan: 2% vertical, 4% horizontal
  top: 2%
  bottom: 2%
  left: 4%
  right: 4%
```

**Generated outputs:**
- Swift: `Colors.swift`, `Typography.swift`, `Spacing.swift` (enums/structs)
- Kotlin: `Colors.kt`, `Typography.kt`, `Spacing.kt` (objects)
- CSS: `tokens.css` (custom properties)
- JSON: `tokens.json` (for tools and documentation)

### i18n Strings

Single source: `putio-design/i18n/en.json` (English as base language).

```json
{
  "home_your_files": "Your Files",
  "home_search": "Search",
  "home_history": "History",
  "home_account": "Account",
  "home_continue_watching": "Continue Watching",
  "home_recent_files": "Recent Files",
  "home_pinned_folders": "Pinned Folders",

  "files_empty_title": "This folder is empty",
  "files_sort_name": "Name",
  "files_sort_date_added": "Date Added",
  "files_sort_date_modified": "Date Modified",
  "files_sort_size": "Size",
  "files_sort_type": "Type",

  "search_placeholder": "Search your files",
  "search_no_results": "No results for \"%1$s\"",
  "search_clear_history": "Clear search history",

  "player_continue_from": "Continue playing from %1$s",
  "player_start_beginning": "Start from the beginning",
  "player_subtitles": "Subtitles",
  "player_audio_track": "Audio Track",
  "player_playback_speed": "Playback Speed",

  "trash_empty_title": "Trash is empty",
  "trash_empty_message": "Nothing to see here ✓",
  "trash_restore": "Restore",
  "trash_delete_permanently": "Delete permanently",
  "trash_empty_all": "Empty trash",

  "settings_tunnel_route": "Tunnel Route",
  "settings_remember_position": "Remember playback position",
  "settings_show_subtitles": "Show subtitles",
  "settings_dont_autoselect_subtitles": "Don't auto-select subtitles",
  "settings_playback_type": "Playback type",
  "settings_buffer_size": "Buffer size",
  "settings_logout": "Sign out",
  "settings_diagnostics": "Diagnostics",
  "settings_about": "About",

  "error_network": "Can't connect to put.io",
  "error_network_recovery": "Check your internet connection",
  "error_session_expired": "Session expired",
  "error_session_expired_recovery": "Please sign in again",
  "error_rate_limit": "Too many requests",
  "error_rate_limit_recovery": "Please try again in a moment",
  "error_timeout": "Request timed out",
  "error_timeout_recovery": "Check your connection and try again",
  "error_not_found": "File not found",
  "error_not_found_recovery": "This file may have been deleted",
  "error_server": "Something went wrong on our end",
  "error_server_recovery": "Try again in a few minutes",
  "error_unknown": "Something unexpected happened",
  "error_unknown_recovery": "Error ID: %1$s",

  "auth_enter_code": "Go to put.io/link and enter the code",
  "auth_waiting": "Waiting for authentication...",
  "auth_try_again": "Try again",

  "generic_retry": "Try Again",
  "generic_cancel": "Cancel",
  "generic_confirm": "Confirm",
  "generic_loading": "Loading..."
}
```

**Rules:**
- Key naming: `{screen}_{element}_{variant}` — e.g., `player_continue_from`
- Parameterized strings use `%1$s`, `%2$s` (Android convention, portable)
- English is the source of truth. Other languages are translations of these keys.
- TV apps start English-only. Add languages based on user demand.
- The current codebase has 1110 translation keys. TV app needs ~60-80 (subset above).

### SDK Types

The TypeScript SDK defines canonical API types. Native SDKs mirror them.

```typescript
// Core types that all platforms must implement
interface File {
  id: number
  name: string
  file_type: 'FOLDER' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'PDF' | 'TEXT' | 'ARCHIVE' | 'OTHER'
  size: number
  created_at: string
  updated_at: string
  parent_id: number
  screenshot: string | null
  start_from: number
  need_convert: boolean
  sort_by: string
  media_info: MediaInfo | null
}

interface AccountInfo {
  user_id: number
  username: string
  email: string
  avatar_url: string
  disk: { used: number, size: number }
  plan: { name: string }
}

interface HistoryEvent {
  id: number
  file_id: number
  file_name: string
  type: string
  created_at: string
}

interface SubtitleTrack {
  language_code: string
  name: string
  url: string
  source: 'embedded' | 'opensubtitles'
}

interface TunnelRoute {
  name: string
  display_name: string
}

interface ConversionStatus {
  status: 'NOT_NEEDED' | 'IN_QUEUE' | 'CONVERTING' | 'COMPLETED' | 'ERROR'
  percent: number | null
}

// Paginated response
interface PaginatedResponse<T> {
  items: T[]
  cursor: string | null
}
```

**Rule:** If a field exists in the TypeScript SDK type, it must exist in the Swift and Kotlin SDK types with the same name and semantics. JSON field names are the canonical names.

### Error Map (shared data, not code)

```yaml
errors:
  - code: network_error
    message_key: error_network
    recovery_key: error_network_recovery
    recovery_action: retry

  - code: auth_401
    message_key: error_session_expired
    recovery_key: error_session_expired_recovery
    recovery_action: auth

  - code: rate_limit_429
    message_key: error_rate_limit
    recovery_key: error_rate_limit_recovery
    recovery_action: retry

  - code: timeout
    message_key: error_timeout
    recovery_key: error_timeout_recovery
    recovery_action: retry

  - code: not_found_404
    message_key: error_not_found
    recovery_key: error_not_found_recovery
    recovery_action: none

  - code: server_5xx
    message_key: error_server
    recovery_key: error_server_recovery
    recovery_action: retry

  - code: unknown
    message_key: error_unknown
    recovery_key: error_unknown_recovery
    recovery_action: none
    include_trace_id: true
```

Each platform's error localizer reads this map and renders using platform-native UI. The mapping is shared, the rendering is native.

---

*This spec is the contract. Agents implement it. Humans review it. The spec is the product.*

## Auth Flow

### Happy Path

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

### States

| State | Screen | Focus | Transition |
|-------|--------|-------|------------|
| `no_token` | Auth screen with code + QR | Retry button (initially hidden) | Auto-transitions on token |
| `polling` | Same screen, "Waiting..." spinner | No interactive focus needed | 5s interval API poll |
| `timeout` | Same screen, "Code expired" | Retry button (focused) | Press → new code → polling |
| `error` | Auth screen with error message | Retry button (focused) | Press → new code → polling |
| `authenticated` | Home screen | First row, first item | Fade transition |

### Edge Cases

- **Network drops during polling** — show inline "No connection" below code, keep polling. Don't navigate away.
- **Token revoked after auth** — API returns 401 on any request → clear token → back to Auth screen with "Session expired" message.
- **Multiple TVs same account** — each TV gets its own device code, same account token. No conflict.
- **App backgrounded during polling** — resume polling on foreground. Don't reset code unless 10min elapsed.

### Multi-Account (SUP-179)

- After auth, store token with account label (username)
- Settings → Accounts → list of authenticated accounts
- "Add account" → new device code flow
- "Switch account" → select from list → reload Home with new token
- "Remove account" → confirm → delete token from keychain
- Active account indicator in Settings header

### Focus Behavior

- On auth screen: nothing focusable until timeout (code is display-only)
- On timeout: Retry button auto-focused
- On transition to Home: first item in Continue Watching (or Your Files if empty)

## File Browsing Flow

### Happy Path

```
Home Screen
  └─ "Your Files" → File Browser (root, id=0)
       ├─ Folder → File Browser (folder id)
       │    ├─ Subfolder → deeper...
       │    ├─ Video file → Playback Flow
       │    ├─ Audio file → Audio Player
       │    └─ Other file → File Info modal
       ├─ Long-press any item → Action Sheet
       │    ├─ Play (video/audio)
       │    ├─ Info (size, format, date)
       │    ├─ Add to Favorites / Remove
       │    └─ Delete (→ Trash)
       └─ Sort button → Sort Modal → reload list
```

### States

| State | Screen | Focus | Data |
|-------|--------|-------|------|
| `loading` | Activity indicator | None | Fetching first page |
| `loaded` | File list | First item (or last focused on return) | Files + cursor |
| `loading_more` | File list + bottom spinner | Current item | Fetching next page |
| `empty` | Empty state | Back button / parent nav | No files in folder |
| `error` | Error state | Retry button | API failure |

### Navigation Stack

```
Home → Files(0) → Files(123) → Files(456) → Player
  ↑       ↑           ↑            ↑
  back    back        back         back (exit player)
```

- Each folder push adds to the stack
- Back pops one level
- Breadcrumb shows: "Files > Movies > 2026"
- Back from root folder → Home screen

## Pagination

- First page loads on screen mount (50 items)
- Scroll near bottom (5 items from end) → fetch next page
- Append to list, don't replace
- Sort change → reset cursor, reload from page 1
- Pull-to-refresh: N/A on TV. Use "Refresh" button in file actions bar.

### Focus Behavior

- **Enter folder**: focus first item
- **Return to folder** (back from subfolder/player): focus the item user previously selected
- **After sort change**: focus first item
- **Empty folder**: focus back button / parent navigation
- **Long-press action sheet**: focus first action. Dismiss → return focus to item.

### File Type Handling

| File type | D-pad select | Long-press |
|-----------|-------------|------------|
| Folder | Navigate into | Action sheet (info, favorite, delete) |
| Video | → Playback Flow | Action sheet (play, info, favorite, delete) |
| Audio | → Audio Player | Action sheet (play, info, delete) |
| Image | → Full-screen preview | Action sheet (info, delete) |
| PDF/Text/Archive/Other | → File Info modal | Action sheet (info, delete) |

### Edge Cases

- **Token expires while browsing** — 401 → Auth flow. On re-auth, return to Home (don't try to restore deep nav stack).
- **File deleted by another client** — 404 on file access → show toast "File not found", stay in current folder, refresh list.
- **Folder with 10,000+ files** — pagination handles this. Virtualized list keeps memory bounded.
- **Network drop while loading page** — show error state with retry. Keep previously loaded items visible.
- **Filename parsing** — always attempt parse. If parse fails, show raw filename. Never show "Unknown" or blank.

## Video Playback Flow

The most complex and most important flow. Every decision here affects the core experience.

### Happy Path

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

### Position Saving

- Save position to API every 10 seconds during playback
- Also save on: pause, exit, app background, overlay open
- Debounce: don't fire more than once per 10s (avoid excessive API calls — ref UI-1462)
- Position syncs across all devices (start on TV, continue on phone)
- Mark as "completed" when position > 95% of duration → remove from Continue Watching
- On player exit (back button), always save current position

### Subtitle Flow

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

### Audio Track Flow

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

### Seek & Scrubbing

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

### Error Handling During Playback

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

### Focus Behavior

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

### Platform-Specific

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

## Search Flow

### Happy Path

```
Home → Search
  └─ Search Screen
       ├─ Recent searches shown (last 10, stored locally)
       │    ├─ Select recent → execute search
       │    └─ Delete recent → remove from list (swipe tvOS, long-press Android)
       │
       ├─ Keyboard input
       │    ├─ tvOS: system keyboard + Siri dictation
       │    ├─ Android TV: system keyboard + voice button
       │    └─ Fire TV: system keyboard + Alexa voice
       │
       ├─ Submit query
       │    ├─ API: GET /files/search?query=...&per_page=50
       │    ├─ Loading: activity indicator replaces results area
       │    ├─ Results: file list (same component as File Browser)
       │    │    ├─ Select folder → File Browsing Flow
       │    │    ├─ Select video → Playback Flow
       │    │    ├─ Select audio → Audio Player
       │    │    └─ Pagination: cursor-based, load more on scroll
       │    ├─ No results: "No results for '[query]'"
       │    └─ Error: standard error state with retry
       │
       └─ Query saved to recent searches on submit
```

### States

| State | Screen | Focus |
|-------|--------|-------|
| `idle` | Recent searches list | First recent item (or keyboard if none) |
| `typing` | Keyboard active + live input | Keyboard |
| `loading` | Spinner replacing results | None (non-interactive during load) |
| `results` | File list | First result |
| `empty_results` | "No results" message | Back to keyboard |
| `error` | Error state | Retry button |

### Voice Search Integration

```
System voice search (Siri / Google Assistant / Alexa)
  └─ "Search put.io for [query]"
       ├─ App registered as search provider
       ├─ Receives intent with query string
       ├─ Opens app → Search screen → pre-filled query → auto-execute
       └─ Results shown immediately
```

### Focus Behavior

- Enter search: focus keyboard (if no recent searches) or first recent item
- Submit query: focus moves to first result
- No results: focus returns to keyboard input
- Back from result detail: focus the result item user selected
- Clear search: focus keyboard

### Edge Cases

- **Empty query submit** — ignore, stay on keyboard
- **Very long query** — truncate display at ~50 chars, send full to API
- **Special characters in query** — URL-encode, API handles
- **Search while previous search loading** — cancel previous request, start new
- **Offline** — show cached recent searches. On search submit, show network error.

## Video Conversion Flow

### Context

put.io's server-side conversion generates HLS streams from uploaded files. This is required for:
- **Web app** — browser `<video>` can't play MKV/x265/DTS natively
- **TV-web** (Tizen, LG, Vizio) — same browser limitation

**Native apps (iOS, tvOS, Android, Android TV) skip this flow entirely** thanks to VLC-kit/libVLC.

### Conversion States

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

### States

| State | UI | Actions |
|-------|-----|---------|
| `CONVERSION_NOT_NEEDED` | Hidden — go straight to player | — |
| `NOT_AVAILABLE` | "This file can't be converted" | "Download original" button |
| `IN_QUEUE` | Poster + "Waiting to convert..." + spinner | Cancel button, position indicator |
| `CONVERTING` | Poster + progress bar + percentage | Cancel button |
| `COMPLETED` | Hidden — go straight to player | — |
| `ERROR` | Poster + "Conversion failed" | Retry button, Back button |

### Polling

- Poll `GET /files/{id}/mp4` every 5 seconds while `IN_QUEUE` or `CONVERTING`
- Stop polling on: `COMPLETED`, `ERROR`, `NOT_AVAILABLE`, user navigates away
- On `COMPLETED` → auto-transition to player (don't make user press play again)

### Conversion Screen UI

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

### Edge Cases

- **User navigates away during conversion** — conversion continues server-side. On return, check status and resume from current state.
- **Conversion takes very long (>30min)** — show estimated time if API provides it. Otherwise just spinner + percentage.
- **File is both convertible and directly playable** — prefer direct play (MP4 stream). Only show conversion flow for HLS if MP4 isn't available.
- **Multiple files need conversion** — each file independent. No batch conversion UI on TV.
- **Network drop during polling** — show "Can't check conversion status" with retry. Don't assume conversion failed.

### Native App Behavior

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

### API

| Endpoint | Purpose |
|----------|---------|
| `GET /files/{id}/mp4` | Check conversion status |
| `POST /files/{id}/mp4` | Trigger conversion |
| `DELETE /files/{id}/mp4` | Cancel conversion |

## Settings Flow

### Structure

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

### Setting Changes

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

### Tunnel Route Picker

```
Settings → Tunnel Route
  └─ List of available routes (from API)
       ├─ Each row: route display name (e.g., "Amsterdam", "London")
       ├─ Current route: checkmark icon
       ├─ Select → API call → immediate effect
       └─ Back → return to settings
```

### Diagnostics Flow

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

### Focus Behavior

- Enter settings: focus first item in Playback Settings
- After toggle change: stay focused on same item
- After picker selection: return focus to the setting row
- Sign Out: confirmation dialog → "Yes" focused
- Back: return to Home, focus "Account" row

### Edge Cases

- **API failure on setting change** — show toast "Couldn't save setting", revert toggle to previous state
- **Tunnel route change during playback** — doesn't affect current stream. New route applies to next playback.
- **Sign out with app lock enabled** — clear PIN along with token
- **Disk usage near 100%** — progress bar turns red, show warning text

## Error Recovery Flow

Every error has a defined recovery path. The user should never be stuck.

### Error → Recovery Matrix

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

### Recovery Principles

1. **Never leave the user stuck** — every error screen has at least one actionable button (Retry or Back)
2. **Non-blocking errors are toasts** — subtitle/audio failures don't interrupt playback
3. **Blocking errors are full-screen** — network loss, auth expiry, server errors replace content
4. **Auto-retry before showing error** — rate limits and expired URLs get one silent retry
5. **Preserve context when possible** — after retry success, user is exactly where they were
6. **Auth errors are nuclear** — clear token, go to auth screen. Don't try to be clever.
7. **Save playback position on every error** — user never loses their place
8. **Include error ID for unknowns** — Sentry trace ID in the message so support can look it up
9. **Degrade gracefully** — network drop during browse shows stale data + error banner, not empty screen

### Offline / Degraded Network

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

### Toast vs Full-Screen Error Decision

```
Is the user's primary task blocked?
  ├─ Yes → Full-screen error (Retry/Back buttons)
  │    Examples: can't load files, can't authenticate, playback failed
  └─ No → Toast notification (auto-dismiss after 5s)
       Examples: subtitle load failed, audio switch failed, setting save failed
```
