# Android TV / Google TV UI Design Reference

Comprehensive reference for building Android TV-style prototypes. Based on Google's official TV design guidelines, Material Design 3 for TV, Compose for TV library specifications, and competitive app analysis (2025).

---

## Table of Contents

- [Design Foundations](#design-foundations)
- [Screen Specifications and Grid](#screen-specifications-and-grid)
- [Overscan Safety and Margins](#overscan-safety-and-margins)
- [Navigation Patterns](#navigation-patterns)
- [Focus System](#focus-system)
- [Typography](#typography)
- [Color System](#color-system)
- [Layout Patterns](#layout-patterns)
- [Card Components](#card-components)
- [Featured Carousel](#featured-carousel)
- [Immersive List](#immersive-list)
- [Lists](#lists)
- [Buttons and Chips](#buttons-and-chips)
- [Player UI](#player-ui)
- [Settings Patterns](#settings-patterns)
- [Dialogs and Modals](#dialogs-and-modals)
- [Motion and Animation](#motion-and-animation)
- [Differences from Mobile Material Design](#differences-from-mobile-material-design)
- [Google TV Home Screen](#google-tv-home-screen)
- [Competitive Reference](#competitive-reference)
- [Compose for TV API Surface](#compose-for-tv-api-surface)

---

## Design Foundations

### The 10-Foot UI

Android TV is a "10-foot UI" -- users sit approximately 3 meters (10 feet) from the screen. This fundamentally changes every design decision:

- **No touch input.** D-pad remote is the only input. Four directional buttons, a center select button, a back button, and a microphone button.
- **Content-first.** TV is all about content. Interface serves content, not the other way around.
- **Low information density.** Users cannot process as much information as on mobile or desktop. Limit text. Break into scannable chunks.
- **Dark theme by default.** TVs are used in dim environments. Dark backgrounds reduce eye strain, enhance cinematic feel, and increase visibility of content artwork.
- **Communal device.** TV is typically shared. Privacy-sensitive content needs profile switching or privacy settings.
- **Leanback posture.** Users are relaxed and reclined. Interactions should be effortless.

### Core Interaction Model

| Input | Action |
|-------|--------|
| D-pad Up/Down/Left/Right | Move focus between elements |
| Center/Select button | Activate focused element; long-press for contextual options |
| Back button | Return to previous view; eventually exits to launcher |
| Home button | Return to Google TV / Android TV launcher |
| Microphone button | Voice search / Google Assistant |

### Design Principles

1. **Efficient** -- Fast, simple content access with minimal clicks
2. **Predictable** -- Follow platform conventions; no reinvented navigation patterns
3. **Intuitive** -- Support widely adopted user behaviors
4. **Scannable** -- Avoid cognitive overload; keep information digestible from distance

---

## Screen Specifications and Grid

### Base Resolution

| Property | Value |
|----------|-------|
| Design resolution | 960 x 540 dp (MDPI, where 1dp = 1px) |
| Aspect ratio | 16:9 |
| Asset target | 1080p (downscales to 720p) |
| Density | MDPI baseline; at MDPI, 1px = 1dp |

### 12-Column Grid

| Property | Value |
|----------|-------|
| Columns | 12 |
| Column width | 52dp |
| Gutter | 20dp |
| Side margins | 58dp each |
| Vertical line spacing | 4dp |

**Grid calculation:** (12 x 52dp) + (11 x 20dp) + (2 x 58dp) = 960dp

### Card Width by Column Span

| Cards visible | Card width |
|---------------|-----------|
| 1 | 844dp |
| 2 | 412dp |
| 3 | 268dp |
| 4 | 196dp |
| 5 | 124dp |

Spacing between cards: 20dp.

---

## Overscan Safety and Margins

### Safe Area Margins (5% Rule)

| Edge | Calculation | Value |
|------|------------|-------|
| Left | 960 x 5% | 48dp (recommended 58dp) |
| Right | 960 x 5% | 48dp (recommended 58dp) |
| Top | 540 x 5% | 27dp (recommended 24-28dp) |
| Bottom | 540 x 5% | 27dp (recommended 24-28dp) |

**Practical guidance:** Use 58dp left/right and 28dp top/bottom. Most modern TVs no longer have overscan, but margins remain important for visual breathing room. The Leanback library and Compose for TV incorporate safe margins automatically.

**Background images:** Do not clip to safe area. Allow backgrounds and decorative elements to extend edge-to-edge. Only interactive content and text must stay within margins.

---

## Navigation Patterns

Android TV supports two primary navigation architectures:

### Left Navigation (Side Drawer)

The dominant pattern on Android TV. A vertical navigation rail on the left edge of the screen.

**Collapsed state (icon rail):**
- Shows only icons for each destination
- Width: approximately 56-80dp (icon rail)
- Visible when user is browsing content

**Expanded state (full drawer):**
- Shows icons + text labels
- Triggered by pressing Back or navigating left from content
- Can be Standard (pushes content aside) or Modal (overlays with scrim)

**Structure:**
1. Top section -- app logo or profile switcher
2. Navigation rail -- 3-7 destination items
3. Navigation items -- icon + label
4. Bottom section -- 1-3 action buttons (settings, etc.)

**Best practices:**
- 5-6 primary destinations maximum
- Order by user importance (most frequent first)
- All items must include icons; no mixing icon/non-icon items
- Labels should be short; truncate with ellipsis if needed (no wrapping)
- Use optional dividers sparingly for grouping
- Use badges sparingly to indicate new content

**Back button behavior (left nav):** Pressing Back activates the navigation drawer and focuses the current menu item.

### Top Navigation (Tab Row)

A horizontal bar of destination tabs at the top of the screen.

**Structure:**
- Tabs stretch across the top, within safe area margins
- Padding: approximately 32dp top, 16dp bottom
- Compose for TV provides `TabRow` composable with TV-optimized styling

**Back button behavior (top nav):** Pressing Back scrolls the page to the top and activates the top menu, focusing the current tab.

### Axis Design Strategy

| Axis | Purpose |
|------|---------|
| Vertical | Category/menu traversal (navigate between rows/sections) |
| Horizontal | Item browsing within a category (scroll through content in a row) |

This is the universal TV navigation paradigm: categories stack vertically, items within each category scroll horizontally.

### Back Navigation Rules

- Back button must always return to the previous destination
- Repeated Back presses must eventually reach the launcher (no infinite loops)
- Never gate exit with a confirmation dialog
- Never display a virtual back button on screen
- Splash screens are excluded from back stack
- Deep links must simulate natural navigation (back leads to start destination)
- Cancel buttons only for confirming/destructive/purchase actions

---

## Focus System

Focus is the core interaction mechanism on TV, replacing touch/hover. There is always exactly one focused element on screen.

### Focus Indicator Types

The Compose for TV `Surface` composable supports four indication properties:

#### 1. Scale

Enlarges the focused element. Default scaling values:

| Context | Scale factor |
|---------|-------------|
| Small elements | 1.025x |
| Medium elements | 1.05x |
| Large elements | 1.1x |

Scale values vary based on element size. Larger items use smaller scale factors to avoid excessive visual disruption.

#### 2. Glow

A diffused shadow/glow effect around the element suggesting elevation.

| Property | Range |
|----------|-------|
| Glow level (elevation) | 2dp - 32dp |
| Glow color | Customizable per image or brand color |

#### 3. Border (Outline)

An outline rendered outside the element boundary.

| Property | Notes |
|----------|-------|
| Outline width | Customizable (commonly 2-4dp) |
| Outline inset | Spacing between element edge and outline |
| Outline color | Customizable; typically white or brand accent |
| Shape | Follows element shape (rounded corners, etc.) |

#### 4. Color Change

Surface and content colors change on focus.

| Property | Notes |
|----------|-------|
| Background color | Surface color changes to indicate focus |
| Content color | Text/icon color adapts over the new surface |

#### 5. Tonal Elevation

Surface tinted via primary color overlays.

| Level | Effect |
|-------|--------|
| +1 to +5 | Progressively more prominent primary color tint |
| Purpose | Creates elevation, establishes contrast, creates visual engagement |

### Element States

| State | Description |
|-------|-------------|
| Default | Normal, unfocused state |
| Focused | Currently selected via D-pad navigation |
| Pressed | Active press on the select button |
| Selected | Persistently chosen (e.g., active tab, toggle on) |
| Disabled | Non-interactive; lower opacity, reduced background prominence |

All states apply to both enabled and disabled variants.

### Focus Best Practices

- Always have an item in focus when the app starts or a screen loads
- Focus indicators must be visible from 10 feet away
- Combine multiple indicators (scale + border + color) for stronger emphasis
- Ensure every focusable element has a clear D-pad navigation path
- If no straight path exists via D-pad, relocate the control
- Avoid hard-to-reach UI elements
- Test thoroughly with a D-pad controller

### Focusable Structure

- **Focusable elements:** Individual interactive components (buttons, cards, list items)
- **Focusable groups:** Containers with one or more focusable elements
- **Nesting:** Unlimited nesting of focusable groups supported

---

## Typography

### System Typeface

Android TV uses **Roboto** as the system typeface, optimized for legibility and clarity on TV displays. Apps may use custom fonts, but must prioritize:

- Large counters and open letterforms
- Appropriate optical sizing for distance
- Distinguishable characters (avoid ambiguous glyphs)
- Sans-serif for body text and labels (no decorative/handwriting fonts)

### Material Design 3 Type Scale

The same 15-style M3 type scale applies, but TV screens demand larger text overall. The baseline values below are M3 defaults; for TV, sizes should be scaled up proportionally.

**Starting point for TV:** Where mobile uses 16sp for body text, TV body text should start at 24sp minimum. Scale everything up proportionally.

| Role | Size (sp) | Line Height (sp) | Weight | Letter Spacing (sp) | TV Usage |
|------|-----------|-------------------|--------|---------------------|----------|
| Display Large | 57 | 64 | 400 (Regular) | -0.25 | Hero numerals, splash screens |
| Display Medium | 45 | 52 | 400 (Regular) | 0 | Large promotional text |
| Display Small | 36 | 44 | 400 (Regular) | 0 | Featured content titles |
| Headline Large | 32 | 40 | 400 (Regular) | 0 | Screen titles, featured carousel |
| Headline Medium | 28 | 36 | 400 (Regular) | 0 | Section headings |
| Headline Small | 24 | 32 | 400 (Regular) | 0 | Subsection headings |
| Title Large | 22 | 28 | 400 (Regular) | 0 | Card titles, dialog titles |
| Title Medium | 16 | 24 | 500 (Medium) | 0.15 | List item primary text |
| Title Small | 14 | 20 | 500 (Medium) | 0.1 | Smaller labels |
| Body Large | 16 | 24 | 400 (Regular) | 0.5 | Descriptions, body copy |
| Body Medium | 14 | 20 | 400 (Regular) | 0.25 | Secondary text |
| Body Small | 12 | 16 | 400 (Regular) | 0.4 | Captions |
| Label Large | 14 | 20 | 500 (Medium) | 0.1 | Button text |
| Label Medium | 12 | 16 | 500 (Medium) | 0.5 | Chip text, small buttons |
| Label Small | 11 | 16 | 500 (Medium) | 0.5 | Timestamps, metadata |

**Note:** These are the M3 mobile baseline values. For TV prototypes, multiply by approximately 1.5x for 10-foot viewing distance. A practical TV type scale:

| TV Role | Recommended Size | Use |
|---------|-----------------|-----|
| Hero / Display | 48-64sp | Splash, featured hero text |
| Headline | 32-40sp | Section titles, featured carousel titles |
| Title | 24-28sp | Card titles, row headers |
| Body | 20-24sp | Descriptions, metadata |
| Label | 16-18sp | Buttons, chips, timestamps |
| Caption | 14-16sp | Tertiary metadata |

### TV Typography Principles

1. **Go larger when in doubt.** Text must be readable from 3 meters.
2. **Light text on dark backgrounds.** Standard for all TV interfaces.
3. **Limit text volume.** Short, scannable chunks. No long paragraphs.
4. **Use 5-6 type styles maximum** to maintain simplicity.
5. **Anti-aliasing is critical** for readability on TV panels.
6. Use **expressive/display fonts** only for Display and Headline roles; keep body and label in clean sans-serif.

---

## Color System

### Dark Theme First

Android TV uses dark themes by default. This is not optional -- it is the standard for TV interfaces.

**Why dark:**
- Reduces eye strain in dim viewing environments
- Enhances cinematic feel
- Makes content artwork pop
- Increases shadow visibility for depth cues

### Material Design 3 Color Roles

| Role | Purpose | TV Usage |
|------|---------|----------|
| Primary | Key interactive elements (buttons, active states, elevated surface tints) | Accent color for focused states, primary actions |
| Secondary | Less prominent components (filter chips, supporting UI) | Secondary actions, supporting indicators |
| Tertiary | Contrasting accents for balance | Input fields, discretionary highlights |
| Surface | Neutral background and container color | Main app background, card backgrounds |
| Surface Dim | Darker surface variant | Recessed areas |
| Surface Bright | Lighter surface variant | Elevated surfaces |
| On-Surface | Text and icons on surfaces | Primary text, icons |
| On-Surface Variant | Secondary text on surfaces | Metadata, descriptions |
| Outline | Borders and dividers | Card outlines, section dividers |
| Outline Variant | Subtle borders | Decorative borders |
| Error | Error states | Error messages, destructive actions |

### Dark Theme Surface Colors

The baseline Material Dark theme uses **dark grey (#121212 or similar), not pure black (#000000)**. This increases shadow visibility and reduces eye strain with light text.

| Surface | Typical Value | Use |
|---------|---------------|-----|
| Background | #121212 - #1C1B1F | Main app background |
| Surface | #1E1E1E - #202124 | Cards, containers |
| Surface Container Low | #1D1B20 | Recessed elements |
| Surface Container | #211F26 | Standard containers |
| Surface Container High | #2B2930 | Elevated containers |
| Surface Container Highest | #36343B | Highest elevation containers |

### Tonal Elevation on Dark Surfaces

Material 3 represents elevation using tonal color overlays instead of shadows. Higher elevation surfaces receive a more prominent primary color tint:

| Elevation Level | Tonal Overlay | Use |
|-----------------|--------------|-----|
| Level 0 | 0% primary | Flat surfaces |
| Level 1 | 5% primary | Low emphasis surfaces |
| Level 2 | 8% primary | Cards, switches |
| Level 3 | 11% primary | Navigation components |
| Level 4 | 12% primary | Navigation rail |
| Level 5 | 14% primary | FAB, high emphasis |

### Dynamic Color on TV

Android TV does **not** support wallpaper-based dynamic color (Material You user schemes). Instead, TV uses **content-based dynamic color**:

1. Extract key colors from content images (poster art, thumbnails) using Material Color Utilities
2. Generate a theme from the extracted seed color
3. Apply tonal palette to UI elements

This creates an immersive feel where the UI adapts to the content being browsed.

### Color Accessibility

- Maintain sufficient contrast ratios between text and backgrounds (WCAG AA minimum)
- Never rely on color alone to convey information
- Focus states must have high contrast against both the element and the surrounding background

### Practical Palette for Prototypes

```
/* Dark theme baseline */
--background:         #121212;
--surface:            #1E1E1E;
--surface-variant:    #2A2A2A;
--surface-elevated:   #333333;
--on-surface:         #E1E1E1;
--on-surface-variant: #A0A0A0;
--primary:            #BB86FC;  /* or brand color */
--on-primary:         #000000;
--outline:            #444444;
--scrim:              rgba(0, 0, 0, 0.6);
```

---

## Layout Patterns

### Core Layout Templates

#### 1. Browse (Horizontal Shelves)

The most common TV layout. Vertical stack of horizontal scrolling rows.

```
+----------------------------------------------------------+
|  [Nav]   [Search]   [Tabs...]                            |
|                                                          |
|  Section Title                                           |
|  [Card] [Card] [Card] [Card] [Card] ...  →              |
|                                                          |
|  Section Title                                           |
|  [Card] [Card] [Card] [Card] [Card] ...  →              |
|                                                          |
|  Section Title                                           |
|  [Card] [Card] [Card] [Card] [Card] ...  →              |
+----------------------------------------------------------+
```

- Navigate up/down to move between rows
- Navigate left/right to browse within a row
- Last visible card should "peek" past the edge, signaling more content

#### 2. Left Navigation Overlay

Navigation panel overlays on the left side. Content shifts or dims behind.

```
+----------------------------------------------------------+
| +---------+                                              |
| | Nav     |  Content area (dimmed/shifted)               |
| | Item 1  |                                              |
| | Item 2  |                                              |
| | Item 3  |                                              |
| | Item 4  |                                              |
| |         |                                              |
| | Settings|                                              |
| +---------+                                              |
+----------------------------------------------------------+
```

#### 3. Content Details

Horizontal layout showing item metadata and actions.

```
+----------------------------------------------------------+
|                                                          |
|  [Poster/    Title                                       |
|   Thumbnail] Metadata (year, rating, duration)           |
|              Description text...                         |
|              [Play] [Add to List] [More Info]            |
|                                                          |
|  Related Items                                           |
|  [Card] [Card] [Card] [Card] ...  →                     |
+----------------------------------------------------------+
```

#### 4. Compilation / Episodes

Item details on the left, related items (episodes, tracks) on the right.

```
+----------------------------------------------------------+
|  +-------------------+  +-----------------------------+  |
|  | Title             |  | Episode List / Track List   |  |
|  | Metadata          |  | [Item 1]                    |  |
|  | Description       |  | [Item 2]                    |  |
|  | [Play] [Options]  |  | [Item 3]                    |  |
|  +-------------------+  | [Item 4]                    |  |
|                          +-----------------------------+  |
+----------------------------------------------------------+
```

#### 5. Grid

Organized collection in rows and columns. Clear D-pad navigation logic.

```
+----------------------------------------------------------+
|  Grid Title                                              |
|  [Card] [Card] [Card] [Card]                             |
|  [Card] [Card] [Card] [Card]                             |
|  [Card] [Card] [Card] [Card]                             |
|  [Card] [Card] [Card] [Card]                             |
+----------------------------------------------------------+
```

#### 6. Two-Pane (List-Detail)

Left pane for list/navigation, right pane for detail. Common for settings.

```
+----------------------------------------------------------+
|  +------------------+  +-------------------------------+  |
|  | List / Menu      |  | Detail Panel                 |  |
|  | [> Item 1]       |  | Selected item details        |  |
|  |   Item 2         |  | Description, options, etc.   |  |
|  |   Item 3         |  |                              |  |
|  |   Item 4         |  |                              |  |
|  +------------------+  +-------------------------------+  |
+----------------------------------------------------------+
```

#### 7. Alert / Full-Screen Message

Full-screen overlay for critical messages requiring action.

```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|               [Icon]                                     |
|               Title                                      |
|               Description text                           |
|               [Primary Action]  [Secondary Action]       |
|                                                          |
|                                                          |
+----------------------------------------------------------+
```

### Layout Principles

- **Single-pane layouts** for content-forward experiences (browsing, playback)
- **Two-pane layouts** for task-forward experiences (settings, file management)
- Add padding between items to prevent overlap during focus scaling
- Align focus navigation with natural reading direction (left-to-right, top-to-bottom)
- Full-screen backgrounds should extend edge-to-edge; only content respects safe margins

---

## Card Components

### Card Types

Compose for TV provides five card variants:

#### 1. Standard Card

Image on top, content block below. No card background visible -- content floats below the image.

```
+------------------+
|                  |
|     [Image]      |
|                  |
+------------------+
  Title
  Subtitle
```

#### 2. Classic Card

Image on top, content block below with a visible card container/background.

```
+------------------+
|                  |
|     [Image]      |
|                  |
+------------------+
| Title            |
| Subtitle         |
+------------------+
```

#### 3. Compact Card

Image fills the entire card. Title and subtitle overlay the image with a semi-transparent scrim gradient at the bottom.

```
+------------------+
|                  |
|     [Image]      |
|  ░░░░░░░░░░░░░░  |
|  Title           |
|  Subtitle        |
+------------------+
```

- Uses semi-transparent black gradient overlay (scrim)
- Content must be brief and concise
- Best for visual-forward content where imagery dominates

#### 4. Wide Standard Card

Image on the left, content block on the right. No card background.

```
+--------+-----------+
|        | Title     |
| [Image]| Subtitle  |
|        | Desc...   |
+--------+-----------+
```

#### 5. Wide Classic Card

Image on the left, content block on the right with visible card container.

```
+---------------------+
| +------+ Title      |
| |Image | Subtitle   |
| |      | Desc...    |
| +------+            |
+---------------------+
```

### Card Aspect Ratios

| Ratio | Use Case |
|-------|----------|
| 16:9 | Most common; video thumbnails, screenshots |
| 2:3 | Poster-style; movies, shows (vertical emphasis) |
| 1:1 | Square; profiles, album art, logos |

### Card Content Slots

Each card provides four content slots:

1. **Title** -- Primary text (required)
2. **Subtitle** -- Secondary text (optional)
3. **Description** -- Short description (optional; wide cards only)
4. **Extra text** -- Tertiary info (optional)

**Rule:** Content block width should match the image thumbnail width. Use wide card variants for short descriptions only -- keep description to a few words.

### Card Spacing

| Property | Value |
|----------|-------|
| Gap between cards | 20dp |
| Content block padding | 16dp |
| Corner radius | 12-24dp (per Material 3 shape system) |

### Card Focus Behavior

When a card receives focus:
- Scale up (1.05x - 1.1x)
- Add border/outline (commonly 4dp inset border)
- Optional glow effect
- Background color may shift for tonal elevation

---

## Featured Carousel

A full-width hero component at the top of a page, showcasing featured or promoted content. Auto-advances through items.

### Anatomy

```
+----------------------------------------------------------+
|                                                          |
|  [Full-width background image with cinematic scrim]      |
|                                                          |
|  Overline text                                           |
|  Title (Headline Large)                                  |
|  Description                                             |
|  [Action Button]                                         |
|                                                          |
|  ● ○ ○ ○ ○  (pagination dots)                           |
+----------------------------------------------------------+
```

**Components:**
1. Background image (full-width, cinematic scrim overlay for text readability)
2. Poster image (optional, overlaid)
3. Content block: overline, title, description, action button
4. Pagination indicators (active + inactive dots)

### Variants

- **Immersive variant:** Full background image, content overlaid
- **Card variant:** Background image with a card container for the content block

### Design Guidance

- Use high-resolution, visually appealing images
- Apply cinematic scrim (gradient overlay) for text readability
- Keep obvious visual hierarchy between background and content
- Content can be personalized based on viewing history
- Compose API: `androidx.tv.material3.Carousel`

### Carousel Layouts (Compose)

| Type | Description |
|------|-------------|
| Multi-browse | Differently sized items; browsing many items |
| Uncontained | Single-size items flowing past screen edge |
| Hero | One large image with peek of next item |
| Full-screen | Each item fills the viewport |

Parameters: `state` (current index), `itemSpacing`, `contentPadding`.

---

## Immersive List

A content row where the focused card's details are revealed in the background above the row. Provides an immersive browsing experience.

### Anatomy

```
+----------------------------------------------------------+
|  [Background image updates dynamically per focused card]  |
|                                                          |
|  Title of Focused Item                                   |
|  Description of Focused Item                             |
|                                                          |
|  [Card] [Card] [FOCUSED CARD] [Card] [Card] ...         |
+----------------------------------------------------------+
```

**Components:**
1. Dynamic background image (updates as user navigates)
2. Content block (title + description of focused item)
3. Cinematic scrim layer
4. Content grid/row of cards

### Behavior

- Background image updates automatically as user navigates through cards
- Focused card scales to 1.1x with border and elevation cues
- Height expands when in focus to reveal background title and description (progressive disclosure)
- 16:9 aspect ratio recommended for background images
- Subject in background image should be positioned toward top-right for cinematic feel

---

## Lists

### List Components

Compose for TV provides `ListItem` and `DenseListItem`:

| Component | Use |
|-----------|-----|
| ListItem | Standard list rows with icon, primary text, secondary text |
| DenseListItem | Compact list rows for high-density lists (settings, file browsers) |

### List Layout

```
+----------------------------------------------------------+
| [Icon]  Primary Text                        [Action]     |
|         Secondary Text                                   |
+----------------------------------------------------------+
| [Icon]  Primary Text                        [Action]     |
|         Secondary Text                                   |
+----------------------------------------------------------+
```

- Continuous vertical index of text or images
- D-pad up/down to navigate between items
- Focus highlights the entire row
- Select button activates the focused item

### Shelf Pattern (Horizontal Lists)

The most common content presentation on TV. Horizontal scrolling row of cards with a section title:

```
Section Title                                    See All >
[Card] [Card] [Card] [Card] [Card] ...  →
```

- Last visible item should "peek" beyond fold (partially visible)
- This signals to the user that more content exists
- 13-column grid works well for shelves (odd numbers keep final items within margins)

---

## Buttons and Chips

### Button Types

Compose for TV provides standard Material 3 buttons plus TV-specific additions:

| Button | Emphasis | Use |
|--------|----------|-----|
| Filled Button | Highest | Primary actions (Play, Start) |
| Outlined Button | Medium | Secondary actions (Add to List) |
| Text Button | Low | Tertiary actions (More Info) |
| WideButton | High (TV-specific) | Wider touch target; higher emphasis for TV |

All buttons support the `Glow` parameter for TV-specific focus indication.

### Chips

| Chip Type | Use |
|-----------|-----|
| FilterChip | Filtering content (genre, year, etc.) |
| InputChip | Representing user input (search tags) |
| AssistChip | Suggested actions |
| SuggestionChip | Predictive suggestions |

Chips on TV must be large enough for D-pad navigation. Group chips horizontally with clear focus traversal.

### Button Sizing

TV buttons should be significantly larger than mobile equivalents:
- Minimum height: 48dp (same as mobile touch target, but visually larger on screen)
- Padding: 24dp horizontal, 12dp vertical minimum
- Text: Label Large or larger (14sp+, but consider TV scaling)

---

## Player UI

### Transport Controls Layout

```
+----------------------------------------------------------+
|                                                          |
|              [Video Content - Full Screen]               |
|                                                          |
|  Title                                          00:00:00 |
|                                                          |
|   advancement bar / progress bar                         |
|  ━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  |
|  00:32:15                                      01:45:30  |
|                                                          |
|       [<<]    [<]    [▶/❚❚]    [>]    [>>]               |
|                                                          |
|  [CC]  [Audio]  [Quality]                    [Fullscreen]|
+----------------------------------------------------------+
```

### Control Mapping

| D-pad Input | During Playback | When Controls Visible |
|-------------|----------------|----------------------|
| Center | Pause + show controls | Play/Pause toggle |
| Left (single press) | Rewind by X seconds | Seek backward |
| Right (single press) | Fast-forward by X seconds | Seek forward |
| Left (hold) | Continuous scrub backward | Continuous scrub backward |
| Right (hold) | Continuous scrub forward | Continuous scrub forward |
| Up/Down | Peek: show progress bar + title without pausing | Navigate between control rows |

### Control Hierarchy

- **Primary actions** (above seek bar): Play/Pause (center-focused by default), Rewind, Fast-forward, Previous, Next
- **Secondary actions** (below seek bar): Subtitles, Audio track, Quality, Playback speed

### Player Design Principles

1. **Center action is play/pause** -- always the default focused action
2. **Auto-hide controls** after a few seconds of inactivity (3-5 seconds typical)
3. **Seek bar** shows elapsed time, total duration, and a scrubber knob
4. **Scrubbing UX:** When scrubber is active, fade all other UI to focus attention (YouTube pattern)
5. **Transparent overlay** preferred over opaque background (modern style)
6. **Video thumbnails on scrub** (when available) for visual seeking
7. **Subtitle/audio track selection** via a side panel or bottom sheet overlay
8. **Chapter navigation** (if supported) shown as markers on the seek bar

### VOD vs Live

| Feature | VOD | Live |
|---------|-----|------|
| Seek bar | Full scrubber | No scrubber (or limited DVR window) |
| Rewind/FF | Yes | Only with DVR |
| Progress | Elapsed / Total | "LIVE" indicator |

---

## Settings Patterns

### Two-Pane List-Detail

The standard settings pattern on Android TV.

```
+----------------------------------------------------------+
|  Settings                                                |
|  +------------------+  +-------------------------------+  |
|  | General          |  | Playback                     |  |
|  | [> Playback]     |  |                              |  |
|  | Display          |  | Auto-play next         [On]  |  |
|  | Audio            |  | Default quality       [Auto] |  |
|  | Subtitles        |  | Skip intro            [On]  |  |
|  | Storage          |  | Hardware decode       [Off] |  |
|  | Account          |  |                              |  |
|  | About            |  |                              |  |
|  +------------------+  +-------------------------------+  |
+----------------------------------------------------------+
```

### Settings Components

| Component | Use |
|-----------|-----|
| Toggle/Switch | Binary on/off settings |
| Radio group | Mutually exclusive options |
| Dropdown/Spinner | Selection from list (opens overlay) |
| Slider | Range values (volume, brightness) |
| Action item | Navigates to sub-screen or triggers action |
| Info item | Display-only (account info, version) |

### Settings Principles

- Left pane: category list (focused item highlighted)
- Right pane: settings within selected category
- Keep the left pane item selected to establish relationship between panels
- Group related settings together
- Use clear labels; avoid jargon
- Show current value inline (e.g., "Quality: Auto")

---

## Dialogs and Modals

### Center Overlay (Dialog)

The primary modal pattern on Android TV. Overlays centered on screen with a scrim background.

```
+----------------------------------------------------------+
|  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  |
|  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  |
|  ░░░░░░  +-----------------------------+  ░░░░░░░░░░░░  |
|  ░░░░░░  | Dialog Title                |  ░░░░░░░░░░░░  |
|  ░░░░░░  | Description text that       |  ░░░░░░░░░░░░  |
|  ░░░░░░  | explains the situation.     |  ░░░░░░░░░░░░  |
|  ░░░░░░  |                             |  ░░░░░░░░░░░░  |
|  ░░░░░░  | [Cancel]        [Confirm]   |  ░░░░░░░░░░░░  |
|  ░░░░░░  +-----------------------------+  ░░░░░░░░░░░░  |
|  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  |
+----------------------------------------------------------+
```

### Other Overlay Patterns

| Pattern | Position | Use |
|---------|----------|-----|
| Center overlay | Center of screen | Confirmations, critical info, decisions |
| Bottom overlay | Bottom of screen | Supplementary content, bottom sheets |
| Left overlay | Left edge | Navigation panel |
| Right overlay | Right edge | Action panels, detail panels |

### Dialog Principles

- Dialogs disable all app functionality underneath
- Remain on screen until confirmed, dismissed, or action taken
- Never obscured by other elements
- Never appear partially on screen
- Scrim behind dialog (60% black typical)
- Focus starts on the primary/safest action
- Back button dismisses the dialog
- Use sparingly -- dialogs are interruptive
- Support Material 3 shape system (rounded corners, typically 28dp for extra-large)

---

## Motion and Animation

### Easing Curves

| Name | Cubic-Bezier | Use |
|------|-------------|-----|
| Standard | (0.2, 0, 0, 1) | Common M3-styled animations on screen |
| Standard Decelerate | (0, 0, 0, 1) | Elements entering the screen |
| Standard Accelerate | (0.3, 0, 1, 1) | Elements leaving the screen |
| Emphasized Decelerate | (0.05, 0.7, 0.1, 1) | Important entrances needing emphasis |
| Emphasized Accelerate | (0.3, 0, 0.8, 0.15) | Important exits needing emphasis |
| Linear | (0, 0, 1, 1) | Color/opacity fades |

### Duration Tokens

| Category | Token 1 | Token 2 | Token 3 | Token 4 |
|----------|---------|---------|---------|---------|
| Short | 50ms | 100ms | 150ms | 200ms |
| Medium | 250ms | 300ms | 350ms | 400ms |
| Long | 450ms | 500ms | 550ms | 600ms |
| Extra Long | 700ms | 800ms | 900ms | 1000ms |

**Guidelines:**
- Small UI changes (focus, color, opacity): Short (50-200ms)
- Standard transitions (card expand, navigation): Medium (250-400ms)
- Full-screen transitions: Long (450-600ms)
- Complex orchestrated animations: Extra Long (700-1000ms)

### Spring Parameters (M3 Expressive)

| Type | Damping | Stiffness | Use |
|------|---------|-----------|-----|
| Fast Spatial | 0.9 | 1400 | Small component movement (switches, checkboxes) |
| Fast Effects | 1.0 | 3800 | Small property changes (color, opacity) |
| Default Spatial | 0.9 | 700 | Partial-screen movement (cards, panels) |
| Default Effects | 1.0 | 1600 | Partial-screen property changes |
| Slow Spatial | 0.9 | 300 | Full-screen movement (page transitions) |
| Slow Effects | 1.0 | 800 | Full-screen property changes |

**Spatial springs** animate position (x, y). **Effects springs** animate non-positional properties (color, opacity, scale) -- these use damping ratio 1.0 (critically damped, no overshoot).

### Transition Patterns

| Pattern | Description | Use |
|---------|-------------|-----|
| Container Transform | Seamless morph between source and destination | Card to detail page |
| Shared Axis | Elements move together on a shared axis | Sibling navigation |
| Fade Through | Element fades out, new element fades in | Unrelated content swap |
| Fade | Simple opacity transition | Overlay appear/disappear |

### TV-Specific Motion Notes

- Focus transitions should be snappy: Short 3-4 (150-200ms)
- Card scale on focus: Medium 1 (250ms) with Standard easing
- Page transitions: Long 1-2 (450-500ms) with Emphasized Decelerate
- Player controls auto-hide: fade out with Medium 2 (300ms) Standard Accelerate
- Background image crossfade (immersive list): Long 2 (500ms) with Standard easing

---

## Differences from Mobile Material Design

| Aspect | Mobile | TV |
|--------|--------|-----|
| Input method | Touch, gestures | D-pad remote only |
| Viewing distance | 30-60cm (arm's length) | 3m (10 feet) |
| Screen orientation | Portrait primary | Landscape only (16:9) |
| Theme | Light or dark | Dark only |
| Information density | High | Low (scannable) |
| Typography scale | Standard M3 | ~1.5x larger minimum |
| Focus feedback | Subtle (ripple) | Prominent (scale + border + glow) |
| Navigation | Bottom bar, nav drawer, gestures | Left rail or top tabs + D-pad |
| Hover/touch states | Ripple, press | Scale, glow, border, color |
| Content layout | Vertical scroll, cards, lists | Horizontal shelves, carousels |
| Dynamic color | Wallpaper-based | Content-based (extract from images) |
| Window size classes | Compact, Medium, Expanded | Fixed Expanded (TV is always large) |
| FAB | Common | Not used on TV |
| Bottom sheet | Pull-up gesture | Bottom overlay (D-pad triggered) |
| Snackbar | Bottom of screen | Not standard; use toast or alert overlay |
| Swipe gestures | Common | Not available |
| Text input | On-screen keyboard, voice | Voice preferred; D-pad keyboard as fallback |
| Elevation | Shadow-based + tonal | Tonal-only (shadows less visible on TV panels) |
| Corner radius | 12dp cards typical | 12-24dp (larger on TV for visibility) |

### What Does NOT Exist on TV

- No FAB (Floating Action Button)
- No bottom navigation bar
- No swipe gestures or pull-to-refresh
- No notification shade
- No system status bar (battery, signal, time is on launcher only)
- No split-screen multitasking
- No pinch-to-zoom

---

## Google TV Home Screen

### Current Layout (2025 Redesign)

Google TV underwent a home screen redesign in 2025, moving closer to Amazon Fire TV's navigation model.

**Navigation bar (top):**
```
[Profile] [Search] | Home | Live | Apps |      [Settings] [Screensaver]
```

- Two pill-shaped clusters at the top
- Left cluster: Home, Live, Apps + Search shortcut
- Right cluster: Settings, Screensaver
- Profile icon on far left with dropdown: Profile Switcher, Watchlist, Library, Your Services, Content Preferences

**Content area:**
- "For You" tab replaced by simple "Home"
- Horizontal shelves of content recommendations
- Personalized rows based on viewing habits and installed apps
- "Continue Watching" row prominently placed
- App-specific rows from installed streaming services
- "Top Picks" and editorial collections

**App layout on home:**
- Apps row shows installed app icons
- Recommendations rows from each app
- Customizable: users can reorder rows and toggle app recommendations

### How Third-Party Apps Integrate

Apps appear on the Google TV home screen via:
- App icon in the Apps row
- Content recommendations (via Engage SDK / MediaBrowserService)
- "Continue Watching" entries
- Search results via Google Assistant integration

---

## Competitive Reference

### Netflix TV App (2025 Redesign)

Netflix overhauled its TV interface in May 2025 -- the first major redesign in over 12 years.

**Before (2013-2025):**
- Left-hand vertical sidebar navigation (Home, Search, Shows, Movies, etc.)
- Horizontal content rows
- Top carousel for featured content

**After (2025):**
- **Top menu bar** replaces left sidebar: Search, Home, Shows, Movies, Games, My Netflix
- Menu is always visible at top of screen
- Content tiles are now dynamic: they expand when focused to show trailer preview, description, and metadata
- More immersive, content-forward browsing
- Real-time responsive recommendations
- "My Netflix" hub for personalized content

### Plex TV App (2025)

- "Modern Layout" redesign emphasizing artwork
- Cover art with color-matched gradient backgrounds
- When a poster is in focus: shows genres, ratings, synopsis without clicking
- Heavy use of content imagery
- Clean navigation with sidebar

### YouTube on TV

- Top navigation bar with Home, Shorts, Subscriptions, Library, profile
- Large video thumbnails in horizontal rows
- Video player with transparent transport controls
- Scrubber interaction: when active, all other UI fades to clean the working area
- Chapter markers on progress bar
- Elegant seek preview thumbnails

### Common Patterns Across Competitors

1. **Hero/carousel at top** for featured content
2. **Horizontal shelves** as primary content organization
3. **Content-forward** design -- artwork dominates, chrome is minimal
4. **Dark backgrounds** universally
5. **Focus scaling** on cards (1.05x - 1.1x)
6. **Border highlight** on focused elements (white or brand color)
7. **Dynamic backgrounds** that update based on focused content
8. **Progressive disclosure** -- details revealed on focus, not before
9. **Auto-playing trailers** on featured content focus

---

## Compose for TV API Surface

### Key Libraries

| Library | Purpose |
|---------|---------|
| `androidx.tv:tv-foundation` | TV-optimized foundation components |
| `androidx.tv:tv-material` | TV-specific Material 3 components |
| `androidx.compose.material3` | Standard M3 (NOT optimized for TV; avoid for TV-specific components) |

### Core Composables

| Composable | Category | Purpose |
|------------|----------|---------|
| `Surface` | Foundation | Base interactive surface with focus indication (Scale, Glow, Border, Color) |
| `NavigationDrawer` | Navigation | Standard side navigation drawer |
| `ModalNavigationDrawer` | Navigation | Modal overlay navigation drawer with scrim |
| `TabRow` | Navigation | Horizontal top navigation tabs |
| `Tab` | Navigation | Individual tab within TabRow |
| `Card` | Containment | Standard card |
| `ClassicCard` | Containment | Card with visible container background |
| `CompactCard` | Containment | Image-dominant card with scrim overlay |
| `WideCard` | Containment | Horizontal card layout |
| `WideClassicCard` | Containment | Horizontal card with visible container |
| `Carousel` | Containment | Featured content carousel |
| `ImmersiveList` | Containment | List with immersive background updates |
| `TvLazyRow` | Layout | Horizontal scrolling row |
| `TvLazyColumn` | Layout | Vertical scrolling column |
| `TvLazyVerticalGrid` | Layout | Scrolling vertical grid |
| `ListItem` | Lists | Standard list item |
| `DenseListItem` | Lists | Compact list item |
| `Button` | Actions | Standard button with Glow support |
| `OutlinedButton` | Actions | Outlined button |
| `WideButton` | Actions | TV-specific wide button |
| `FilterChip` | Selection | Filter chip |
| `InputChip` | Selection | Input chip |
| `Glow` | Style | Glow focus indication |

### Focus Indication API

```kotlin
Surface(
    onClick = { /* action */ },
    scale = CardScale.None,          // or CardDefaults.scale()
    border = CardDefaults.border(),
    glow = CardDefaults.glow(),
    color = CardDefaults.colors()
) {
    // content
}
```

### Important Migration Note

The old Leanback library (Fragments, Presenters, XML themes) is being replaced by Compose for TV. New apps should use Compose for TV exclusively. Leanback relied on patterns that don't scale well:

| Leanback (Legacy) | Compose for TV (Current) |
|-------------------|--------------------------|
| Fragments | Composable functions |
| Presenters | Composable parameters |
| XML themes | MaterialTheme + tokens |
| BrowseSupportFragment | TvLazyColumn + rows |
| DetailsSupportFragment | Custom Compose layout |
| PlaybackSupportFragment | Custom player overlay |
| GuidedStepSupportFragment | Dialog/overlay composables |

---

## Quick Reference: Prototype Checklist

When building an Android TV prototype, verify:

- [ ] Dark theme with grey-black background (not pure black)
- [ ] 960x540dp design grid with 58dp side margins, 28dp top/bottom margins
- [ ] 12-column grid, 52dp columns, 20dp gutters
- [ ] Left navigation drawer OR top tab bar (not bottom nav)
- [ ] Clear focus indicator on every interactive element (scale + border minimum)
- [ ] One element always in focus
- [ ] Horizontal shelves for content browsing
- [ ] Cards with 16:9, 2:3, or 1:1 aspect ratios
- [ ] Typography minimum 24sp for body text on TV
- [ ] D-pad navigation: vertical between sections, horizontal within sections
- [ ] Back button returns to previous view (no confirmation to exit)
- [ ] Player: center button = play/pause, left/right = seek
- [ ] Settings: two-pane list-detail layout
- [ ] No FAB, no bottom nav, no swipe gestures, no touch-only interactions
- [ ] Content-first: minimal chrome, artwork-dominant
- [ ] Scrim overlays on text over images for readability

---

*Sources: [Android TV Design Guidelines](https://developer.android.com/design/ui/tv), [Material Design 3](https://m3.material.io), [Compose for TV](https://developer.android.com/training/tv/playback/compose), [TV Design Kit (Figma)](https://www.figma.com/community/file/1235253029449067033/tv-design-kit), [Smashing Magazine TV Design Guide](https://www.smashingmagazine.com/2025/09/designing-tv-principles-patterns-practical-guidance/)*
