# Roku UI Design Reference

Comprehensive reference for building Roku-style TV app prototypes. Covers the Roku design language, SceneGraph component patterns, hardware constraints, and conventions used by major Roku channels.

This document is intended for AI agents generating HTML/CSS prototypes that accurately represent how a Roku channel looks and behaves.

---

## Table of Contents

- [Resolution and Coordinate System](#resolution-and-coordinate-system)
- [Overscan and Safe Zones](#overscan-and-safe-zones)
- [Roku Home Screen and OS Chrome](#roku-home-screen-and-os-chrome)
- [Layout Patterns](#layout-patterns)
- [Navigation Patterns](#navigation-patterns)
- [Focus Management](#focus-management)
- [Remote Control Buttons](#remote-control-buttons)
- [Typography](#typography)
- [Color System](#color-system)
- [Card and Grid Patterns](#card-and-grid-patterns)
- [List Patterns](#list-patterns)
- [Detail View](#detail-view)
- [Video Player UI](#video-player-ui)
- [Dialog and Keyboard Patterns](#dialog-and-keyboard-patterns)
- [SGDEX Standard Views](#sgdex-standard-views)
- [Performance Constraints](#performance-constraints)
- [Certification Requirements](#certification-requirements)
- [Competitive Reference](#competitive-reference)
- [Prototype Guidelines](#prototype-guidelines)

---

## Resolution and Coordinate System

### Display Modes

Roku supports three UI coordinate systems:

| Mode | Resolution | Use Case |
|------|-----------|----------|
| SD | 720x480 | Legacy, not used for new channels |
| HD | 1280x720 | Default for most Roku devices |
| FHD | 1920x1080 | 4K Roku devices (UI plane), recommended for new development |

### Key Facts

- **Design at 1920x1080 (FHD).** Roku auto-downscales to 720p on non-4K hardware. It does NOT upscale correctly from 720 to 1080, so always design FHD-first.
- On non-4K Roku players, the UI plane maxes at 720p even when the video plane outputs 1080p. On 4K players, the UI plane is 1080p while the video plane is 2160p.
- The `ui_resolutions=fhd` manifest flag tells Roku you are providing 1080p assets and coordinates.
- **Avoid odd numbers** in translations, widths, and heights. Odd pixel values do not scale correctly between resolutions.
- All coordinates in this document assume FHD (1920x1080) unless noted otherwise.

### Scaling Math (FHD to HD)

When designing at FHD (1920x1080), Roku scales down to HD (1280x720) by multiplying by 2/3:

```
FHD position/size * 0.6667 = HD equivalent
Example: 90px margin at FHD = 60px at HD
```

---

## Overscan and Safe Zones

TV displays may crop 3-5% of the image on each edge (overscan). Roku defines two safe zones to account for this.

### FHD (1920x1080) Safe Zones

| Zone | Dimensions | Inset from edge | Purpose |
|------|-----------|-----------------|---------|
| **Action Safe** | 1792x968 | 64px left/right, 56px top/bottom | All interactive elements, buttons, icons |
| **Title Safe** | 1664x856 | 128px left/right, 112px top/bottom | All readable text |

### HD (1280x720) Safe Zones

| Zone | Dimensions | Inset from edge | Purpose |
|------|-----------|-----------------|---------|
| **Action Safe** | 1150x646 | 64px left/right, 35px top/bottom | Interactive elements |
| **Title Safe** | 1022x578 | 128px left/right, 70px top/bottom | Readable text |

### Rules

- **Never place text outside Title Safe.** Users on older TVs will not see it.
- **Never place interactive elements outside Action Safe.**
- Background images, gradients, and decorative elements can extend to the full 1920x1080 canvas.
- The Roku OS test overlay tool draws both zones on screen for verification.
- Common practice: use ~90px horizontal margin and ~60px vertical margin from the screen edge for primary content. This sits comfortably inside Action Safe.

---

## Roku Home Screen and OS Chrome

Understanding the Roku OS home screen is essential context for channel design, since users launch into channels from this environment.

### Home Screen Structure (Current: Roku OS 13/14)

The Roku home screen uses a **left-rail menu** with a **right-side content area**:

```
+------------------+----------------------------------------+
|                  |                                        |
|  [Roku Logo]     |   [App Grid - 3 or 4 columns]         |
|                  |                                        |
|  Home         >  |   [App] [App] [App] [App]              |
|  What to Watch   |   [App] [App] [App] [App]              |
|  Live TV         |   [App] [App] [App] [App]              |
|  Search          |   [App] [App] [App] [App]              |
|  Settings        |                                        |
|                  |   [Ad Banner / Content Suggestion]     |
|                  |                                        |
+------------------+----------------------------------------+
```

- **Left rail** is a short, compact vertical menu. Focused items are highlighted with the Roku Purple.
- **Right area** shows installed channels (apps) as a grid of square icons, followed by content suggestions and ads.
- The left rail menu items include: Home, What to Watch, Live TV, Search, Featured Free, Sports, Settings.
- Users can customize which menu items are visible.
- The Roku interface uses a dark purple/charcoal theme by default.

### Roku Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Purple | `#662D91` | Brand identity, focus highlights in OS |
| Midnight Purple | `#1D0033` | Darker variant for accessibility contrast |
| White | `#FFFFFF` | Text on dark backgrounds |
| Dark background | `#1A1A2E` to `#221F3B` | OS background tones |

### Channel Launch Entry Points

Users can enter your channel from:
1. **Home screen** — app icon tap, lands on your home page
2. **Deep link** — search result, Roku search, or external link; can land on any screen (detail, player, category)
3. **Instant Resume** — re-opens channel at last state
4. **Voice command** — Roku voice search

Your navigation scheme must handle all entry points, not just the home page.

---

## Layout Patterns

### Pattern 1: Left Menu + Content Grid (Most Common)

The dominant Roku channel layout. A persistent or collapsible left-side menu with content displayed in horizontal rows to the right.

```
+------------------+--------------------------------------------+
|                  |                                            |
|  [Channel Logo]  |  Category Title                            |
|                  |  [Card] [Card] [Card] [Card] [Card] -->    |
|  > Home          |                                            |
|    Movies        |  Another Category                          |
|    TV Shows      |  [Card] [Card] [Card] [Card] [Card] -->    |
|    My List       |                                            |
|    Search        |  Third Category                            |
|    Settings      |  [Card] [Card] [Card] [Card] [Card] -->    |
|                  |                                            |
+------------------+--------------------------------------------+
```

**Menu behavior:**
- Menu is typically 250-350px wide (FHD).
- When focused, the menu expands or highlights; when content area is focused, the menu collapses or dims.
- Focus moves from menu to content area on Right press. Back or Left from the leftmost content column returns focus to the menu.
- Menu items use a highlight bar or color change to indicate focus.

### Pattern 2: Full-Width Horizontal Rows (RowList)

No persistent left menu. Content fills the full width in horizontal scrolling rows. A top hero/banner area promotes featured content.

```
+------------------------------------------------------------+
|  [Hero Banner - Full Width Featured Content]                |
|  Title, description, play button                           |
+------------------------------------------------------------+
|  Continue Watching                                         |
|  [Card] [Card] [Card] [Card] [Card] [Card] [Card] -->     |
|                                                            |
|  Trending                                                  |
|  [Card] [Card] [Card] [Card] [Card] [Card] [Card] -->     |
|                                                            |
|  Recently Added                                            |
|  [Card] [Card] [Card] [Card] [Card] [Card] [Card] -->     |
+------------------------------------------------------------+
```

**Navigation:**
- Up/Down moves between rows.
- Left/Right scrolls within a row.
- A small navigation bar or tab bar at the top provides category switching.

### Pattern 3: Category List View

Two-column layout: left column is a list of categories, right column shows items for the selected category.

```
+--------------------+--------------------------------------+
|                    |                                      |
|  > Action        |  [Poster] [Poster] [Poster]           |
|    Comedy         |  [Poster] [Poster] [Poster]           |
|    Drama          |  [Poster] [Poster] [Poster]           |
|    Horror         |                                      |
|    Sci-Fi         |                                      |
|                    |                                      |
+--------------------+--------------------------------------+
```

### Pattern 4: File/List Browser (Relevant for put.io)

For content-agnostic apps without poster artwork. Uses a vertical list of items with icons and text.

```
+------------------------------------------------------------+
|  [Breadcrumb: Your Files > Movies > Action]                |
+------------------------------------------------------------+
|                                                            |
|  [Folder Icon]  Sci-Fi Collection              > [folder]  |
|  [Folder Icon]  Comedy                          > [folder]  |
|  [Video Icon]   The.Movie.2024.x265.mkv         2.4 GB    |
|  [Video Icon]   Another.Film.1080p.mp4          1.8 GB    |
|  [Audio Icon]   soundtrack.flac                  340 MB    |
|  [File Icon]    readme.txt                       12 KB     |
|                                                            |
+------------------------------------------------------------+
```

**Key points for file browser on Roku:**
- No poster art, no metadata — just file/folder names and sizes.
- Folder icons (yellow is conventional) and file type icons.
- Focus is a horizontal highlight bar across the full row.
- Breadcrumb or path indicator at the top.
- Right/OK enters a folder or plays a file.
- Left/Back goes up one directory level.

---

## Navigation Patterns

### D-Pad Navigation Model

All Roku navigation uses a 5-way directional pad (Up, Down, Left, Right, OK/Select). There is no pointer, no touch, no mouse.

**Core rules:**
1. **Every focusable element must be reachable via D-pad.** No orphaned elements.
2. **Focus movement must be predictable.** If Right moves horizontally in one section, it must not suddenly move vertically in another.
3. **Back button behavior is strict:** pressing Back must always move the user one step "back" in the navigation hierarchy. From the channel home screen, Back should either exit the channel or show an exit confirmation dialog.
4. **The Home button always exits the channel** and returns to the Roku home screen. Channels cannot intercept Home.

### Navigation Hierarchy (Typical)

```
Home Screen
  +-- Category Row / Menu Item
  |     +-- Content Grid / List
  |           +-- Detail Screen
  |                 +-- Player (fullscreen)
  |                       +-- Player controls overlay
  +-- Search
  |     +-- Search Results
  |           +-- Detail Screen
  +-- Settings
        +-- Setting Sub-pages
```

### Focus Flow Between Zones

When the UI has distinct zones (left menu + content area), focus transfers follow this pattern:

```
Left Menu           Content Area
+---------+         +------------------+
|         |  Right  |                  |
| Menu    | ------> | Row of Cards     |
| Items   | <------ | (first item)     |
|         |  Left   |                  |
+---------+         +------------------+
```

- **Right** from the menu: focus moves to the first (or last-remembered) item in the content area.
- **Left** from the leftmost content item: focus returns to the menu.
- **Up/Down** in the content area: moves between rows.
- **Left/Right** within a row: scrolls horizontally through items.

### Back Button Behavior

| Context | Back Button Action |
|---------|-------------------|
| Player controls visible | Hide controls |
| Player (no controls) | Exit player, return to detail/list |
| Detail screen | Return to grid/list |
| Sub-menu / sub-page | Return to parent |
| Channel home screen | Exit channel (or show exit dialog) |
| Search with results | Clear results or close search |

---

## Focus Management

Focus management is the most critical UX concept on Roku. There is always exactly one focused element on screen.

### Focus States

Every interactive element has three visual states:

| State | Description | Visual Treatment |
|-------|-------------|-----------------|
| **Unfocused** | Default state | Normal appearance, no highlight |
| **Focused** | Currently selected via D-pad | Highlighted — see methods below |
| **Focus Footprint** | Element was focused but its container lost focus | Dimmed highlight, shows where focus will return |

### Focus Indicator Methods

Roku channels use several approaches to indicate focus:

#### 1. Highlight Rectangle (Most Common)

A colored rectangle or 9-patch bitmap drawn behind/around the focused item.

```css
/* Prototype CSS equivalent */
.card:focus {
  outline: 4px solid #FFFFFF;
  /* or */
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.9);
}
```

- Roku uses `focusBitmapUri` to set a 9-patch PNG as the focus indicator on lists and grids.
- Default focus indicator is a light-colored rounded rectangle border.
- Custom channels often use a white or brand-colored border/glow.

#### 2. Scale Transform

Focused item scales up slightly (1.05x - 1.1x) to "pop" from the row.

```css
/* Prototype CSS equivalent */
.card:focus {
  transform: scale(1.08);
  z-index: 10;
  transition: transform 0.15s ease-out;
}
```

- Common for poster grids and card rows.
- The scaling animation is fast: 100-200ms.
- Surrounding items do not move; the focused item overlaps neighbors slightly.

#### 3. Color/Opacity Change

Focused items become fully opaque or brighter; unfocused items are dimmed.

```css
/* Prototype CSS equivalent */
.card { opacity: 0.7; }
.card:focus { opacity: 1.0; }
```

#### 4. Inline Detail Reveal

When a card receives focus, additional information appears below or beside it (title, description, metadata). This is the pattern used by Netflix and Plex.

```css
/* Prototype CSS equivalent */
.card:focus .card-info {
  display: block;
  opacity: 1;
  transform: translateY(0);
}
```

#### 5. Background Morph

The entire screen background changes to match the focused item's artwork or color palette. Used by Plex's "Modern" layout.

### Focus Footprint

When a container (like the content area) loses focus to another container (like the left menu), the last-focused item in the content area displays a "footprint" — a dimmed version of the focus indicator. This tells the user where focus will return when they navigate back.

```css
/* Prototype CSS equivalent */
.card.focus-footprint {
  outline: 2px solid rgba(255, 255, 255, 0.3);
}
```

### Focus Animation

- Focus transitions should complete in **100-200ms**.
- Use ease-out or ease-in-out curves.
- Roku's `Vector2DFieldInterpolator` animates position and scale for focus effects.
- Keep animations subtle. Aggressive animations cause motion sickness and feel laggy on low-end hardware.

---

## Remote Control Buttons

The standard Roku remote has these buttons, and channels must handle them appropriately:

### Navigation Buttons

| Button | Key Code | Function |
|--------|----------|----------|
| **Up** | 2 | Move focus up |
| **Down** | 3 | Move focus down |
| **Left** | 4 | Move focus left |
| **Right** | 5 | Move focus right |
| **OK / Select** | 6 | Confirm/activate focused item |
| **Back** | 0 | Go back one level |
| **Home** | 10 | Exit to Roku home (system-handled) |

### Playback Buttons

| Button | Key Code | Function |
|--------|----------|----------|
| **Play/Pause** | 13 | Toggle playback |
| **Rewind** | 8 | Rewind / seek backward |
| **Fast Forward** | 9 | Fast forward / seek forward |
| **Instant Replay** | 7 | Jump back ~10 seconds |

### Utility Buttons

| Button | Key Code | Function |
|--------|----------|----------|
| **Options / Star (*)** | 10 | Context menu, additional options |
| **Info** | — | Show/hide info overlay (on some remotes) |

### Button Behavior During Playback

- **Play/Pause**: toggles play/pause state.
- **Rewind (single press)**: starts rewinding at 1x speed. Additional presses increase speed (2x, 4x, 8x...).
- **Fast Forward (single press)**: starts fast forwarding at 1x. Additional presses increase speed.
- **Left/Right arrows**: seek backward/forward by ~10 seconds per press.
- **Instant Replay**: jumps back 10 seconds from current position.
- **OK**: if controls are hidden, shows transport bar. If visible, toggles play/pause or selects focused control.
- **Back**: hides transport overlay, or exits player.

---

## Typography

### System Fonts

Roku includes a set of built-in system fonts. Channels that do not bundle custom fonts get these:

| System Font Name | Approximate Style | Typical Use |
|-----------------|-------------------|-------------|
| `SmallestSystemFont` | ~16px regular | Fine print, metadata |
| `SmallSystemFont` | ~20px regular | Secondary labels |
| `MediumSystemFont` | ~24px regular | Body text |
| `MediumBoldSystemFont` | ~24px bold | Emphasized body text |
| `LargeSystemFont` | ~32px regular | Subheadings |
| `LargeBoldSystemFont` | ~32px bold | Section titles |
| `LargestSystemFont` | ~40px regular | Page titles |
| `LargestBoldSystemFont` | ~40px bold | Hero titles |

The default Roku system font family resembles **Gotham Rounded** — a geometric sans-serif with rounded terminals.

### Custom Font Support

- Roku supports **TrueType (.ttf)** and **OpenType (.otf)** fonts only.
- Custom fonts are bundled in the channel package and loaded via `Font` node or `roFontRegistry`.
- Each font family + size combination allocates 32-88 KB of texture memory.
- Minimize the number of font families and sizes to conserve texture memory on low-end devices.

### TV Typography Scale (10-Foot Design)

For couch viewing at 8-12 feet, text must be significantly larger than desktop/mobile:

| Role | Size (FHD) | Weight | Usage |
|------|-----------|--------|-------|
| Hero title | 48-64px | Bold | Featured content title |
| Page title | 36-48px | Bold | Screen titles, section headers |
| Section header | 28-32px | Bold/Semi-bold | Row titles, category names |
| Card title | 22-26px | Medium/Semi-bold | Item titles below cards |
| Body text | 20-24px | Regular | Descriptions, metadata |
| Secondary text | 18-20px | Regular | Timestamps, file sizes, counts |
| Caption / metadata | 14-16px | Regular | Minimum readable size for TV |
| Fine print | 12-14px | Regular | Absolute minimum, avoid if possible |

### Typography Rules

- **Minimum readable size is 18px at FHD** (12px at HD). Anything smaller is illegible from couch distance.
- Use **high contrast** (white on dark or near-black on light). Avoid mid-gray text on dark backgrounds.
- **Line length**: keep text to ~60 characters max per line. Long descriptions should truncate with ellipsis.
- **Line spacing**: 1.3-1.5x the font size for readability.
- Avoid thin/light font weights on TV. They disappear on lower-quality displays. Use Regular or Medium as the minimum weight.
- For prototypes, use **system-ui, "Helvetica Neue", sans-serif** as a reasonable stand-in for Roku system fonts. For higher fidelity, use Gotham Rounded or Nunito (visually similar, freely available).

---

## Color System

### Dark-First Design

Roku channels are almost universally dark-themed. A dark UI reduces eye strain in dim living rooms, makes content (posters, video thumbnails) pop, and aligns with the Roku OS aesthetic.

### Recommended Color Palette for Roku Channels

| Token | Hex | Usage |
|-------|-----|-------|
| `background-primary` | `#1A1A2E` or `#121212` | Main screen background |
| `background-secondary` | `#222236` or `#1E1E1E` | Cards, elevated surfaces |
| `background-tertiary` | `#2A2A40` or `#2C2C2C` | Menu background, sidebar |
| `surface-focused` | `#3A3A52` or `#383838` | Focused item background |
| `text-primary` | `#FFFFFF` or `#F0F0F0` | Primary text, titles |
| `text-secondary` | `#AAAAAA` or `#B0B0B0` | Subtitles, metadata, descriptions |
| `text-tertiary` | `#777777` or `#808080` | Timestamps, fine print |
| `accent-primary` | Brand color | Focus rings, active states, buttons |
| `accent-secondary` | Lighter brand tint | Highlights, selection indicators |
| `divider` | `#333344` or `#333333` | Separator lines between list items |
| `overlay` | `rgba(0,0,0,0.6-0.8)` | Player controls background, dialogs |
| `error` | `#E53935` | Error states |
| `success` | `#43A047` | Confirmation, completed states |

### Color Usage Rules

- **Background**: always dark. Pure black (`#000000`) is acceptable but `#121212` or `#1A1A2E` feels richer.
- **Text on dark**: white (`#FFFFFF`) for primary, light gray for secondary. Maintain WCAG AA contrast ratio (4.5:1 minimum for body text, 3:1 for large text).
- **Focus indicators**: white borders/outlines are the most common. Brand-colored focus is also used.
- **Avoid bright, saturated backgrounds** for content areas. They fight with poster artwork.
- **Gradients**: use sparingly. Linear gradients from transparent to background color are common for text-over-image overlays (e.g., hero banners).
- **Roku OS purple** (`#662D91`): only for the OS itself. Channels should use their own brand color.

### Surface Elevation (No Shadows)

Unlike Material Design, Roku UIs do not use drop shadows for elevation. Instead, surfaces are differentiated by **background color value** (lighter = higher):

```
Background:  #121212  (lowest)
Card:        #1E1E1E  (elevated)
Menu:        #252525  (elevated)
Focused:     #333333  (highest)
```

---

## Card and Grid Patterns

### Poster Grid (PosterGrid Component)

A fixed grid of poster images. All items are the same size.

```
[Poster] [Poster] [Poster] [Poster] [Poster]
[Poster] [Poster] [Poster] [Poster] [Poster]
[Poster] [Poster] [Poster] [Poster] [Poster]
```

**Configuration:**
- `basePosterSize`: the pixel dimensions of each poster. Common sizes at FHD:
  - Portrait poster: 210x300, 240x360, 270x400
  - Landscape poster: 356x200, 400x225, 480x270
  - Square: 210x210, 240x240
- `numColumns`: number of columns visible (typically 4-7 for landscape, 5-8 for portrait)
- `numRows`: number of visible rows before scrolling
- `itemSpacing`: gap between items. Typically `[20, 20]` to `[30, 30]` at FHD
- Caption lines can appear below each poster (1-2 lines)

### Poster Shapes (posterShape Field)

Roku's built-in poster shapes:

| Shape | Aspect Ratio | Use Case |
|-------|-------------|----------|
| `portrait` | 2:3 | Movie posters, book covers |
| `landscape` | 16:9 | Video thumbnails, show art |
| `square` | 1:1 | Album art, app icons, avatars |
| `arced-portrait` | 2:3 rounded | Softer poster look |
| `arced-landscape` | 16:9 rounded | Rounded thumbnail |
| `arced-square` | 1:1 rounded | Rounded album art |

### Horizontal Scrolling Row (RowList Component)

The signature Roku/TV layout. Multiple horizontal rows stacked vertically.

```
Row Title 1
[Card] [Card] [Card] [Card] [Card] ... (scrolls right)

Row Title 2
[Card] [Card] [Card] [Card] [Card] ... (scrolls right)

Row Title 3
[Card] [Card] [Card] [Card] [Card] ... (scrolls right)
```

**Behavior:**
- Up/Down selects a row.
- Left/Right scrolls within the focused row.
- Only the focused row scrolls; other rows remain static.
- Row title appears above each row (section header).
- Typically 1 row is focused at a time; the entire list scrolls vertically to keep the focused row visible.

**Dimensions (FHD):**
- Row height: poster height + caption height + spacing. Typically 280-400px per row.
- Item spacing within row: 16-30px horizontal.
- Row spacing (vertical): 40-60px between rows.
- Row title height: 30-40px above the row.
- Visible items per row: 4-7 depending on poster size.
- Content left margin: ~90px from screen edge (inside Action Safe).

### MarkupGrid (Custom Grid)

A fully customizable grid where each cell is a custom component. Allows mixing text, images, badges, and progress bars within each cell.

```
+---------------------------+
| [Image]                   |
| Title                     |
| Subtitle                  |
| [Progress Bar ====----]   |
+---------------------------+
```

- Used for "Continue Watching" rows with progress indicators.
- Each item can have any layout defined in XML.
- More expensive to render than PosterGrid — use when needed.

---

## List Patterns

### LabelList

A simple vertical list of text labels. Used for menus, settings, and category navigation.

```
  > Option A          (focused - highlighted)
    Option B
    Option C
    Option D
    Option E
```

**Behavior:**
- Up/Down moves through items.
- OK/Select activates the focused item.
- Focus indicator is a horizontal highlight bar.
- Text color changes on focus (e.g., white when focused, gray when not).

**Dimensions (FHD):**
- Item height: 60-80px
- Font size: 24-28px
- Left padding: 30-40px
- Width: 250-400px for side menus

### MarkupList (Custom List)

Like MarkupGrid but in a single-column vertical list. Each row is a custom component.

```
+------------------------------------------------------+
| [Icon]  File Name                           Size     |
|         Metadata / subtitle                          |
+------------------------------------------------------+
| [Icon]  Another File                        Size     |
|         Metadata                                     |
+------------------------------------------------------+
```

- Used for file browsers, settings screens, search results.
- Each item can have icons, multiple text fields, badges, and action indicators.
- Focus highlight is a full-width horizontal bar.

### Horizontal List (For Tab/Category Selection)

```
[All]  [Movies]  [TV Shows]  [Music]  [Documents]
```

- Left/Right moves between tabs.
- Focused tab is highlighted or underlined.
- Content below updates when tab selection changes.

---

## Detail View

The detail screen shows information about a selected item before playback or action.

### Standard Media Detail Layout

```
+------------------------------------------------------------+
|                                                            |
|  +----------+   Title of Content                           |
|  |          |   Year  |  Duration  |  Rating               |
|  | [Poster] |                                              |
|  |          |   Description text that can wrap to           |
|  |          |   two or three lines with ellipsis...         |
|  +----------+                                              |
|                                                            |
|  [> Play]  [Add to List]  [More Info]                      |
|                                                            |
+------------------------------------------------------------+
```

**Layout details (FHD):**
- Poster: ~300x450 (portrait) or ~480x270 (landscape), positioned left.
- Title: 36-48px bold, to the right of the poster.
- Metadata row: 18-22px, secondary color.
- Description: 20-24px, 2-4 lines max with ellipsis truncation.
- Action buttons: horizontal row below description. Focused button is highlighted.
- Background: often a blurred or darkened version of the poster art (if available), or a solid dark color.

### File Detail Layout (For put.io)

For a file manager without media metadata:

```
+------------------------------------------------------------+
|                                                            |
|  [File Type Icon]                                          |
|                                                            |
|  file-name.mkv                                             |
|  2.4 GB  |  Video  |  Added 2 days ago                    |
|                                                            |
|  [> Play]  [Download]  [Delete]  [Move]                    |
|                                                            |
+------------------------------------------------------------+
```

---

## Video Player UI

### Player States

| State | UI |
|-------|-----|
| Loading | Spinner overlay on black/video frame |
| Playing (controls hidden) | Full-screen video, no UI. Appears after 5-8s of inactivity |
| Playing (controls visible) | Transport bar overlay at bottom, info at top |
| Paused | Transport bar visible, "Paused" indicator, controls remain |
| Seeking / Trick Play | Progress bar with thumbnail preview strip |
| Buffering | Spinner overlay, transport bar may remain visible |
| Error | Error message overlay with retry option |

### Transport Bar Layout (Controls Visible)

```
+------------------------------------------------------------+
|  Title of Content                              01:23:45     |
|  S2 E5 "Episode Name"                                      |
+------------------------------------------------------------+
|                                                            |
|              (full-screen video plays here)                 |
|                                                            |
+------------------------------------------------------------+
|                                                            |
|  00:34:12  [============================--------]  01:23:45|
|            [<<]   [|>]   [>>]    [CC]   [Audio]            |
|                                                            |
+------------------------------------------------------------+
```

**Top overlay:**
- Content title, episode info.
- Current time or time remaining.
- Fades in/out with controls.
- Background: gradient from black (top) to transparent.

**Bottom overlay (Transport Bar):**
- Progress bar: filled portion + buffered portion + remaining.
- Current time (left) and total duration (right).
- Playback controls: rewind, play/pause, fast forward.
- Additional buttons: closed captions (CC), audio track selector, subtitle selector.
- Background: gradient from transparent (top) to black (bottom).

**Dimensions (FHD):**
- Transport bar height: ~160-200px from bottom edge.
- Progress bar: full width minus ~120px margins.
- Progress bar thickness: 4-6px (unfocused), 8-10px (focused).
- Control button size: 40-60px icons.
- Control button spacing: 40-60px between buttons.

### Trick Play (Scrubbing)

When the user scrubs through content:

```
+------------------------------------------------------------+
|                                                            |
|              +-------------------+                         |
|              | [Thumbnail Frame] |                         |
|              | 00:45:23          |                         |
|              +-------------------+                         |
|                      |                                     |
|  00:34:12  [=========|==================--------]  01:23:45|
|                                                            |
+------------------------------------------------------------+
```

- A thumbnail preview (BIF image or HLS/DASH I-frame) appears above the scrub position.
- Thumbnail size: ~256x144 to ~320x180 (16:9 at small size).
- The scrub position indicator moves along the progress bar.
- Standard HLS/DASH thumbnails are now the recommended approach (replaces legacy BIF format).

### Player Control Icons

| Icon | Function |
|------|----------|
| Rewind arrows (<<) | Rewind at increasing speeds |
| Play triangle / Pause bars | Toggle play/pause |
| Fast forward arrows (>>) | Fast forward at increasing speeds |
| CC icon | Toggle closed captions |
| Audio waveform icon | Audio track selection |
| Subtitle icon | Subtitle track selection |
| 10s back arrow | Jump back 10 seconds (Instant Replay) |
| Gear icon | Playback settings (quality, speed) |

---

## Dialog and Keyboard Patterns

### Standard Dialogs (Standard Dialog Framework)

Roku provides pre-built dialog components (Roku OS 10.0+):

#### Message Dialog

```
+----------------------------------+
|                                  |
|  Dialog Title                    |
|                                  |
|  Message body text that can      |
|  wrap to multiple lines.         |
|                                  |
|  [> OK]          [Cancel]        |
|                                  |
+----------------------------------+
```

- Centered on screen.
- Semi-transparent dark overlay behind dialog.
- Dialog background: dark surface color (e.g., `#2A2A40`).
- Corner radius: 8-12px.
- Button row at bottom, horizontally arranged.
- Focused button is highlighted.

#### Keyboard Dialog (StandardKeyboardDialog)

```
+----------------------------------------------+
|                                              |
|  Enter Search Term                           |
|                                              |
|  [___________________________________]       |
|                                              |
|  q w e r t y u i o p                         |
|   a s d f g h j k l                          |
|    z x c v b n m                             |
|  [Space]  [Delete]  [?123]  [Done]           |
|                                              |
+----------------------------------------------+
```

**Keyboard layout:**
- Full QWERTY layout.
- D-pad navigates between keys. OK presses the focused key.
- Special keys: Space, Delete/Backspace, ?123 (symbols), #+= (more symbols), Done/Submit.
- Options button (star *) toggles caps lock.
- Voice entry support on remotes with microphone.
- Text input field at top shows typed text with cursor.
- Keyboard background: dark surface.
- Focused key: highlighted rectangle.

#### PIN Pad Dialog (StandardPinPadDialog)

```
+---------------------------+
|                           |
|  Enter PIN                |
|                           |
|  [ * * * _ ]              |
|                           |
|  [1] [2] [3]              |
|  [4] [5] [6]              |
|  [7] [8] [9]              |
|      [0]                  |
|                           |
|  [Submit]                 |
|                           |
+---------------------------+
```

#### Progress Dialog

```
+----------------------------------+
|                                  |
|  Loading...                      |
|                                  |
|  [Spinner Animation]             |
|                                  |
+----------------------------------+
```

### Custom Dialogs

Channels can build custom dialogs with combinations of:
- Text blocks
- Bulleted lists
- Buttons (horizontal or vertical)
- Keyboard / PIN pad
- Loading spinners
- Custom graphics

---

## SGDEX Standard Views

SceneGraph Developer Extensions (SGDEX) provides four pre-built full-screen view components that embody Roku's standard UX patterns:

### GridView

Full-screen content grid with row-based layout. Each row can have a title and horizontally scrolling items.

**Customizable fields:**
- `style`: grid style (standard, hero, etc.)
- `posterShape`: portrait, landscape, square, arced variants
- Row count, item count, item sizes
- Focus behavior and animation

### DetailsView

Shows item details with poster, title, description, and action buttons.

**Customizable fields:**
- Content metadata display
- Button list (Play, Add to List, etc.)
- Poster position and size
- Background image/color

### CategoryListView

Two-panel view: categories on the left, items for the selected category on the right. Similar to the Roku Channel Store browse experience.

**Customizable fields:**
- Category list (left panel)
- Item display style (right panel)
- Poster shape per category

### MediaView

Full-screen video/audio player with built-in transport controls, trick play, and content queue management.

**Customizable fields:**
- Transport bar visibility and style
- Trick play thumbnail support
- Content playlist handling
- endcardView for "up next" screen

---

## Performance Constraints

These hardware and rendering limitations directly affect design decisions on Roku.

### Texture Memory

| Device Tier | Approximate Texture Memory | Notes |
|------------|---------------------------|-------|
| Low-end (Roku Express, older sticks) | ~95 MB total | Shared with Roku OS |
| Mid-range (Roku Streaming Stick+) | ~128-196 MB | Still constrained |
| High-end (Roku Ultra, Roku TV) | ~256 MB+ | More headroom |

**Image memory formula:** `width x height x 4 bytes` (RGBA)

A single 1920x1080 image = ~8.3 MB of texture memory. On a low-end device with ~95 MB total (shared with OS), you can run out fast.

**Design implications:**
- **Request appropriately-sized images.** Do not load 1920x1080 images for 200x300 poster slots.
- Use image resizing services on the backend to serve the exact dimensions needed.
- Prefer stretching simple elements (gradients, solid colors) over using large bitmap backgrounds.
- Limit the number of visible images on screen. Lazy-load off-screen rows.
- Reuse textures where possible (e.g., same focus indicator bitmap for all items).

### Rendering Limitations

| Limitation | Description | Design Workaround |
|-----------|-------------|-------------------|
| **No runtime blur** | Cannot dynamically blur images or video frames | Use pre-blurred static images as backgrounds |
| **No shader effects** | Cannot tint icons or elements with color shaders | Provide pre-colored image variants |
| **Limited rotation** | Only 0, 90, 180, 270 degree rotations on some hardware | Avoid arbitrary angle rotations |
| **No 3D transforms** | No perspective, no z-rotation, no 2.5D effects | Keep UI flat |
| **Limited gradients** | Gradient rendering may show banding on low-end devices | Use subtle gradients, pre-rendered when possible |
| **No CSS-like box shadows** | No dynamic shadow rendering | Use elevation through color difference only |
| **Layout constraints** | LayoutGroup exists but does not support per-item margin, padding, or gravity | Manual positioning with Translation coordinates |

### Animation Performance

- Keep animations to **translation** and **scale** (hardware-accelerated).
- Avoid animating opacity on many items simultaneously.
- Limit concurrent animations to 2-3 at most.
- Animation duration: 100-300ms max for UI transitions.
- Frame rate target: 30fps for UI, 60fps is not guaranteed on all devices.
- Complex list/grid scrolling should be tested on low-end hardware.

### General Performance Rules

- **Channel launch time**: must be under 15 seconds (certification requirement). Target under 5 seconds.
- **Screen transition time**: target under 2 seconds for all screen loads.
- **Lazy load content**: do not load all rows/items at once. Load visible content first, then backfill.
- **Minimize node count**: every SceneGraph node has overhead. Flatten UI hierarchy where possible.
- **Recycle list items**: RowList and MarkupGrid recycle off-screen items. Design with this in mind.

---

## Certification Requirements

Roku requires all channels to pass certification before publishing. Key UX-related requirements:

### Must-Have UX Requirements

- **Back button**: must always navigate backward in the hierarchy. Must not be intercepted or repurposed.
- **Home button**: must always exit to Roku home. Cannot be intercepted.
- **No infinite loops**: user must always be able to exit your channel.
- **Loading indicators**: any operation taking more than 2 seconds must show a loading indicator.
- **Error handling**: network errors must show user-friendly messages with retry options.
- **Deep linking**: channels must handle incoming deep links and launch to the correct content.
- **Bookmarking**: video playback position should be saved (resume watching).
- **Responsiveness**: UI must respond to remote input within 500ms.
- **No blank screens**: every state must have visual content or a loading indicator.

### Technical Requirements (2026+)

- Must declare RSG 1.3 support in manifest (RSG 1.2 deprecated October 2026).
- Must integrate BrightScript Memory Monitor APIs (required October 2026).
- Must pass Static Analysis automated testing.
- Must pass Channel Behavior Analysis for subscription/ad-supported apps.

---

## Competitive Reference

### How Major Apps Look on Roku

#### Netflix on Roku

- Full-width RowList layout (no persistent left menu).
- Top navigation bar: Home, TV Shows, Movies, New & Popular, My List.
- Hero banner at top for featured content with background art.
- Horizontal rows of landscape (16:9) thumbnails.
- Focus: card scales up slightly, title/metadata appears below.
- Dark background (~`#141414`).
- Red accent color for brand, white text.

#### YouTube on Roku

- Top navigation bar with categories.
- Horizontal scrolling rows of video thumbnails (16:9).
- Focus: white border around thumbnail, title below.
- Left sidebar for navigation (Home, Subscriptions, Library).
- Dark background, white text, red accent.

#### Plex on Roku

- Left sidebar navigation (Home, Movies, TV Shows, Music, Libraries).
- Horizontal RowList layout for content.
- "Modern" layout: focuses on artwork, shows inline detail on focus, background morphs to match selected item's palette.
- Poster art focused: portrait posters for movies, landscape for shows.
- Dark surface colors, orange brand accent.
- Recently updated: sidebar removed in favor of top tabs in some versions.

#### Infuse-Style Apps

- File browser with folder/file list.
- Metadata-enriched views when metadata is available.
- Clean, cinematic detail screens.
- Custom player with elegant transport controls.

### Common Patterns Across All Major Roku Apps

1. **Dark theme** — every major app uses a dark background.
2. **Horizontal scrolling rows** — the dominant content browsing pattern.
3. **Focus = highlight + optional scale** — all apps clearly indicate focus.
4. **Transport bar at bottom** — all players put controls at the bottom with a progress bar.
5. **Top or left navigation** — categories are accessed via top bar or left rail.
6. **Lazy loading** — rows load content as they come into view.
7. **Minimal text on browse screens** — titles only; descriptions appear on focus or detail screen.

---

## Prototype Guidelines

When building HTML/CSS prototypes that represent a Roku UI:

### Canvas and Layout

```css
/* Roku FHD canvas */
.roku-screen {
  width: 1920px;
  height: 1080px;
  background: #121212;
  overflow: hidden;
  position: relative;
  font-family: system-ui, "Helvetica Neue", -apple-system, sans-serif;
  color: #FFFFFF;
}

/* Action Safe area */
.roku-safe-area {
  position: absolute;
  top: 56px;
  left: 64px;
  right: 64px;
  bottom: 56px;
}

/* Title Safe area (for text content) */
.roku-title-safe {
  position: absolute;
  top: 112px;
  left: 128px;
  right: 128px;
  bottom: 112px;
}

/* Common content margin (comfortable safe zone) */
.roku-content {
  padding: 60px 90px;
}
```

### Focus Simulation

```css
/* Simulate D-pad focus with CSS :focus */
.roku-focusable {
  outline: none;
  transition: transform 0.15s ease-out,
              outline 0.15s ease-out,
              opacity 0.15s ease-out;
}

.roku-focusable:focus {
  outline: 4px solid #FFFFFF;
  outline-offset: 4px;
  transform: scale(1.05);
  z-index: 10;
}

/* Focus footprint (unfocused container, remember last position) */
.roku-focusable.footprint {
  outline: 2px solid rgba(255, 255, 255, 0.25);
  outline-offset: 4px;
}

/* Unfocused items in a row are slightly dimmed */
.roku-row .roku-focusable:not(:focus) {
  opacity: 0.85;
}
```

### Card Component

```css
.roku-card {
  width: 356px;         /* landscape 16:9 */
  flex-shrink: 0;
  cursor: pointer;
}

.roku-card-image {
  width: 356px;
  height: 200px;
  background: #2A2A2A;
  border-radius: 8px;
  overflow: hidden;
  object-fit: cover;
}

.roku-card-title {
  margin-top: 12px;
  font-size: 22px;
  font-weight: 500;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.roku-card-subtitle {
  margin-top: 4px;
  font-size: 18px;
  color: #AAAAAA;
}
```

### Horizontal Scrolling Row

```css
.roku-row {
  margin-bottom: 48px;
}

.roku-row-title {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 20px;
  padding-left: 90px;
}

.roku-row-items {
  display: flex;
  gap: 24px;
  padding-left: 90px;
  overflow-x: hidden;  /* Roku does not show scrollbars */
}
```

### Left Menu

```css
.roku-menu {
  width: 300px;
  background: #1A1A2E;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.roku-menu-item {
  padding: 16px 40px;
  font-size: 24px;
  color: #888888;
  cursor: pointer;
  border-left: 4px solid transparent;
}

.roku-menu-item:focus,
.roku-menu-item.active {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.08);
  border-left-color: #FFFFFF;
}
```

### Transport Bar

```css
.roku-transport {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 90px 50px;
  background: linear-gradient(transparent, rgba(0,0,0,0.9));
}

.roku-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-bottom: 20px;
  position: relative;
}

.roku-progress-fill {
  height: 100%;
  background: #FFFFFF;
  border-radius: 2px;
}

.roku-transport-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
}

.roku-transport-btn {
  width: 48px;
  height: 48px;
  color: #FFFFFF;
  opacity: 0.8;
}

.roku-transport-btn:focus {
  opacity: 1;
  transform: scale(1.15);
}
```

### Do and Don't

| Do | Don't |
|----|-------|
| Design at 1920x1080 | Design at 1280x720 or arbitrary sizes |
| Use dark backgrounds (#121212 to #1A1A2E) | Use light/white backgrounds |
| Keep text 18px+ at FHD | Use text smaller than 14px |
| Show focus state on every interactive element | Leave elements without focus indicators |
| Use horizontal scrolling rows for content | Use vertical scrolling grids (desktop pattern) |
| Respect 90px+ horizontal margins | Place content at screen edges |
| Use opacity/color change for focus | Use blur, shadows, or 3D transforms for focus |
| Truncate long text with ellipsis | Let text wrap indefinitely |
| Pre-render complex visual effects as static images | Expect runtime blur, tinting, or shader effects |
| Test with D-pad navigation (keyboard arrows) | Rely on mouse hover/click patterns |

---

## Additional Notes for put.io

Based on the [put.io TV app spec](../docs/specs/tv-app.md) and [design feedback](../.claude/projects/-Users-glitch-projects-putio-design/memory/feedback_tv_file_browsing.md):

- **put.io is a file manager, not a media library.** There are no posters, no metadata, no album art. The UI must work with raw file and folder names.
- Use the **file/list browser pattern** (Pattern 4 above), not Netflix-style poster grids.
- Folder icons (yellow) and file-type icons do the visual work. Typography and spacing carry the design.
- The put.io TV app currently uses tvOS and Android TV. Roku is deferred (Tier 3) but community-built from specs is possible.
- If Roku is built, it would be BrightScript/SceneGraph — a completely separate codebase from the Swift/Kotlin native apps.
- Player UI should support MKV, x265, DTS, and other formats natively if VLC-kit equivalent exists for Roku (unlikely — Roku uses its own media player).
