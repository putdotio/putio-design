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

---

*This spec is the contract. Agents implement it. Humans review it. The spec is the product.*
