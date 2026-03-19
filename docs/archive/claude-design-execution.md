# Claude Design Execution Plan

## Overview

Use Claude with Figma MCP to generate a complete put.io design system with example screens for every platform. Claude reads `docs/design.md` as the single source of truth.

## Prerequisites

- [ ] Figma MCP connected to Claude
- [ ] New Figma project: "put.io Design System"
- [ ] Claude has read `docs/design.md` in full

## Execution Phases

### Phase 1: Design Tokens

**Goal:** Establish the visual foundation before any screens.

**Deliverables:**
1. **Color palette** — refine the existing Radix-based system
   - Brand yellow (#FDCE45) as primary accent
   - Gray spectrum for light + dark modes
   - Semantic colors: success (green), error (red), warning (yellow)
   - Surface colors per context (app bg, card, sidebar, modal, overlay)
   - Generate all 12 Radix semantic steps for each color

2. **Typography scale**
   - Primary: GT America Standard (or evaluate alternatives if licensing is a concern for open source)
   - Mono: GT America Mono
   - Define scale: display, heading, subheading, body, caption, label, mono
   - Platform-specific sizing: web (14-15px base), mobile (16px base), TV (32px+ base)

3. **Spacing & layout**
   - 4px base grid, refined scale: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
   - Border radius: small (4px), medium (8px), large (12px), pill (999px)
   - Elevation/shadow scale (3 levels)

4. **Iconography direction**
   - Evaluate: Lucide, Phosphor, or custom set
   - Must support: outlined + filled variants
   - Critical icons to define: save-to-cloud, download-to-device, stream/play, folder, transfer, share, settings

**Figma structure:** `🎨 Tokens` page with swatches, type samples, spacing grid, icon set

---

### Phase 2: Core Components

**Goal:** Build the primitive component library per interaction model.

#### Touch Components (iOS, Android)
- Button (primary/secondary/ghost/destructive, sizes)
- List item (file row, transfer row, with swipe actions)
- Navigation bar + tab bar
- Bottom sheet / action sheet
- Context menu (long-press)
- Search bar
- Toggle / switch
- Progress bar (transfer progress, storage usage)
- Badge (file type, quality, health indicator)
- Empty state
- Player controls (play/pause, scrubber, volume, PiP, AirPlay/Cast)

#### Focus/Remote Components (tvOS, Android TV, Fire TV, Roku)
- Focus card (file item with focus ring/scale animation)
- Grid layout (folders, files)
- Side rail navigation
- Player overlay (timeline, info panel)
- Top shelf / home channel row
- Loading states

#### Pointer Components (Web)
- Sidebar navigation (collapsible)
- File table (list view) + file grid (card view)
- Breadcrumbs
- Dropdown / context menu
- Modal / dialog
- Toast / notification
- Tooltip
- Drag-and-drop zones
- Split pane (file browser + preview/player)
- Audio mini-player

#### Glanceable Components (watchOS)
- Complication (circular, rectangular)
- Notification card (transfer complete)
- Now Playing controls

#### Spatial Components (visionOS)
- Window chrome
- Immersive player environment
- Ornament controls (volume, player)

**Figma structure:** `🧩 Components` page, organized by interaction model, with variants and states

---

### Phase 3: Example Screens — Web

**Goal:** Show every major web app screen redesigned.

**Screens to design:**
1. **Files (list view)** — default view, sidebar collapsed/expanded, empty state
2. **Files (grid view)** — card layout with thumbnails where available
3. **Video player** — redesigned action hierarchy, autoplay UI, subtitle picker
4. **Audio player** — persistent mini-player, full player view
5. **Transfers** — health indicators instead of jargon, clean filename parsing
6. **RSS Automation** — feed management, empty state with personality
7. **Sharing** — redesigned with the founder's 3-type model (follow, collaborate, one-time)
8. **History** — filterable, grouped, "continue watching" section
9. **Settings** — current is good, minor refinements
10. **Storage dashboard** — new screen: what types, what's old, what's unwatched
11. **Onboarding** — first-run experience (3 steps max)
12. **Pricing page** — persona-based tiers, no jargon

**Figma structure:** `📱 Web` page with light + dark mode for each screen

---

### Phase 4: Example Screens — iOS

**Screens to design:**
1. **Files browser** — list + grid toggle, swipe actions, long-press context menu
2. **Video player** — native feel, PiP, AirPlay, subtitle/audio track picker
3. **Downloads** — offline queue, storage per item, auto-cleanup
4. **Transfers** — health indicators, push notification design
5. **Share sheet extension** — magnet link → put.io flow
6. **Settings**
7. **Widgets** — small (storage), medium (transfers), large (continue watching)
8. **Lock Screen / Dynamic Island** — transfer progress, now playing

**Figma structure:** `📱 iOS` page with iPhone + iPad frames

---

### Phase 5: Example Screens — Apple TV

**Screens to design:**
1. **Home** — continue watching, recently added, folders
2. **File browser** — focus grid, parsed filenames (show/season/episode badges)
3. **Video player** — swipe timeline, info panel, subtitle picker
4. **Search** — on-screen keyboard, results grid
5. **Settings**
6. **Top Shelf** — continue watching row

**Figma structure:** `📺 tvOS` page

---

### Phase 6: Example Screens — Android

**Screens to design:**
1. **Files browser** — Material You, grid/list toggle
2. **Video player** — Chromecast integration prominent, double-tap seek
3. **Downloads** — offline management
4. **Transfers** — health indicators
5. **Notification designs** — transfer progress, completion

**Figma structure:** `📱 Android` page

---

### Phase 7: Example Screens — Android TV / Fire TV

**Screens to design:**
1. **Home** — Leanback channel rows
2. **File browser** — focus-driven grid
3. **Video player** — D-pad controls, back button behavior
4. **Search** — voice + keyboard

**Figma structure:** `📺 Android TV` page

---

### Phase 8: Example Screens — Other Platforms

#### Roku
1. **Home grid** — extreme simplicity
2. **File browser** — folder → file → play
3. **Player** — minimal controls

#### watchOS
1. **Complication** — storage / transfer count
2. **Transfer notification**
3. **Now Playing** — audio controls

#### visionOS
1. **Immersive player** — spatial video environment (starry night?)
2. **File browser window** — standard visionOS window
3. **SharePlay** — watching together

**Figma structure:** `📺 Roku`, `⌚ watchOS`, `🥽 visionOS` pages

---

### Phase 9: Cross-Platform Flows

**Goal:** Show the same user journey across platforms.

**Flow 1: "I want to watch something"**
- Phone: find torrent → add magnet via share sheet → transfer starts
- Web: notification that transfer is done → open player
- TV: "Continue Watching" shows up → play with remote

**Flow 2: "Share with a friend"**
- Phone: select file → Share with Mom → generate link
- Friend's phone: open link → preview → sign up prompt
- Friend's web: file in their account

**Flow 3: "Manage my library"**
- Web: storage dashboard → find unwatched items → bulk delete
- Watch: glance at storage complication → see it freed up

**Figma structure:** `🔄 Flows` page with connected frames showing cross-platform journeys

---

## Claude Instructions

When executing this plan:

1. **Read `docs/design.md` first** — it's 1133 lines of context. Every design decision should trace back to this document
2. **Reference the screenshots** in `docs/assets/` — these are the "before" state
3. **Use the existing color system** as a starting point — don't reinvent, refine
4. **Brand personality matters** — put.io is nerdy, warm, self-aware. Not corporate. The about page and discount codes ([discount code], [discount code]) are the voice. Design should feel like that
5. **Typography does the heavy lifting** — in a content-agnostic product without posters, type IS the design
6. **Every screen needs light + dark mode**
7. **Name layers and components cleanly** — this will be exported to code
8. **Follow platform conventions** — Apple HIG for iOS/tvOS/watchOS/visionOS, Material 3 for Android, Leanback for Android TV
9. **The yellow is sacred** — #FDCE45 is the brand. Everything else can change

## Success Criteria

- A designer or engineer can open this Figma file and understand the entire design system
- Every platform put.io ships on has at least 3-5 example screens
- Design tokens are extractable to code (Style Dictionary compatible naming)
- Cross-platform flows show how the same experience feels across devices
- The "before/after" is dramatic — from generic shadcn file manager to something with a soul
