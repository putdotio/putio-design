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
