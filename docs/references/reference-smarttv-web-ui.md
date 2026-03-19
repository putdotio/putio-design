---
title: "Smart TV Web App UI Reference"
created: 2026-03-19
platforms: [Samsung Tizen, LG webOS, Vizio SmartCast]
target-repo: putio-tv-web
resolution: 1920x1080
---

# Smart TV Web App UI Reference

Reference for building web-based TV app prototypes that run on Samsung Tizen, LG webOS, and Vizio SmartCast smart TVs. These platforms all use Chromium-based webviews — one HTML/CSS/JS codebase covers all three.

**Context:** The put.io web TV app (tv.put.io) is a file browser and media player, not a content discovery app. There are no movie posters, no metadata, no album art. Typography, spacing, and focus states do all the work.

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Screen Resolution and Viewport](#screen-resolution-and-viewport)
- [Overscan Safe Areas](#overscan-safe-areas)
- [Typography](#typography)
- [Color System](#color-system)
- [Layout Patterns](#layout-patterns)
- [Navigation Patterns](#navigation-patterns)
- [Focus States](#focus-states)
- [List and Card Patterns](#list-and-card-patterns)
- [Player UI](#player-ui)
- [Remote Control Button Mapping](#remote-control-button-mapping)
- [Focus Management Implementation](#focus-management-implementation)
- [CSS and Rendering Constraints](#css-and-rendering-constraints)
- [Performance Optimization](#performance-optimization)
- [Font Loading](#font-loading)
- [Accessibility](#accessibility)
- [Competitive Reference](#competitive-reference)

---

## Platform Overview

All three target platforms run web apps inside Chromium-based webviews. The app is standard HTML5 + CSS + JavaScript.

| Platform | Runtime | Chromium Base (2025) | Notes |
|---|---|---|---|
| Samsung Tizen 9.0 | Chromium webview | M120 | Largest smart TV market share |
| Samsung Tizen 8.0 (2024) | Chromium webview | M108 | Still in active use |
| Samsung Tizen 7.0 (2023) | Chromium webview | M94 | Minimum reasonable target |
| Samsung Tizen 6.5 (2022) | Chromium webview | M85 | Older but still deployed |
| Samsung Tizen 6.0 (2021) | Chromium webview | M76 | Stretch target |
| LG webOS 6.0+ | Chromium webview | Varies | webOS 3.0 (2016) was Chromium 38 — avoid |
| Vizio SmartCast | Chromium webview | Varies | Custom Chromium build |

**Minimum target:** Chromium M76 (Tizen 6.0, 2021 TVs) covers ~95% of active Samsung smart TVs. This gives you ES2019, CSS Grid, Flexbox, CSS Custom Properties, IntersectionObserver, and most modern CSS. Avoid features that arrived after M76 unless you feature-detect.

**Key missing features across older targets:**
- No Service Workers (Tizen filesystem limitation)
- No Container Queries (arrived M105)
- No CSS Nesting (arrived M120)
- No CSS Subgrid (arrived M117)
- No `requestIdleCallback` on Tizen
- No Custom Elements / Shadow DOM v1 before Tizen 6.0
- No Geolocation API
- No Web Speech API
- Limited `Proxy` / `WeakMap` / `WeakSet` on older Tizen

---

## Screen Resolution and Viewport

All smart TVs render at 1920x1080 (FHD) or 3840x2160 (UHD), but **UHD TVs still run web apps at a 1920x1080 logical viewport** — the TV upscales. Design for 1920x1080.

### Viewport meta tag

```html
<meta name="viewport" content="width=1920, user-scalable=no">
```

Samsung recommends designing for 1920x1080. The viewport width should be set to 1920 explicitly. `user-scalable=no` prevents unintended zoom.

Do not use `width=device-width` — it returns inconsistent values across TV models. Use a fixed 1920px viewport.

### CSS base

```css
html, body {
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
```

Multimedia elements (video) always render at 1920x1080 regardless of app viewport scaling.

---

## Overscan Safe Areas

Some TVs crop the outer edges of the screen. Even though most modern TVs have minimal overscan, design defensively.

### Platform-specific safe areas

| Platform | Safe Area Margin | Notes |
|---|---|---|
| LG webOS | 20px all edges | Official webOS specification |
| Samsung Tizen | ~48px horizontal, ~27px vertical | Samsung recommends 5% margin |
| Android TV | 48dp horizontal, 27dp vertical | Google specification |
| Apple tvOS | 60pt vertical, 80pt horizontal | For reference |
| General recommendation | 5% (96px horizontal, 54px vertical) | Most conservative |

### Implementation

Use a root container with padding, not margin on body:

```css
.app-root {
  padding: 48px 60px;
  width: 1920px;
  height: 1080px;
  box-sizing: border-box;
}
```

This gives a usable content area of approximately **1800px wide x 984px tall**.

**Rules:**
- All interactive elements, text, and icons must be inside the safe area
- Background colors and images can extend to screen edges (full-bleed)
- Allow partial display of offscreen elements at edges to hint at scrollable content (the "peek" pattern)
- Never place buttons, text labels, or focus indicators in the outer 48-60px

---

## Typography

TV is a 10-foot UI. Text that looks fine on a desktop monitor at arm's length becomes illegible on a TV at 3 meters (10 feet). At viewing distance, a 1080p TV's effective resolution is roughly equivalent to a 540p monitor at desk distance.

### Font sizing at 1920x1080

| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title / Hero | 48-56px | 600 (semibold) | Sparingly used |
| Section heading | 36-40px | 500-600 | Row labels, screen titles |
| List item primary | 28-32px | 400-500 | File names, folder names |
| List item secondary | 22-26px | 400 | Metadata: size, date, codec |
| Body text | 28px | 400 | Minimum readable body text |
| Caption / Badge | 20-24px | 500 | Quality badges, small labels |
| Absolute minimum | 20px | — | Nothing smaller than this |

**Rules:**
- **Minimum body text: 28px.** Anything below 24px is unreadable at 10-foot distance.
- **Minimum for any text: 20px.** Small labels and badges only.
- Line height: 1.3-1.5 (30-50% more generous than desktop)
- Letter spacing: slightly wider than desktop defaults (+0.01-0.02em)
- Prefer **medium and semibold weights** (500, 600) over regular (400) for better legibility at distance. Thin/light weights bleed on TV screens.
- Avoid thin fonts entirely. Hairline strokes blur on TVs due to subpixel rendering differences.
- Sans-serif fonts are standard for TV interfaces. GT America (put.io's brand font) works well at TV sizes.

### Font rendering on smart TVs

TV webviews use their own font rendering pipeline, which differs from desktop browsers:
- Subpixel antialiasing is often disabled or different
- Thin strokes appear blown out or fuzzy
- **Always test typography on a real TV** — desktop emulators don't match real rendering
- Use `-webkit-font-smoothing: antialiased` (already standard in put.io's codebase)

### Truncation

File names on put.io are often long and messy (torrent metadata, scene tags). Always truncate with ellipsis:

```css
.filename {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
```

For multi-line truncation (2 lines max):

```css
.filename-multiline {
  display: -webkit-line-clamp;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Color System

TV apps are viewed in dim/dark rooms. Dark themes are the universal standard for TV interfaces.

### Dark theme fundamentals

| Token | Value | Purpose |
|---|---|---|
| `--bg-primary` | `#0a0a0a` to `#121212` | Main background |
| `--bg-secondary` | `#1a1a1a` to `#1e1e1e` | Cards, panels, sidebar |
| `--bg-tertiary` | `#252525` to `#2a2a2a` | Elevated surfaces, modals |
| `--text-primary` | `#e0e0e0` to `#f0f0f0` | Primary text (off-white) |
| `--text-secondary` | `#888888` to `#999999` | Secondary text, metadata |
| `--text-disabled` | `#555555` to `#666666` | Disabled / placeholder |
| `--accent` | `#FDCE45` | put.io brand yellow |
| `--accent-hover` | `#FDD868` | Yellow hover / focus |
| `--border` | `#333333` to `#3a3a3a` | Subtle borders |
| `--focus-ring` | `#FDCE45` or `#FFFFFF` | Focus indicator |

### Color rules

- **Never use pure black (#000000) with pure white (#FFFFFF).** The extreme contrast causes halation (blurry glow around text edges on TV panels). Use off-black backgrounds with off-white text.
- **Avoid highly saturated reds.** Red bleeds on TV panels and looks harsh. Desaturate reds for error states.
- **Use cool colors (blue, gray, purple) over warm colors (red, orange)** for backgrounds and large areas. Warm colors are more vibrant on TV panels than on monitors.
- **sRGB color space only.** Do not use oklch, lab, or other advanced color spaces — older Chromium versions don't support them.
- **Test gradients on real hardware.** TV panels have limited color depth, causing visible banding in subtle gradients.
- **Brand yellow (#FDCE45) works well on dark backgrounds** for accent, focus rings, CTAs, and progress bars.

### Contrast requirements

WCAG 4.5:1 for body text and 3:1 for large text are the baseline, but TV viewing is different from desktop:
- Viewing distance reduces effective contrast perception
- Ambient lighting varies widely (dark room vs. bright room)
- TV panels have higher inherent contrast and saturation than monitors
- **Aim for 7:1 or higher** for body text on TV to account for distance

The put.io color system (Radix-based semantic scale) maps well to TV. Use the existing 12-step scale with dark mode values.

---

## Layout Patterns

### Common TV app screen structures

#### 1. Home screen — Horizontal shelves (rows)

The dominant pattern across all streaming TV apps. Horizontal rows of items that scroll left/right, with the screen scrolling vertically between rows.

```
┌────────────────────────────────────────────────────────┐
│  [Nav]  Section Title                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──    │
│  │      │ │      │ │      │ │      │ │      │ │       │
│  │ Item │ │ Item │ │ Item │ │ Item │ │ Item │ │ I...  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──    │
│                                                        │
│  Section Title                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──    │
│  │      │ │      │ │      │ │      │ │      │ │       │
│  │ Item │ │ Item │ │ Item │ │ Item │ │ Item │ │ I...  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──    │
└────────────────────────────────────────────────────────┘
```

**For put.io:** Use for the Home screen with "Continue Watching" and "Recent Files" rows. Items are text-based list cards (file name + metadata), not poster images.

#### 2. File browser — Vertical list

A vertical scrolling list of items. The primary navigation pattern for put.io's file browser.

```
┌────────────────────────────────────────────────────────┐
│  [Nav]  Files > Movies > 2026                          │
│  ──────────────────────────────────────────────────     │
│  📁  Folder Name                           12 items    │
│  ──────────────────────────────────────────────────     │
│  📁  Another Folder                         8 items    │
│  ──────────────────────────────────────────────────     │
│  🎬  Video File Name.mkv              1.4 GB  2:12     │
│  ──────────────────────────────────────────────────     │
│  🎬  Another Video.mp4                890 MB  1:45     │
│  ──────────────────────────────────────────────────     │
│  📄  Document.pdf                       2.1 MB          │
│  ──────────────────────────────────────────────────     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key dimensions for list items:**
- Row height: 72-96px (large enough for comfortable D-pad navigation)
- Horizontal padding: 24-32px
- Icon size: 32-40px
- Gap between icon and text: 16-20px
- Gap between rows: 4-8px (tight, to show more items)

#### 3. Detail / Action overlay

A side panel or modal that shows details and actions for a selected item.

```
┌────────────────────────────────────────────────────────┐
│                              ┌─────────────────────┐   │
│  [Background: file list      │  Video File Name    │   │
│   or player, dimmed]         │  ────────────────   │   │
│                              │  Size: 1.4 GB       │   │
│                              │  Format: MKV x265   │   │
│                              │  Duration: 2:12:34  │   │
│                              │  ────────────────   │   │
│                              │  [▶ Play]            │   │
│                              │  [ℹ Info]            │   │
│                              │  [🗑 Delete]         │   │
│                              └─────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

#### 4. Settings — Two-pane layout

Left pane: setting categories. Right pane: settings for selected category.

```
┌────────────────────────────────────────────────────────┐
│  Settings                                              │
│  ┌──────────────┐ ┌──────────────────────────────────┐ │
│  │ ▸ Playback   │ │  Buffer Size                     │ │
│  │   Subtitles  │ │  ┌─────────────────────────────┐ │ │
│  │   Storage    │ │  │ Auto (recommended)       ▸  │ │ │
│  │   Account    │ │  └─────────────────────────────┘ │ │
│  │   About      │ │  Proxy Server                    │ │
│  │              │ │  ┌─────────────────────────────┐ │ │
│  │              │ │  │ Amsterdam Direct          ▸  │ │ │
│  │              │ │  └─────────────────────────────┘ │ │
│  └──────────────┘ └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Grid system

Use a **12-column grid** at 1920px:

| Property | Value |
|---|---|
| Columns | 12 |
| Column width | ~130px (varies with gutters) |
| Gutter | 20-24px |
| Content area width | ~1800px (after safe area padding) |
| Vertical rhythm | 8px base unit |

For a simple file browser, a 12-column grid is overkill. Use a single full-width column with consistent horizontal padding.

---

## Navigation Patterns

### Left side navigation (recommended)

The industry-standard pattern for streaming TV apps. **56% of users prefer left navigation** over top navigation.

```
┌──┬─────────────────────────────────────────────────────┐
│🏠│  Content area                                       │
│📁│                                                     │
│🔍│                                                     │
│📺│                                                     │
│⚙ │                                                     │
│  │                                                     │
│  │                                                     │
│  │                                                     │
│  │                                                     │
└──┴─────────────────────────────────────────────────────┘
     Collapsed (icons only): 60-80px wide
```

**Collapsed state:** Show icons only. The nav rail is always visible as a slim vertical strip on the left edge.

**Expanded state:** On left-press from content or direct activation, the nav rail expands to show icon + label (200-280px wide). The content area dims or shifts right.

```
┌──────────┬─────────────────────────────────────────────┐
│ 🏠 Home  │  Content area (dimmed or shifted)           │
│ 📁 Files │                                             │
│ 🔍 Search│                                             │
│ 📺 History│                                            │
│ ⚙ Settings│                                            │
│          │                                             │
│          │                                             │
└──────────┴─────────────────────────────────────────────┘
     Expanded: 200-280px wide
```

**Behavior:**
- Menu starts collapsed on app launch
- Pressing Left from the first focusable content item opens/focuses the nav rail
- Pressing Right from the nav rail closes it and returns focus to content
- Pressing Back from the nav rail closes it
- The "up and over" pattern: user scrolls up through content rows, then presses left to reach the nav — this must work from any scroll position
- Nav items load their section on select (press Enter/OK), not on focus
- Collapsed nav shows a focus indicator on the active section icon

**For put.io:** Use a left side rail with: Home, Files, Search, History, Settings. Keep it minimal — 5 items max.

### Top navigation (alternative)

Less common now. Content occupies the full width, with a horizontal nav bar at the top.

```
┌────────────────────────────────────────────────────────┐
│  Home    Files    Search    History    Settings         │
│  ══════                                                │
│  Content area                                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

Downsides: harder to access when scrolled deep into content. Inconsistent behavior across apps (scroll back to top? overlay?). Use left nav instead.

### Back button behavior

- Always returns to the previous screen / state
- From expanded nav: collapse nav, return focus to content
- From top-level screens (Home, Files root): show exit confirmation or exit app
- Never require a confirmation dialog for Back in normal navigation
- On Samsung Tizen, Back key code is `10009`
- On LG webOS, Back key code is `461`

---

## Focus States

Focus is the most critical UI concept for TV apps. There is no cursor, no hover state — only a single focused element that the user moves with D-pad arrows. The focused element must be **unmistakably visible from 10 feet away**.

### Focus styling techniques

Three primary approaches, often combined:

#### 1. Border / outline (most reliable)

```css
.focusable:focus {
  outline: 3px solid var(--accent);        /* put.io yellow */
  outline-offset: 2px;
}
```

Or use box-shadow for more control (rounded corners, multiple rings):

```css
.focusable:focus {
  box-shadow: 0 0 0 3px var(--accent);
}
```

#### 2. Scale transform (adds depth)

```css
.focusable:focus {
  transform: scale(1.05);
}
```

Scale creates a "pop-out" effect that's visible from distance. Combine with a subtle shadow:

```css
.focusable:focus {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
}
```

**Caution:** When using scale, ensure there's enough spacing between items so the scaled element doesn't overlap neighbors.

#### 3. Background color change

```css
.list-item:focus {
  background-color: var(--bg-tertiary);    /* lighter surface */
}
```

Simple and effective for list items. Often combined with a left accent border:

```css
.list-item:focus {
  background-color: var(--bg-tertiary);
  border-left: 4px solid var(--accent);
}
```

### Recommended focus system for put.io TV

| Component | Focus Style |
|---|---|
| List items (file browser) | Background highlight + left yellow accent border |
| Cards (home screen rows) | Scale(1.05) + border + shadow |
| Nav rail items | Background highlight + yellow left bar |
| Buttons | Background color change (yellow bg, dark text) |
| Settings items | Background highlight |
| Player controls | Scale(1.1) + opacity change |

### Focus state CSS pattern

```css
/* Base focusable element */
.focusable {
  transition: transform 150ms ease-out,
              background-color 150ms ease-out,
              box-shadow 150ms ease-out;
  will-change: transform;
}

/* Focused state */
.focusable.focused,
.focusable:focus {
  background-color: rgba(255, 255, 255, 0.08);
  outline: none;
}

/* List item focused */
.list-item.focused {
  background-color: rgba(253, 206, 69, 0.08);
  border-left: 4px solid #FDCE45;
}

/* Card focused */
.card.focused {
  transform: scale(1.05);
  box-shadow: 0 0 0 2px #FDCE45, 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Button focused */
.btn.focused {
  background-color: #FDCE45;
  color: #0a0a0a;
}
```

### Component states

Every interactive element needs four visual states:

| State | Appearance | Trigger |
|---|---|---|
| Idle (unfocused) | Default appearance | Not focused |
| Focused | Highlighted, visually prominent | D-pad navigates to element |
| Pressed / Active | Brief visual feedback (darken or flash) | Enter/OK pressed on focused element |
| Disabled | Dimmed, no focus ring | Element not interactive |

Use `transition` for smooth state changes. Keep transitions under 200ms — laggy transitions feel unresponsive on TV.

---

## List and Card Patterns

### File list item

The primary UI component for put.io's file browser. Optimized for long file names and minimal metadata.

```
┌────────────────────────────────────────────────────────────┐
│  📁  Folder Name That Might Be Very Long...    12 items ▸ │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  🎬  The.Wire.S03E04.1080p.BluRay...   1.4 GB   2:12:34  │
│      ┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃   │
└────────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Height: 80-96px (single line), 104-120px (with progress bar)
- Left padding: 24px
- Icon area: 40px wide
- Gap after icon: 16px
- Right metadata area: right-aligned, 200-300px
- Progress bar: 4px tall, full width below text, yellow fill on dark track

**Content:**
- File type icon (folder, video, audio, document, archive, subtitle)
- Primary text: parsed filename (or raw if parsing fails), truncated with ellipsis
- Secondary text: file size, duration (video/audio), item count (folders), date
- Progress bar: only for video/audio files with resume position

### Home screen card

For horizontal shelf rows on the home screen. Cards represent files, not media posters.

```
┌──────────────────┐
│                  │
│   File Name      │
│   1.4 GB · MKV   │
│   ━━━━━━━━━━━━━  │  ← progress bar
│                  │
└──────────────────┘
```

**Dimensions:**
- Width: 240-320px
- Height: 120-180px
- Border radius: 8-12px
- Background: `var(--bg-secondary)`
- Gap between cards: 16-20px
- Padding inside card: 16-20px

**Content hierarchy:**
1. File name (primary text, 24-28px, medium weight)
2. Metadata line (secondary text, 20-22px, muted color)
3. Progress bar (4px, at bottom of card)

**Do not use poster images or thumbnails.** put.io has no metadata service. Cards are text-only with file type indicators.

### Search results

Same component as the file browser list. Show results as a vertical list with file type icons. Display a "no results" empty state with helpful text.

---

## Player UI

The video player is full-screen with an overlay UI that auto-hides.

### Player overlay structure

```
┌────────────────────────────────────────────────────────┐
│  The Wire · S03E04 · 1080p BluRay               x265  │  ← title bar
│                                                        │
│                                                        │
│                                                        │
│                                                        │
│                                                        │
│                                                        │
│  ━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ← seek bar
│  1:23:45                                     2:12:34   │  ← time
│  [⏪] [⏯] [⏩]     [🔊]  [CC]  [🔈]  [⚙]       1.0x  │  ← controls
└────────────────────────────────────────────────────────┘
```

### Overlay behavior

- **Auto-hide:** Overlay fades out after 5 seconds of no input
- **Show on input:** Any D-pad press shows the overlay
- **Fade animation:** Opacity transition, 300ms ease-out
- **Background gradient:** Semi-transparent gradient at top and bottom for text readability over video content

```css
.player-overlay-top {
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
  height: 120px;
}

.player-overlay-bottom {
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  height: 200px;
}
```

### Player controls layout

| Element | Position | Size |
|---|---|---|
| Title bar | Top left, 48-60px from top | 32-36px font |
| Codec / quality badges | Top right | 20-24px font, pill-shaped |
| Seek bar | Bottom, full width | 6px track height, 16px knob |
| Current time | Bottom left, below seek bar | 24-28px font |
| Total duration | Bottom right, below seek bar | 24-28px font |
| Transport controls | Bottom center | 40-48px icon size |
| Secondary controls | Bottom right cluster | 32-36px icon size |
| Playback speed | Far bottom right | 24px font |

### Seek bar

```css
.seek-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.seek-bar-progress {
  height: 6px;
  background: #FDCE45;      /* put.io yellow */
  border-radius: 3px;
}

.seek-bar-knob {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FFFFFF;
}

/* Focused state: thicker bar */
.seek-bar-track:focus-within {
  height: 10px;
}
```

### Seek behavior with remote

- **Left/Right tap:** Skip 10 seconds
- **Left/Right hold:** Fast seek (accelerating: 30s, 1m, 5m intervals)
- **OK/Enter on seek bar:** Toggle play/pause
- **Up from seek bar:** Focus transport controls or title area
- **Down from seek bar:** Exit overlay / no-op

### Subtitle and audio track picker

Overlay panel that appears from the right side or as a centered modal:

```
┌──────────────────────────────────────────────┐
│  Subtitles                                   │
│  ──────────────────────────────              │
│  ● English (embedded)                        │
│  ○ English (OpenSubtitles)                   │
│  ○ Spanish (embedded)                        │
│  ○ Off                                       │
│                                              │
│  Audio                                       │
│  ──────────────────────────────              │
│  ● English 5.1 (AC3)                         │
│  ○ English 2.0 (AAC)                         │
│  ○ Commentary (AAC)                          │
└──────────────────────────────────────────────┘
```

Use radio-button style selection (filled circle = selected). Yellow accent for selected item.

---

## Remote Control Button Mapping

### Unified key code map

D-pad arrows, Enter, and Back are the primary controls. Everything else is secondary.

| Button | Samsung Tizen | LG webOS (keydown) | Standard Web | Usage |
|---|---|---|---|---|
| Left | 37 | 37 | `ArrowLeft` (37) | Navigate left |
| Up | 38 | 38 | `ArrowUp` (38) | Navigate up |
| Right | 39 | 39 | `ArrowRight` (39) | Navigate right |
| Down | 40 | 40 | `ArrowDown` (40) | Navigate down |
| Enter / OK | 13 | 13 | `Enter` (13) | Select / confirm |
| Back | **10009** | **461** | `Backspace` (8) | Go back / close |
| Play/Pause | **10252** | 415 | `MediaPlayPause` | Toggle playback |
| Play | 415 | 415 | — | Play |
| Pause | 19 | 119 | — | Pause |
| Stop | 413 | 128 | — | Stop |
| Rewind | 412 | 168 | — | Seek backward |
| Fast Forward | 417 | 208 | — | Seek forward |
| Red | 403 | 403 | — | Color button |
| Green | 404 | 404 | — | Color button |
| Yellow | 405 | 405 | — | Color button |
| Blue | 406 | 406 | — | Color button |
| Volume Up | 447 | 115 | — | System-handled |
| Volume Down | 448 | 114 | — | System-handled |
| Channel Up | 427 | 402 | — | Unused in apps |
| Channel Down | 428 | 403 | — | Unused in apps |

### Key event handling

```javascript
// Platform-agnostic key handler
const KEY_MAP = {
  BACK: [10009, 461, 8, 27],    // Tizen, webOS, Backspace, Escape
  ENTER: [13],
  LEFT: [37],
  UP: [38],
  RIGHT: [39],
  DOWN: [40],
  PLAY_PAUSE: [10252, 415, 179],
  PLAY: [415],
  PAUSE: [19, 119],
  STOP: [413, 128],
  REWIND: [412, 168],
  FAST_FORWARD: [417, 208],
  RED: [403],
  GREEN: [404],
  YELLOW: [405],
  BLUE: [406],
};

function isKey(keyCode, keyName) {
  return KEY_MAP[keyName]?.includes(keyCode);
}

document.addEventListener('keydown', (event) => {
  const { keyCode } = event;

  if (isKey(keyCode, 'BACK')) {
    event.preventDefault();
    handleBack();
  } else if (isKey(keyCode, 'ENTER')) {
    handleSelect();
  }
  // ... etc
});
```

### Samsung Tizen: registering keys

On Samsung Tizen, media keys (Play, Pause, etc.) must be explicitly registered before they fire DOM events. D-pad arrows, Enter, and Back work automatically.

```javascript
// Register media keys on Tizen
if (window.tizen?.tvinputdevice) {
  const mediaKeys = [
    'MediaPlayPause', 'MediaPlay', 'MediaPause',
    'MediaStop', 'MediaRewind', 'MediaFastForward',
    'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'
  ];
  tizen.tvinputdevice.registerKeyBatch(mediaKeys);
}
```

### LG webOS: Magic Remote

LG's Magic Remote has two modes:
- **Pointer mode:** Works like a mouse (cursor on screen). Standard click/mouseover events fire.
- **5-way mode:** Standard D-pad navigation. Activated by pressing any arrow key.

**Your app must support both modes.** Implement mouse event handlers alongside keyboard event handlers. The cursor visibility can be detected via `cursorStateChange` events.

```javascript
// Detect Magic Remote pointer mode
document.addEventListener('webOSMouse', (event) => {
  // event.detail.type: 'cursorStateChange'
  // Pointer cursor appeared or disappeared
});
```

### Vizio: companion library

Vizio apps must load the Vizio companion library for IR remote control support. The library provides callbacks for button presses. Initialize it early:

```javascript
// Vizio: bind callbacks before loading companion library
window.VIZIO = {
  onKeyDown: function(keyCode) {
    // Handle key press
  }
};
```

---

## Focus Management Implementation

### Option 1: Norigin Spatial Navigation (recommended)

React hooks-based library that handles spatial navigation automatically. Production-tested on Samsung Tizen, LG webOS, Hisense VIDAA, and Vizio.

```
npm install @noriginmedia/norigin-spatial-navigation
```

**Key features:**
- Automatic spatial algorithm (no manual "go to X on left press" wiring)
- Focus containers (groups of focusable elements)
- Remembers last focused element when returning to a container
- Supports RTL
- Lightweight, optimized for TV hardware
- ~30,000 weekly npm downloads

**Basic usage pattern:**

```jsx
import { init, useFocusable, FocusContext } from
  '@noriginmedia/norigin-spatial-navigation';

// Initialize once at app start
init({ debug: false, visualDebug: false });

function MenuItem({ label }) {
  const { ref, focused } = useFocusable();

  return (
    <div ref={ref} className={focused ? 'focused' : ''}>
      {label}
    </div>
  );
}

function Menu() {
  const { ref, focusKey } = useFocusable();

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref}>
        <MenuItem label="Home" />
        <MenuItem label="Files" />
        <MenuItem label="Search" />
      </div>
    </FocusContext.Provider>
  );
}
```

### Option 2: Manual focus management

For vanilla JS/TS apps or when you need full control:

```javascript
class FocusManager {
  constructor() {
    this.focusables = [];
    this.currentIndex = 0;
  }

  register(element) {
    this.focusables.push(element);
  }

  moveFocus(direction) {
    // Calculate nearest focusable element in direction
    // Update currentIndex
    // Apply focus styles
  }

  getCurrentElement() {
    return this.focusables[this.currentIndex];
  }
}
```

**Rules for manual focus management:**
- Maintain a single source of truth for the currently focused element
- Never use native browser `:focus` alone — it's unreliable on TV webviews
- Apply focus via CSS classes (`.focused`) managed by JavaScript
- Prevent focus from getting "lost" — always have exactly one focused element
- Remember the last focused element when navigating between containers (e.g., switching from content to nav rail)
- Scroll the focused element into view when it's off-screen
- Handle edge cases: empty lists, loading states, dynamic content changes

### Focus scrolling

When navigating a long list, the focused item must remain visible:

```javascript
function scrollToFocused(container, focusedElement) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = focusedElement.getBoundingClientRect();

  if (elementRect.bottom > containerRect.bottom) {
    container.scrollTop += elementRect.bottom - containerRect.bottom;
  } else if (elementRect.top < containerRect.top) {
    container.scrollTop -= containerRect.top - elementRect.top;
  }
}
```

Use CSS `scroll-behavior: smooth` cautiously — it can feel laggy on low-end TV hardware. Prefer instant scroll or short JS-driven animations.

---

## CSS and Rendering Constraints

### Safe CSS features (M76+ / Tizen 6.0+)

These work reliably across all target platforms:

| Feature | Support | Notes |
|---|---|---|
| Flexbox | Full | Preferred for 1D layouts |
| CSS Grid | Full | Level 1 supported; avoid Level 2/3 |
| CSS Custom Properties | Full | Use for design tokens |
| `transform` | Full | GPU-accelerated, use for animations |
| `opacity` | Full | GPU-accelerated, use for animations |
| `transition` | Full | Keep under 300ms |
| `animation` / `@keyframes` | Full | Use `-webkit-keyframes` as fallback |
| `box-shadow` | Full | Use for focus rings, elevation |
| `border-radius` | Full | Standard support |
| `linear-gradient` | Full | Test for banding on real hardware |
| `overflow: hidden` | Full | Required for scroll containers |
| `position: fixed` | Full | For overlays, nav rail |
| `z-index` | Full | Layer management |
| `text-overflow: ellipsis` | Full | Essential for file names |
| `-webkit-line-clamp` | Full | Multi-line truncation |
| `will-change` | Full | Use sparingly, on animated elements only |
| `calc()` | Full | Supported since M26 |
| Media queries | Full | Use for resolution detection |
| `@font-face` | Full | Custom fonts supported |
| `font-display` | Full | Use `swap` or `optional` |
| CSS Variables (custom properties) | Full | Supported since M49 |
| `object-fit` | Full | For images/video |
| `pointer-events` | Full | Useful for overlay hit areas |
| `::placeholder` | Full | Input styling |
| `backdrop-filter` | M76+ | Blur effects for overlays |

### CSS features to avoid

| Feature | Why |
|---|---|
| Container Queries | Not supported before M105 |
| CSS Nesting | Not supported before M120 |
| Subgrid | Not supported before M117 |
| `oklch()`, `lab()`, `lch()` | Not supported on older Chromium |
| Anchor Positioning | Not supported |
| `@layer` | Not supported before M99 |
| Scroll Snap | Inconsistent behavior on TV webviews |
| CSS `color-mix()` | Not supported before M111 |
| `:has()` selector | Not supported before M105 |
| View Transitions API | Not supported before M111 |
| `@property` | Not supported before M85 |

### CSS properties that hurt performance

These trigger layout recalculation (reflow) and should **never** be animated:

- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `font-size`
- `border-width`

**Only animate `transform` and `opacity`.** These trigger only compositing (GPU-handled), not layout or paint.

```css
/* BAD: animates layout properties */
.item {
  transition: left 300ms, top 300ms;
}

/* GOOD: animates composite-only properties */
.item {
  transition: transform 300ms, opacity 300ms;
  will-change: transform;
}
```

### GPU acceleration hints

Force GPU compositing for elements that will be animated:

```css
.animated-element {
  transform: translateZ(0);    /* Force GPU layer */
  will-change: transform;      /* Hint to browser */
}
```

**Do not apply `translateZ(0)` or `will-change` to everything.** Each GPU layer consumes memory. Only use on elements that actually animate (focus transitions, scroll containers, overlay fade).

---

## Performance Optimization

Smart TVs have **dramatically less processing power** than phones or laptops. A 2021 Samsung TV has roughly the CPU power of a 2015 smartphone. Every optimization matters.

### DOM optimization

- **Limit DOM nodes to under 1,000 visible at any time.** More nodes = slower layout calculations.
- **Virtualize long lists.** If the file browser has 200+ items, render only the visible items plus a small buffer (5-10 items above/below viewport). Remove off-screen DOM nodes.
- **Reuse DOM elements.** When scrolling a list, recycle existing DOM nodes with new content instead of creating/destroying elements.
- **Batch DOM reads and writes separately.** Never interleave `getBoundingClientRect()` calls with style mutations — this causes layout thrashing.

### JavaScript optimization

- **Use local variables over globals.** Local variable access is faster.
- **Cache DOM references.** `const el = document.getElementById('x')` once, not on every frame.
- **Avoid `for...in` loops and `with` statements.**
- **Use `Promise.all()` for parallel async operations** instead of sequential `await`.
- **Lazy-load non-critical code.** Only load what's needed for the current screen. Use dynamic `import()` for route-based code splitting.
- **Minify all JavaScript and CSS.** Every kilobyte matters for launch time.
- **Use Web Workers** for heavy computation (file name parsing, sorting large lists). Note: Service Workers don't work on Tizen's filesystem.

### Image optimization

- **Resize images server-side.** Never load a 4K image and scale it in CSS.
- **Use WebP format** for ~25% size reduction vs. JPEG/PNG.
- **Lazy-load images** with `loading="lazy"` or IntersectionObserver.
- **Avoid image decoding on the main thread** — it blocks rendering.
- For put.io's TV app, images are minimal (file type icons, brand logo). Pre-bundle them as optimized SVGs or small PNGs.

### Animation performance

- **Target 60fps** for all animations. On TV hardware, this means keeping each frame under 16ms.
- **Only animate `transform` and `opacity`** — the only two CSS properties that trigger compositing without layout/paint.
- **Avoid JavaScript-driven animations** with `requestAnimationFrame` on low-end hardware. CSS transitions/animations are hardware-accelerated and more reliable.
- **Use `will-change` sparingly** on elements about to animate.
- **Prefer `transition` over `animation`** for simple state changes (focus transitions).
- **Keep transitions short:** 100-200ms for focus changes, 200-300ms for page transitions.

### Launch time optimization

- **Show the first screen as fast as possible.** Load only essential JS/CSS for the initial render.
- **Display a loading indicator immediately** (even a static splash screen) while scripts load.
- **Preload critical resources:** fonts, icons, first-screen data.
- **Initiate API calls early** — start fetching data before the UI framework finishes initializing.
- **Preconnect to API domains** (limit to 3-4 domains):

```html
<link rel="preconnect" href="https://api.put.io">
<link rel="preconnect" href="https://tv.put.io">
```

### Memory management

- **Monitor memory usage.** TV webviews have limited memory (typically 100-300MB for apps).
- **Clean up event listeners** when navigating away from screens.
- **Nullify references** to large objects when no longer needed.
- **Avoid memory leaks** from closures capturing large scope chains.
- **Use closures selectively** — each closure retains its scope chain in memory.

### Video playback

- **No autoplay of video** — it stalls other loading.
- **No preloading** video content until the user initiates playback.
- **Keep HLS chunks under 200KB** for smooth playback on limited bandwidth.
- **Use Shaka Player or hls.js** for adaptive streaming (HLS/DASH). Shaka Player is well-documented for TV platforms.

---

## Font Loading

put.io uses GT America (Standard + Mono). Custom fonts add latency on TV apps.

### Strategy

```html
<!-- Preload the primary weight -->
<link rel="preload" href="/fonts/gt-america-standard-medium.woff2"
      as="font" type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: 'GT America';
  src: url('/fonts/gt-america-standard-medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;       /* Show fallback immediately, swap when loaded */
}
```

### Rules

- **Preload only the most critical font file** (1 weight). Load additional weights lazily.
- **Use `font-display: swap`** to show text immediately with a system fallback, then swap in the custom font. On TV, invisible text (FOIT) is worse than a brief font swap (FOUT).
- **Subset fonts** to remove unused glyphs. put.io's TV app likely needs Latin + basic symbols only.
- **Use WOFF2 format only** — smallest file size, supported by all target Chromium versions.
- **Bundle fonts with the app** rather than loading from a CDN. TV network connections can be slow, and the app files are served locally from the TV's storage after installation.

---

## Accessibility

TV accessibility is different from web accessibility. There's no screen reader on most smart TVs (Samsung has Voice Guide, LG has Screen Reader, but support varies).

### Required

- **Visible focus indicators at all times.** This is the single most important accessibility requirement for TV.
- **Sufficient color contrast.** Aim for 7:1 for body text (accounts for viewing distance).
- **No color-only information.** Don't rely solely on color to convey state (e.g., error = red). Add icons, text, or shape changes.
- **Adequate text size.** Minimum 20px, preferred 28px+ for body text.
- **Predictable navigation.** D-pad movement must be logical and consistent. Up always goes up, left always goes left.
- **Adequate time for reading.** Toasts and notifications should not auto-dismiss before the user can read them (minimum 5 seconds, or provide manual dismiss).
- **Audio cues combined with visual cues.** Don't use audio alone for feedback.
- **Support external Bluetooth keyboards.** Many TV platforms allow keyboard input for users who find remotes difficult.

### Recommended

- **Text customization in settings:** Font size adjustment (small/medium/large).
- **High contrast mode** option in settings.
- **Logical tab order** matching visual layout (left-to-right, top-to-bottom within regions).
- **Consistent patterns** across all screens — once a user learns the interaction model, it should never change.

---

## Competitive Reference

### How streaming apps handle TV UI

These patterns are useful context, but put.io is a **file browser**, not a content discovery app. Adapt patterns selectively.

| App | Nav Pattern | Content Layout | Focus Style | Notes |
|---|---|---|---|---|
| Netflix | Left rail (collapsed) | Horizontal shelves, poster cards | Scale + border | Custom font (Netflix Sans), heavy personalization |
| Disney+ | Left rail (collapsed) | Horizontal shelves, landscape cards | Scale + highlight | Brand row for each sub-brand |
| Prime Video | Left rail (collapsed) | Horizontal shelves, mixed card sizes | Border + background | Converted from top nav |
| Plex | Left rail (push content) | Horizontal shelves, poster/thumbnail | Border + background | Most relevant to put.io: file-based, user content |
| Apple TV+ | Top tab bar | Horizontal shelves | Scale + shadow | tvOS-native, not web |
| Hulu | Left rail (collapsed) | Horizontal shelves | Scale + border | Part of Disney+ bundle |
| HBO Max | Left rail (collapsed) | Horizontal shelves, hero + cards | Scale + color | "Up and over" nav works well |
| YouTube | Left rail | Horizontal shelves, landscape thumbnails | Border + background | Google's Material Design for TV |

### What to learn from Plex

Plex is the closest analog to put.io on TV — it's user-uploaded content, not studio-provided. Key observations:
- Plex uses metadata from online sources (TMDB, etc.) — put.io does not have this, so card layouts must work without thumbnails
- Plex pushes content aside when nav opens (unique among left-nav apps)
- Plex loads sections on focus (others require select)
- Plex's file browser uses a grid of poster-style cards when metadata exists, falls back to list view when it doesn't

### What NOT to copy from streaming apps

- **Hero carousels with auto-playing trailers.** put.io has no promotional content.
- **Poster/thumbnail grids.** put.io has no metadata images. Use text-based lists.
- **Personalization/recommendation rows.** put.io doesn't curate content.
- **Ad placements or upsell cards.** Not applicable.
- **Content rating badges.** put.io doesn't classify content.

### What to adopt from streaming apps

- **Left rail navigation** — proven, preferred by users, space-efficient
- **Focus state patterns** — scale + border is the most visible from distance
- **Horizontal shelf layout** for the home screen (continue watching, recent files)
- **Player overlay pattern** — gradient backgrounds, auto-hide, transport controls at bottom
- **Seek bar interaction** — tap for 10s skip, hold for fast seek
- **Subtitle/audio track picker** as a side panel overlay
- **Loading states** — skeleton screens or spinner, never blank screens

---

## Quick Reference: Key Values

For agents generating prototypes, here are the concrete values to use:

```css
:root {
  /* Resolution */
  --viewport-width: 1920px;
  --viewport-height: 1080px;

  /* Safe area */
  --safe-padding-x: 60px;
  --safe-padding-y: 48px;

  /* Colors */
  --bg-primary: #0e0e0e;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #252525;
  --text-primary: #e8e8e8;
  --text-secondary: #888888;
  --text-disabled: #555555;
  --accent: #FDCE45;
  --accent-hover: #FDD868;
  --border: #333333;
  --focus-ring: #FDCE45;
  --error: #e55555;
  --success: #4caf50;

  /* Typography */
  --font-family: 'GT America', -apple-system, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'GT America Mono', 'SF Mono', 'Consolas', monospace;
  --font-size-hero: 52px;
  --font-size-h1: 40px;
  --font-size-h2: 32px;
  --font-size-body: 28px;
  --font-size-secondary: 24px;
  --font-size-caption: 20px;
  --font-size-min: 20px;
  --line-height: 1.4;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Components */
  --list-item-height: 88px;
  --list-item-height-with-progress: 112px;
  --card-width: 280px;
  --card-height: 160px;
  --card-gap: 20px;
  --card-radius: 8px;
  --nav-rail-collapsed: 72px;
  --nav-rail-expanded: 240px;
  --icon-size: 36px;
  --icon-size-sm: 24px;
  --progress-bar-height: 4px;

  /* Focus */
  --focus-border-width: 3px;
  --focus-scale: 1.05;
  --focus-transition: 150ms ease-out;

  /* Player */
  --player-seek-height: 6px;
  --player-seek-height-focused: 10px;
  --player-knob-size: 16px;
  --player-control-size: 44px;
  --player-overlay-fade: 300ms;
  --player-auto-hide: 5000ms;
}
```

### Prototype HTML skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920, user-scalable=no">
  <title>put.io TV</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      font-size: var(--font-size-body);
      line-height: var(--line-height);
      -webkit-font-smoothing: antialiased;
    }

    .app-root {
      width: 1920px;
      height: 1080px;
      padding: var(--safe-padding-y) var(--safe-padding-x);
      display: flex;
    }

    .nav-rail {
      width: var(--nav-rail-collapsed);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: var(--space-xl);
      gap: var(--space-lg);
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      padding-left: var(--space-lg);
    }

    .focusable {
      transition: transform var(--focus-transition),
                  background-color var(--focus-transition),
                  box-shadow var(--focus-transition);
    }

    .focusable.focused {
      background-color: rgba(253, 206, 69, 0.08);
    }

    .list-item {
      height: var(--list-item-height);
      display: flex;
      align-items: center;
      padding: 0 var(--space-lg);
      border-radius: var(--card-radius);
      gap: var(--space-md);
    }

    .list-item.focused {
      background-color: rgba(253, 206, 69, 0.08);
      border-left: 4px solid var(--accent);
    }
  </style>
</head>
<body>
  <div class="app-root">
    <nav class="nav-rail">
      <!-- Nav items -->
    </nav>
    <main class="content-area">
      <!-- Screen content -->
    </main>
  </div>
</body>
</html>
```
