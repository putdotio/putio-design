---
title: "tvOS 26 Liquid Glass UI — Design Reference"
created: 2026-03-19
purpose: Reference for AI agents building tvOS-style prototypes
sources: Apple HIG, WWDC 2025, developer documentation, community references
---

# tvOS 26 Liquid Glass UI — Design Reference

Comprehensive reference for building TV app prototypes that follow Apple's tvOS 26 design language. Covers layout, focus, typography, color, navigation, glass effects, player UI, and platform conventions.

**Hardware note:** Liquid Glass requires Apple TV 4K (2nd gen+). Older devices get tvOS 26 without glass effects (frosted fallback).

---

## Table of Contents

- [Screen and Layout](#screen-and-layout)
- [Liquid Glass Material](#liquid-glass-material)
- [Focus States](#focus-states)
- [Navigation Patterns](#navigation-patterns)
- [Typography](#typography)
- [Color System](#color-system)
- [Card and Content Patterns](#card-and-content-patterns)
- [Player UI](#player-ui)
- [Modal and Overlay Patterns](#modal-and-overlay-patterns)
- [Spacing and Padding](#spacing-and-padding)
- [Glass Effect CSS Implementation](#glass-effect-css-implementation)
- [App Reference: How Top Apps Look](#app-reference-how-top-apps-look)
- [tvOS 26 vs Earlier Versions](#tvos-26-vs-earlier-versions)
- [SwiftUI Liquid Glass API](#swiftui-liquid-glass-api)

---

## Screen and Layout

### Resolution

- **Native:** 1920 x 1080 points (1080p). All design work targets this canvas.
- **4K output:** Apple TV 4K renders at 3840 x 2160, but the coordinate system is 1920 x 1080 points. Design at 1x (1920x1080), the system scales.

### Safe Areas

Content that must remain visible on all TVs (accounting for overscan):

| Edge | Inset |
|------|-------|
| Top | 60 pt |
| Bottom | 60 pt |
| Leading (left) | 90 pt |
| Trailing (right) | 90 pt |

- **Usable content area:** 1740 x 960 pt (after safe area insets)
- Background imagery and decorative content can extend edge-to-edge (full bleed)
- Interactive/focusable elements and text must stay within safe areas
- The tab bar sits above the top safe area (its own reserved space)

### Layout Grid

- Use grid-based layouts wherever possible — the D-pad remote navigates in cardinal directions
- Horizontal scrolling rows are the dominant pattern (shelves/carousels)
- Vertical scrolling between rows
- Show 10-20% of off-screen content at row edges to hint at scrollable content
- Keep consistent spacing between focusable items — inconsistent padding confuses the focus engine

### Viewing Distance

- Designed for **10-foot UI** (3 meters / ~10 feet from screen)
- All text, icons, and interactive elements must be legible at this distance
- Minimum text size: ~24-26 pt for any readable text on screen
- Prefer visual content (posters, thumbnails) over dense text

---

## Liquid Glass Material

### What It Is

Liquid Glass is Apple's unified design material introduced at WWDC 2025. It is a translucent, dynamic material that:
- Reflects and refracts surrounding content in real time
- Produces specular highlights that respond to movement
- Adapts color, brightness, and saturation based on background content
- Creates a sense of depth through light bending (lensing) and adaptive shadows

It is used exclusively for the **navigation layer** that floats above app content. Never apply glass to content itself.

### Material Variants

| Variant | Transparency | Use Case | Notes |
|---------|-------------|----------|-------|
| `.regular` | Medium | Default for most UI (nav bars, tab bars, controls) | Full color adaptation to background |
| `.clear` | High | Media-rich backgrounds (player controls over video) | Requires dimming layer; content above must be bold/bright |
| `.identity` | None | Conditional disable (accessibility fallback) | No glass effect applied |

### Visual Characteristics

- **Refraction:** Elements refract (distort/bend) the content behind them
- **Reflection:** Elements reflect content and wallpaper from around them
- **Specular highlights:** Dynamic light glints that react to motion/interaction
- **Color sampling:** Glass surfaces sample underlying colors, adjusting saturation and brightness dynamically
- **Text treatment:** Text on glass automatically receives "vibrant" treatment — color, brightness, and saturation adjust based on background

### Blur and Frost Parameters

Apple does not publish exact blur values. Based on developer analysis and community research:

| Parameter | Recommended Range | Notes |
|-----------|------------------|-------|
| Blur radius (iPhone) | Up to ~40 px | GPU-accelerated Gaussian blur |
| Blur radius (iPad/Mac/TV) | Up to ~60 px | Larger surfaces = more blur |
| Frost intensity | 10-25 range | Values above ~30 look "milky plastic" |
| Depth/refraction | 0-20 range | Higher = more refraction, harms readability above 20 |
| Minimum text contrast | 4.5:1 ratio | After blur, text must remain readable |

### Where Liquid Glass Appears on tvOS

- **Home screen:** App icon dock/row with translucent background
- **Tab bar:** Translucent floating bar at top of screen
- **Control Center:** Glass platters that distort underlying content with blur and refraction
- **Video player controls:** Transport bar, scrubber, buttons — all glass, floating over video
- **Sidebars:** Translucent navigation panels in apps like Apple TV
- **Menus and popovers:** Context menus use glass material
- **App icons:** Glassy edges, shimmery appearance

### Accessibility Adaptations

The system automatically adjusts glass when users enable:

| Setting | Effect |
|---------|--------|
| Reduce Transparency | Increases frosting opacity for clarity; more opaque backgrounds |
| Increase Contrast | Adds stark colors and visible borders |
| Reduce Motion | Tones down animations, elastic effects, specular highlights |

---

## Focus States

tvOS uses a focus engine (not touch or cursor). The Siri Remote trackpad moves focus between elements. Focus states are critical — they are the primary way users know what they are about to select.

### Focus State Hierarchy

Focusable items can have up to **five** visually distinct states:

1. **Unfocused** — default resting state, no emphasis
2. **Focused** — elevated, enlarged, highlighted (the primary interactive state)
3. **Pressed** — momentary depression when the user clicks
4. **Selected** — persistent indicator that an item is the current choice (e.g., active tab)
5. **Disabled** — dimmed, non-interactive

### Focused State Visual Effects

When an element gains focus, tvOS applies several simultaneous effects:

| Effect | Specification | Notes |
|--------|--------------|-------|
| **Scale** | 1.1x (110% of original size) | Element lifts and grows |
| **Shadow** | Radius: 25 pt, Offset: 0 x 16 pt, Color: black @ 0.3 alpha | Creates depth/lift illusion |
| **Parallax tilt** | +/-10 degrees horizontal and vertical | 3D rotation responding to trackpad |
| **Parallax shift** | +/-4 pt horizontal and vertical | Subtle position offset |
| **Specular glare** | White reflection across surface | Simulates light source bouncing off surface |
| **Layer separation** | Up to 5 parallax layers | Background opaque + up to 4 transparent layers |

### Focus Animation Timing

| Transition | Duration | Spring Damping |
|------------|----------|---------------|
| Press down | 0.1 seconds | 0.9 |
| Press up (release) | 0.2 seconds | 0.9 |
| Focus gained | ~0.2-0.3 seconds | Spring animation |
| Focus lost | ~0.2-0.3 seconds | Spring animation |

### Parallax / Layered Images

- Parallax images contain 1 opaque background + up to 4 transparent foreground layers
- Higher layers elevate and scale more, overlapping lower layers
- The background layer must always be fully opaque
- Set `adjustsImageWhenAncestorIsFocused = true` in UIKit for automatic parallax
- Layers shift based on trackpad position, creating continuous gestural 3D feedback

### tvOS 26 Focus with Liquid Glass

In tvOS 26, focused elements gain an additional Liquid Glass treatment:
- Glass surfaces become more prominent when focused
- Directional highlights appear based on focus movement direction
- The glass material brightens and the specular highlight intensifies
- Buttons on the scrub bar reflect passing content (e.g., lighter as white text timestamp passes)

### Focus Design Guidelines

- Make focus crystal clear at 10-foot distance — size and animation over subtle color shifts
- Keep adequate padding between focusable elements (prevents focus engine miscalculation)
- Horizontal navigation is easier and more natural than vertical on the Siri Remote
- Off-screen items should show 10-20% peek to indicate scrollable content
- Focus always returns to the tab bar when pressing Menu on the remote

---

## Navigation Patterns

### Tab Bar (Primary Navigation)

The tab bar is the standard top-level navigation pattern on tvOS.

| Property | Value |
|----------|-------|
| Position | Top of screen |
| Height | 68 pt (fixed, cannot be changed) |
| Top edge offset | 46 pt from top of screen |
| Default appearance | Translucent (Liquid Glass in tvOS 26) |
| Selected tab | Opaque with drop shadow |
| Focused behavior | Drop shadow emphasizes selected tab |
| Overflow | Fade effect on rightmost items; scrollable with fade on both sides |

**tvOS 26 changes:** The tab bar is now Liquid Glass — translucent with refraction effects. It warps the content behind it subtly. Selected tab has glass highlight.

**Behavior:**
- Tab bar is visible when the user swipes up to the top or presses Menu
- While browsing content below, the tab bar can auto-hide or minimize
- Focus returns to the tab bar when pressing Menu on the remote

### Sidebar Navigation

Some apps (especially the Apple TV app) use a sidebar pattern:
- Sidebar appears on the left edge, overlaid on content
- In tvOS 26, sidebars use Liquid Glass — they refract content behind them and reflect wallpaper
- Sidebar items are vertically stacked, navigated with D-pad up/down
- Content area shifts or dims when sidebar is focused

### In-App Navigation

- **Hierarchical:** Drill down from list to detail, breadcrumb-style back navigation
- **Flat shelves:** Horizontal scrolling rows of content (most common for media apps)
- **Grid:** Uniform grid of items (used for file browsers, app libraries)

### Remote Interactions

| Gesture | Action |
|---------|--------|
| Swipe on trackpad | Move focus directionally (momentum-based) |
| Tap trackpad edges | Navigate one item at a time |
| Click trackpad | Select / activate focused item |
| Click and hold | Context menu / long-press actions |
| Menu button | Go back / return to tab bar |
| TV button (hold) | Open Control Center |
| Play/Pause | Toggle playback |
| Swipe down (during playback) | Show info panel (metadata, audio, subtitles) |

---

## Typography

### System Font

- **tvOS system font:** SF Pro (San Francisco Pro)
- **Optical sizes:** SF Pro Text (19 pt and below), SF Pro Display (20 pt and above)
- The system automatically selects the correct optical variant based on point size
- **Weights available:** Ultralight, Thin, Light, Regular, Medium, Semibold, Bold, Heavy, Black
- **Width variants:** Standard, Condensed, Compressed, Expanded

### tvOS Typography Scale

tvOS uses significantly larger font sizes than iOS due to 10-foot viewing distance. The tvOS coordinate system is 1920x1080 but text needs to be readable from across the room.

**Approximate tvOS text style sizes** (based on system defaults — roughly 2x iOS sizes):

| Text Style | Approximate Size (pt) | Weight | Use Case |
|------------|----------------------|--------|----------|
| Large Title | 76 | Bold | Hero headers, feature titles |
| Title 1 | 48 | Regular | Section headers |
| Title 2 | 38 | Regular | Sub-section headers |
| Title 3 | 36 | Regular | Card titles, list headers |
| Headline | 29 | Semibold | Emphasized body text, row labels |
| Body | 29 | Regular | Primary readable text |
| Callout | 28 | Regular | Secondary readable text |
| Subheadline | 26 | Regular | Supporting text below headlines |
| Footnote | 23 | Regular | Tertiary information |
| Caption 1 | 21 | Regular | Metadata, timestamps |
| Caption 2 | 19 | Regular | Smallest readable text |

**Important:** These are approximate. Use `UIFont.preferredFont(forTextStyle:)` or SwiftUI `.font(.title)` to get the system-resolved sizes. tvOS will return larger sizes than iOS for the same text style.

### Typography Guidelines for TV

- Minimize text — prefer images, posters, and visual hierarchy
- Body text should be at minimum ~26-29 pt for comfortable reading
- Never go below ~19-21 pt for any on-screen text
- Use font weight to create hierarchy (Bold for titles, Regular for body, not size alone)
- Keep line lengths short — wide TV screens make long lines hard to track
- Use SF Pro Display for all sizes 20+ pt (which is nearly all TV text)
- tvOS does not support Dynamic Type the way iOS does — sizes are fixed for the platform

### Text on Glass

When text sits on a Liquid Glass surface:
- The system applies **vibrant rendering** — adjusting color, brightness, and saturation based on the background content behind the glass
- White text is the default for dark content; the system adapts automatically
- Ensure 4.5:1 minimum contrast ratio after blur effects

---

## Color System

### Dark-First Design

tvOS is a **dark-environment-first** platform:
- Users watch TV in dimmed rooms
- Bright UI elements cause eye strain and distract from content
- System background is near-black
- Light mode does not exist on tvOS — it is always dark

### System Colors

| Role | Color | Notes |
|------|-------|-------|
| Background | Near-black (#000000 to #1C1C1E) | True black for OLED, near-black for LCD |
| Secondary background | Dark gray (#2C2C2E) | Cards, elevated surfaces |
| Tertiary background | Medium-dark gray (#3A3A3C) | Nested containers |
| Primary text | White (#FFFFFF) | High contrast body text |
| Secondary text | Light gray (#EBEBF5 @ 60% opacity) | Labels, metadata |
| Tertiary text | Light gray (#EBEBF5 @ 30% opacity) | Disabled text, hints |
| Separator | White @ 15-20% opacity | Subtle dividers |
| Tint / Accent | App-defined (e.g., Blue #0A84FF) | Interactive elements, links |

### Vibrant Colors

tvOS uses a vibrant color system where UI elements adapt to the content behind them:
- **Vibrant light:** White text/icons that increase brightness based on dark backgrounds
- **Vibrant dark:** Dark text/icons that adapt to light backgrounds
- **Vibrant fill:** Semi-transparent fills that adapt to underlying content

### Glass Surface Colors

Liquid Glass surfaces are not a single RGBA value — they are dynamically rendered. However, for prototyping:

| Surface | Approximate Appearance |
|---------|----------------------|
| Glass on dark content | Light frosted white, subtle refraction |
| Glass on light content | Darker tinted glass, maintains contrast |
| Glass on colorful content | Picks up ambient hues, shifts color |
| Focused glass | Brighter, more prominent specular highlight |
| Selected glass | Slightly more opaque with accent tint |

### Color for put.io on tvOS

Based on put.io's brand system:
- **Brand yellow:** #FDCE45 (primary accent, CTAs)
- **Background:** Pure black (#000000) or near-black
- **Cards:** Dark gray with subtle elevation
- **Folder icons:** Yellow (brand signature)
- **Text:** White primary, gray secondary
- **Success/Active:** Green
- **Error/Destructive:** Red

---

## Card and Content Patterns

### Poster Cards (tvOS 26 Standard)

tvOS 26 shifted from horizontal movie cards to **vertical poster cards**:

| Property | Value |
|----------|-------|
| Aspect ratio | 2:3 (portrait poster) — standard for movie/TV posters |
| Recommended image size | 404 x 608 px (1x), safe zone 380 x 570 px |
| Corner radius | 12-16 pt |
| Focus scale | 1.1x |
| Shadow (focused) | 25 pt radius, 16 pt Y offset, black @ 30% |
| Label position | Below card (title, optional subtitle/metadata) |

Vertical poster cards take less horizontal space than the previous landscape cards, allowing more titles visible at once.

### Landscape Cards

Still used for featured/hero content and episode thumbnails:

| Property | Value |
|----------|-------|
| Aspect ratio | 16:9 (landscape) |
| Corner radius | 12-16 pt |
| Focus behavior | Same lift + shadow + parallax as poster cards |

### Content Shelves (Horizontal Rows)

The dominant layout pattern — horizontal scrolling rows:

| Property | Value |
|----------|-------|
| Row height | Varies by card size (poster row ~300-400 pt including label) |
| Inter-card spacing | 40-48 pt (enough for focus scale without overlap) |
| Row label | Left-aligned, above row, ~29-36 pt semibold |
| Peek amount | 10-20% of next card visible at row edge |
| Vertical spacing between rows | 48-60 pt |

### List Items

For file browsers, settings, and text-based lists:

| Property | Value |
|----------|-------|
| Row height | ~66-88 pt |
| Left padding | 90 pt (safe area) + additional as needed |
| Icon size | 32-48 pt |
| Primary text | ~29 pt (headline or body) |
| Secondary text | ~23-26 pt (footnote or subheadline) |
| Focus appearance | Full-width highlight, slight lift, glass tint |

### Top Shelf

The top shelf is a special content area shown when an app is focused on the home screen:

| Property | Value |
|----------|-------|
| Static image | 1920 x 720 pt (1080p) / 3840 x 1440 (4K) |
| Dynamic content | Scrollable row of items (recommended for media apps) |
| Layered images | Supports parallax with 2-5 layers |

### App Icons

| Type | Dimensions |
|------|-----------|
| Small icon | 400 x 240 pt |
| Large icon (home screen) | 1280 x 768 pt |
| App Store icon | 1280 x 720 pt |
| Layers | 2-5 layers for parallax effect |

In tvOS 26, app icons have glassy edges and a shimmery appearance — updated to match the Liquid Glass aesthetic.

---

## Player UI

### Transport Bar

The video player transport bar is where Liquid Glass shines most on tvOS 26:

| Element | Description |
|---------|-------------|
| Position | Bottom of screen, overlaid on video |
| Appearance | Liquid Glass — translucent, does not obscure video content |
| Scrubber | Horizontal progress bar with elapsed/remaining time |
| Title view | Displayed above transport bar — shows current content title |
| Controls | Play/pause, skip back/forward, playback speed |
| Visibility | Auto-hides after inactivity; touch trackpad to reveal |

### Player Controls Behavior

- Touching the Siri Remote surface reveals the transport bar
- Clicking trackpad edges skips forward/backward
- Holding the trackpad fast-forwards or rewinds
- Swiping down opens the **info panel** (metadata, chapters, audio, subtitles)
- Transport bar controls use Liquid Glass — buttons reflect underlying content
- At least 0.5-second delay before showing overlays on playback start

### tvOS 26 Player Glass Effects

- Controls float above video with translucent glass appearance
- The glass reflects what is happening on the scrub bar (e.g., buttons get lighter as white timestamp text passes by)
- Transport bar buttons and scrubber all use the `.clear` glass variant
- No content is obstructed — transparency ensures the viewer never misses video content

### Info Panel (Swipe Down)

- Shows episode/movie info, description
- Chapter navigation markers
- Audio track selection
- Subtitle selection and configuration
- Settings (playback speed, etc.)
- Uses the same Liquid Glass material as the rest of the player

### Contextual Actions

- **Skip Intro** / **Recap** buttons appear contextually during playback
- **Up Next** suggestion at end of episode
- All contextual UI uses glass material in tvOS 26

---

## Modal and Overlay Patterns

### Alerts

- Centered on screen
- Frosted/blurred background (glass material in tvOS 26)
- Title + message + action buttons
- Focusable buttons at the bottom

### Full-Screen Modals

- Take the entire screen area
- Used for complex workflows (settings, multi-step input)
- Background content is fully obscured
- Modal content uses standard dark background with glass navigation elements

### Context Menus (Long Press)

- Appear near the focused element
- Glass material container with list of actions
- Vertical list of options, navigated with D-pad

### Overlays During Playback

- All player overlays use Liquid Glass (`.clear` variant)
- Content remains visible and playing underneath
- Overlays auto-dismiss after timeout
- Background dims slightly but video is never fully obscured

### System Overlays

- **Control Center:** Hold TV button. Glass platters that distort underlying content with blur and refraction effects. Particularly striking on OLED TVs.
- **Volume overlay:** Small glass indicator, non-intrusive
- **Profile picker:** Optional auto-display on wake (new in tvOS 26)

---

## Spacing and Padding

### Base Spacing Scale

tvOS uses a generous spacing scale due to the viewing distance. Based on Apple's conventions:

| Token | Value | Use |
|-------|-------|-----|
| xs | 8 pt | Tight internal padding (icon to label) |
| sm | 16 pt | Internal component padding |
| md | 24 pt | Between related elements |
| lg | 40 pt | Between components, inter-card spacing |
| xl | 60 pt | Between sections/rows, matches top/bottom safe area |
| 2xl | 90 pt | Matches leading/trailing safe area |

### Key Measurements

| Element | Spacing |
|---------|---------|
| Safe area top/bottom | 60 pt |
| Safe area left/right | 90 pt |
| Tab bar height | 68 pt |
| Tab bar top offset | 46 pt from top |
| Inter-card spacing (in row) | 40-48 pt |
| Inter-row spacing (between shelves) | 48-60 pt |
| Card corner radius | 12-16 pt |
| Focus scale factor | 1.1x (elements grow 10% when focused) |
| Focus shadow offset | 16 pt Y-axis |
| Minimum focusable element size | ~66 pt height (list rows) |

### Focus Spacing Considerations

When elements scale 1.1x on focus, they need enough surrounding padding to avoid overlapping adjacent elements. Plan for the focused size, not the resting size:
- A 300 pt wide card at 1.1x becomes 330 pt — needs at least 30 pt extra clearance
- Standard inter-card gap of 40-48 pt accounts for this expansion

---

## Glass Effect CSS Implementation

For HTML/CSS prototypes that approximate Apple's Liquid Glass aesthetic:

### Basic Glass Container

```css
.glass {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

### Glass Variants

```css
/* Regular glass — medium transparency, for nav/controls */
.glass-regular {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Clear glass — high transparency, for player controls over video */
.glass-clear {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Prominent glass — for focused/active elements */
.glass-focused {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

### Specular Highlight (Shine Effect)

```css
.glass::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 40%,
    transparent 100%
  );
  border-radius: 16px 16px 0 0;
  pointer-events: none;
}
```

### Focus State Animation

```css
.focusable {
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
              box-shadow 0.2s ease;
  transform: scale(1.0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.focusable:focus,
.focusable.focused {
  transform: scale(1.1);
  box-shadow: 0 16px 25px rgba(0, 0, 0, 0.3);
}

/* Press state */
.focusable:active {
  transform: scale(1.05);
  transition-duration: 0.1s;
}
```

### Tab Bar Glass

```css
.tab-bar {
  position: fixed;
  top: 46px;
  left: 90px;
  right: 90px;
  height: 68px;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 24px;

  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  z-index: 100;
}

.tab-bar .tab {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tab-bar .tab.selected {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tab-bar .tab:focus {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}
```

### Player Transport Bar Glass

```css
.transport-bar {
  position: fixed;
  bottom: 60px;
  left: 90px;
  right: 90px;
  padding: 16px 24px;

  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}

.transport-bar .scrubber {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
}

.transport-bar .scrubber .progress {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}

.transport-bar .controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-top: 12px;
}

.transport-bar .control-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}
```

### CSS Custom Properties (Design Tokens)

```css
:root {
  /* Glass backgrounds */
  --glass-bg-regular: rgba(255, 255, 255, 0.12);
  --glass-bg-clear: rgba(255, 255, 255, 0.06);
  --glass-bg-prominent: rgba(255, 255, 255, 0.18);
  --glass-bg-focused: rgba(255, 255, 255, 0.18);

  /* Glass borders */
  --glass-border-regular: rgba(255, 255, 255, 0.15);
  --glass-border-subtle: rgba(255, 255, 255, 0.08);
  --glass-border-focused: rgba(255, 255, 255, 0.25);

  /* Glass blur */
  --glass-blur-regular: blur(40px) saturate(180%);
  --glass-blur-clear: blur(24px) saturate(150%);
  --glass-blur-heavy: blur(60px) saturate(200%);

  /* Glass shadows */
  --glass-shadow-regular: 0 8px 32px rgba(0, 0, 0, 0.3);
  --glass-shadow-elevated: 0 16px 25px rgba(0, 0, 0, 0.3);
  --glass-shadow-focused: 0 12px 40px rgba(0, 0, 0, 0.4);

  /* Glass inner highlights */
  --glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  --glass-highlight-strong: inset 0 1px 0 rgba(255, 255, 255, 0.3);

  /* Surface colors (dark theme) */
  --surface-bg: #000000;
  --surface-elevated: #1C1C1E;
  --surface-secondary: #2C2C2E;
  --surface-tertiary: #3A3A3C;

  /* Text colors */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(235, 235, 245, 0.6);
  --text-tertiary: rgba(235, 235, 245, 0.3);
  --text-on-glass: #FFFFFF;

  /* Spacing */
  --safe-area-x: 90px;
  --safe-area-y: 60px;
  --tab-bar-height: 68px;
  --tab-bar-top: 46px;
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 40px;
  --spacing-xl: 60px;
  --spacing-2xl: 90px;

  /* Focus */
  --focus-scale: 1.1;
  --focus-shadow-radius: 25px;
  --focus-shadow-offset: 16px;
  --focus-shadow-color: rgba(0, 0, 0, 0.3);
  --focus-transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
                      box-shadow 0.2s ease;

  /* Typography (tvOS scale) */
  --font-large-title: 76px;
  --font-title1: 48px;
  --font-title2: 38px;
  --font-title3: 36px;
  --font-headline: 29px;
  --font-body: 29px;
  --font-callout: 28px;
  --font-subheadline: 26px;
  --font-footnote: 23px;
  --font-caption1: 21px;
  --font-caption2: 19px;

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 9999px;

  /* Card dimensions */
  --card-poster-width: 200px;
  --card-poster-height: 300px;
  --card-landscape-width: 400px;
  --card-landscape-height: 225px;
  --card-gap: 40px;
  --row-gap: 48px;
}
```

---

## App Reference: How Top Apps Look

### Apple TV App (tvOS 26)

- Vertical poster cards replacing horizontal cards — more titles visible
- Liquid Glass tab bar at top
- Shelves of content rows (horizontal scroll)
- Glass menus and context actions
- Player controls: full Liquid Glass transport bar
- Sidebar navigation with glass refraction
- Hero banner at top with large featured artwork

### Infuse 8

- Grid view with movie poster thumbnails (retrieved metadata/artwork)
- List view option for file browsing
- Folder + file navigation (folder name, size, chevron)
- Detail view for individual items
- Settings: playback options, storage info, user account
- tvOS 26: Updated with Liquid Glass optimizations
- Gold standard for media player UX on Apple TV

### Plex

- Redesigned Apple TV app (2025)
- Horizontal content shelves (movies, TV, music, photos)
- Large hero banners for featured content
- Grid library view with poster thumbnails
- Sidebar navigation for library sections

### Netflix

- Custom video player (does not use Apple's AVPlayerViewController)
- Therefore: does not get Liquid Glass player controls automatically
- Needs app update to adopt tvOS 26 glass effects
- Horizontal shelves of landscape/poster thumbnails
- Full-bleed hero banner with auto-playing preview
- Tab bar at top (custom implementation)

### Key Patterns Across Apps

1. **Horizontal shelves** are universal — every media app uses them
2. **Poster art** is the primary content representation
3. **Hero banner** at top for featured/editorial content
4. **Glass navigation** for system-native apps (tvOS 26)
5. **Dark backgrounds** everywhere — black or near-black
6. **Minimal text** — visuals do the heavy lifting
7. **Focus is king** — every app invests heavily in focus state design

---

## tvOS 26 vs Earlier Versions

### What Changed

| Aspect | tvOS 18 and earlier | tvOS 26 |
|--------|-------------------|---------|
| Design language | Flat/material design | Liquid Glass |
| Tab bar | Translucent, flat | Liquid Glass with refraction |
| Control Center | Basic overlay | Glass platters with blur/refraction |
| App icons | Flat layered icons | Glassy edges, shimmery appearance |
| Player controls | Opaque/semi-transparent | Liquid Glass — fully transparent, non-obstructing |
| Poster cards | Horizontal (landscape) cards | Vertical (portrait) poster cards |
| Content density | Fewer items visible | More items visible (smaller vertical posters) |
| Sidebar | Opaque/blurred | Glass refraction and reflection |
| Focus effects | Lift + shadow + parallax | Same + glass highlight + directional specular |
| Profile management | Manual selection | Auto-display on wake (optional) |
| Authentication | Per-app login | Apple Account-linked login |

### What Stayed the Same

- Tab bar at top of screen (68 pt height, 46 pt offset)
- Home screen layout: rows of app icons
- Focus engine navigation with Siri Remote
- Safe areas: 60 pt top/bottom, 90 pt left/right
- 1920 x 1080 pt coordinate system
- Parallax layered images for icons and posters
- Dark-only UI (no light mode)
- Horizontal shelves as primary content layout
- Swipe-down for info panel during playback

### What This Means for Prototypes

- Always use dark backgrounds (near-black)
- Apply glass effects to navigation elements (tab bar, sidebar, player controls)
- Do not apply glass to content items themselves (cards, posters, text blocks)
- Focus states should scale 1.1x with shadow and glass highlight
- Player controls should be transparent — video visible underneath
- Vertical poster cards for movie/show browsing (2:3 ratio)
- Generous spacing — everything needs breathing room at 10 feet

---

## SwiftUI Liquid Glass API

For reference when building native implementations or understanding the system:

### Core Modifier

```swift
.glassEffect(_ glass: Glass = .regular, in shape: Shape)
```

### Glass Types

```swift
.glassEffect(.regular)    // Default — medium transparency, full color adaptation
.glassEffect(.clear)      // High transparency — for media-rich backgrounds
.glassEffect(.identity)   // No glass — conditional disable
```

### Tinting

```swift
.glassEffect(.regular.tint(.blue))
.glassEffect(.regular.tint(.purple.opacity(0.6)))
```

### Interactive Mode (iOS — not typical on tvOS)

```swift
.glassEffect(.regular.interactive())
// Enables: scaling on press, bounce, shimmer, touch-point illumination
```

### Container (Groups Glass Elements)

```swift
GlassEffectContainer(spacing: 12) {
    // Multiple glass elements share sampling region
    // Enables morphing transitions between them
    // Glass cannot sample other glass — container provides shared region
}
```

### Morphing Transitions

```swift
view.glassEffectID(someID, in: namespace)
// Elements in same GlassEffectContainer with shared namespace morph between states
```

### Shape Options

```swift
.glassEffect(.regular, in: .capsule)
.glassEffect(.regular, in: .circle)
.glassEffect(.regular, in: RoundedRectangle(cornerRadius: 16))
.glassEffect(.regular, in: .rect(cornerRadius: .containerConcentric))
.glassEffect(.regular, in: .ellipse)
```

### Accessibility Detection

```swift
@Environment(\.accessibilityReduceTransparency) var reduceTransparency
@Environment(\.accessibilityReduceMotion) var reduceMotion
// System automatically adjusts glass for these settings
```

---

## Quick Reference: Prototype Checklist

When building a tvOS 26-style prototype, verify:

- [ ] Canvas size: 1920 x 1080
- [ ] Background: near-black (#000000 or #1C1C1E)
- [ ] Safe areas respected: 60pt top/bottom, 90pt left/right
- [ ] Tab bar: glass material, top of screen, 68pt height, 46pt from top
- [ ] Focus states: 1.1x scale, shadow (25pt radius, 16pt offset, black 30%), highlight
- [ ] Typography: SF Pro, sizes appropriate for 10-foot UI (minimum ~19-21pt)
- [ ] Content layout: horizontal shelves with vertical poster cards (2:3)
- [ ] Inter-card spacing: 40-48pt
- [ ] Inter-row spacing: 48-60pt
- [ ] Glass effects: only on navigation layer, never on content
- [ ] Player controls: glass-clear variant, transparent over video
- [ ] No light mode — dark only
- [ ] Peek content at edges (10-20% visible) for scrollable rows

---

*Compiled from Apple WWDC 2025 announcements, Apple Human Interface Guidelines, Apple Developer documentation, developer community references, and hands-on reviews. Approximate values where Apple has not published exact specifications.*
