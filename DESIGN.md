---
version: "0.1.0"
name: "put.io Design System"
description: "Public token and guidance contract for put.io product surfaces."
colors:
  brand: "hsl(44.7, 97.9%, 63.1%)"
  dark:
    app-bg: "hsl(0, 0%, 8.5%)"
    page-bg: "hsl(0, 0%, 0%)"
    text: "hsl(0, 0%, 93.0%)"
    text-muted: "hsl(0, 0%, 62.8%)"
    border: "hsl(0, 0%, 24.3%)"
    success: "hsl(151, 55%, 41.5%)"
    danger: "hsl(358, 75%, 59%)"
  light:
    app-bg: "hsl(0, 0%, 100%)"
    page-bg: "hsl(0, 0%, 97.3%)"
    text: "hsl(0, 0%, 9.0%)"
    text-muted: "hsl(0, 0%, 43.5%)"
    border: "hsl(0, 0%, 85.8%)"
    success: "hsl(151, 55%, 41.5%)"
    danger: "hsl(358, 75%, 59%)"
typography:
  ui:
    family: '"GT America", sans-serif'
    weight: 400
    size: "0.875rem"
    lineHeight: 1.45
  display:
    family: '"GT America", sans-serif'
    weight: 900
    size: "6rem"
    lineHeight: 1.1
  mono:
    family: '"Berkeley Mono", monospace'
    weight: 400
    size: "0.875rem"
    lineHeight: 1.45
rounded:
  sm: "4px"
  default: "6px"
  md: "8px"
  lg: "10px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
components:
  button:
    primary-bg: "{colors.brand}"
    radius: "{rounded.default}"
  input:
    radius: "{rounded.default}"
  file-row:
    icon: "{colors.brand}"
---

# put.io Design System

## Overview

put.io is a content-agnostic cloud file product. Its interface is a file browser: fast, quiet, and honest about the data it has. Design for raw filenames, folders, transfers, storage, playback, and settings; media metadata is usually absent.

## Binding Tiers

A web mock is never a native spec. Every surface binds at one tier, and every card in `system/preview/` names its tier in a strip worded by `system/preview/_tier.css`.

- **Tier 0: Foundations.** The token graph. Values only; binds every tier.
- **Tier 1: www · app · auth.** The full system: tokens plus the `system/components.css` recipes, which are the contract here only.
- **Tier 2: iOS · iPadOS · tvOS · watchOS · Android · Android TV.** Tokens only. Components and pages come from the platform's guidelines; cards show how a stock control takes put.io tokens. The shipped tvOS and Android TV app draws its own components with Phosphor icons; the components are documented drift.
- **Tier 3: Roku.** Tier 2, plus put.io conventions in custom SceneGraph components.
- **Tier 4: tv.put.io · Tizen · webOS.** The web system, restrained to a calm, list-first 10-foot interface.

Tier 1, 3, and 4 cards are Components (put.io owns the recipe); tier 2 cards are Elements (the platform owns the control). Per-platform contracts: `platforms/<platform>/DESIGN.md`, or the app repository it points to. On every tier, file-type icons are brand-yellow Phosphor icons.

## Colors

- Yellow `#FDCE45` (`--yellow-solid`) is the brand value in both modes: brand mark, primary actions, folder and file emphasis, progress, focus. Hover is `--yellow-solid-hover`.
- Every yellow is one of these tokens, flat. Yellow text on light surfaces is `--yellow-text-secondary`.
- Dark is the default product mode; light serves landing pages, docs, and states that read better light.
- Red, green, and neutral come from their token scales.

## Typography

- GT America sets product UI and display. Labels and controls are medium, hierarchy is bold, display is black.
- Berkeley Mono is the one mono face: numerics, timestamps, sizes, ETAs, counts, code, logs, identifiers, hashes, magnet URIs, filenames. Columns of numbers add `font-variant-numeric: tabular-nums`.
- TV product UI has no mono face (a debug overlay may use the platform's system monospace): 10-foot numerics use GT America `tnum`. Platforms without OpenType feature selection (Roku: `Font` takes only `uri` and `size`) get proportional figures, so budget timecodes for reflow (`1` is 399/1000 em, `0` is 636).
- GT America is Latin only (523 codepoints, Western and Central European plus Turkish, no dingbats such as `✓` `▶` `★`). Symbols are icons. Text that can hold a filename keeps a fallback family; web falls back per glyph, while one-font-per-label platforms must ship a fallback or render `.notdef` boxes.
- The root is the browser default, `100%` (16px), so text follows the reader's setting. Components choose a text role, not a size step: `--fs-ui` (14px) for UI chrome (labels, buttons, nav, links, errors), `--fs-body` (16px) for body and long text, `--fs-caption` (12px) for captions, and `--fs-field` (16px) for typed text, which keeps iOS Safari from zooming on focus.
- The steps are rem on Tailwind's 16px scale: `--fs-xs` 12px, `--fs-sm` 14, `--fs-base` 16, `--fs-md` 18, `--fs-lg` 24, `--fs-xl` 32, `--fs-2xl` 48, `--fs-3xl` 64, `--fs-display` 96. Screen titles and one-time-code digits take `--fs-title` (22px) on a 30px line with `--tracking-snug`; the code separator is `--fs-md`.

## Layout & Spacing

- Layouts are file-browser layouts: lists, rows, columns, sidebars, toolbars, sheets. Whitespace and dividers come before cards.
- Spacing follows Tailwind's 4px unit: `--space-N` is N × 4px, as `p-N` is. Named steps: `--space-1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 32, 64, 128` (4–512px). On web, every padding, margin and gap is a multiple of 4px; 1px and 2px stay for hairline nudges. TV and Roku keep their 3px FHD grid; native platforms keep their own metrics.
- z-index: `--z-dropdown` 1000, `--z-sticky` 1100, `--z-modal` 1300, `--z-notification` 1400, `--z-tooltip` 1500.
- Breakpoints `--bp-sm`/`--bp-md`/`--bp-lg` are 640/768/1280px; `@media` takes the literal pixels.

## Elevation & Depth

Borders and soft shadows mark interaction: popovers, modals, menus, TV focus, drag and drop targets. Glow belongs only to focused TV states.

## Shapes

Default radius `6px`; `4px` for tight controls, `8px` or `10px` for panels, pill for segmented controls and badges. TV uses one radius, `--radius-tv` (`12px`), plus intentional pills and circles.

## Components

`system/components.css` is the web binding and binds web surfaces in full. Every TV surface shares the web TV list-first look; native ones within their platform conventions.

### Buttons

- **Primary:** `--button-primary-bg`, hover `--button-primary-bg-hover`, label `--button-primary-fg`. At most one per action group.
- **Secondary:** `--button-default-bg` plus a `--border` border; hover steps both (`--button-default-bg-hover`, `--border-hover`).
- **Ghost:** text only, `--button-ghost-fg`; hover adds `--button-ghost-bg-hover` and lifts the label to `--button-ghost-fg-hover`. Use it for anything quieter than secondary: header `Sign in`, toolbar actions, `Cancel` beside a confirm, icon-only buttons.
- **Disabled:** colour drops to `--solid` at full opacity: filled variants take a `--solid` fill with `--solid-foreground` labels; quiet ones take `--solid` text. A finished action stays filled with `data-state="success"` on `.btn-success`.
- **Focus:** `--shadow-focus`, a 2px `--bg` gap then a 2px `--solid-hover` ring, at least 3:1 against the page and panels in both modes.
- A bordered button always fills (secondary). Border-only buttons read smaller beside solid fills and vanish on dark.
- Four sizes share one box per size across tiers: default 36px, `md` 32px, `sm` 28px, `xs` 24px. Read `--button-height*`, `--button-padding-x*`, `--button-label-size*`, `--button-tracking*`, `--button-icon-size`, `--button-gap`.
- A dark bar on a light page is a `.dark`-scoped region.
- The sticky top bar is `--nav-height` (`--nav-height-compact` on narrow viewports); its CTA is `md` via `--nav-cta-height`.
- TV buttons use the `tv` scale and `--radius-tv`; focus restores a visible box.

### Rows, fields, and panels

- File rows are the core component: raw names, compact metadata, obvious hover and focus at the same row height.
- Fields read `--field-bg`, `--field-border`, and `--field-ring` (focus). They are filled: `--bg-secondary` on a `--line` border, so they read on the page as well as in panels. Hover steps the border to `--border-hover`; focus steps it to `--solid-hover` with a matching 1px ring, at least 3:1 against the fill, the page, and panels in both modes (WCAG 1.4.11). Disabled fields take `--component-bg`. `--bg-secondary` is the field fill, so fields never sit on it. `aria-invalid="true"` turns border and text red; the fill stays.
- Raised panels read `--panel-*`.
- Feedback uses `.form-callout`: `--alert-*` colours, `data-state` `info`, `success`, or `error`; `.inline` drops surface and border. It holds a message only. `.form-group` (`8px` gap) spaces a control and its feedback.
- Every field and form error eases in through `.form-reveal`: `grid-template-rows` `0fr` to `1fr` plus opacity, over `--dur-reveal` (`180ms`) with `--ease-out`, so whatever sits below slides instead of jumping. A field error sits under its field inside `.form-group`, where the row absorbs the group gap; a form error sits above the submit button. `data-state="open"` shows it. Keep the `role="alert"` message mounted and rendered; empty it once a closed row has collapsed. An `aria-invalid` field or code fades its border red over the same `--dur-reveal`. Under `prefers-reduced-motion` nothing animates.

### Auth

- Sign in, sign up, password reset, and two-factor pages have no card or panel: the form sits on `--bg`. Recipe: `.auth-page`, `.auth-header`, `.auth-main`, `.auth-column`, `.auth-title`, `.auth-note`, `.auth-links`, `.auth-footer`.
- The logo sits top-left in the header, in a `30.33px` box (26px ink × 7/6). The top right stays empty by default.
- One left-aligned column, up to `340px`, is centred horizontally and optically centred vertically: the form's middle sits near 45% of the viewport height, never below the true middle.
- A quiet centred footer links Terms of Service, Privacy Policy, and Help in muted `--fs-ui`.
- Text is one size: everything except the title and fields is `--fs-ui`. That covers labels, hints, `.auth-note` lines, errors, the link row, and the footer. Fields take `--fs-field`.
- One title per screen: `--fs-title` (`22px`), medium, `--tracking-snug` (`-0.01em`). No subtitles, taglines, or marketing lines; copy stays short.
- Fields and buttons keep the standard 36px box: the filled field and a full-width default-size primary.
- Labels are small, muted, and above the field.
- The primary button is full-width yellow. Secondary actions sit under the form as muted text links: “Forgot password?”, “New to put.io? Sign up”, “Wrong account? Sign out”.
- Tab order runs fields, submit, then secondary links; DOM order follows visual order, with no positive `tabindex`. Two-factor runs the code, Verify, then its links. The reveal-password toggle takes `tabindex="-1"` and keeps its accessible name: keyboard-only users can't toggle visibility, screen-reader users still can in browse mode. No link leaves the tab order.
- Form errors: one message in a `.form-reveal` row right above the submit button, in red `--fs-ui` text, 8px under the fields. Invalid fields turn red. Auth forms never use the boxed `.form-callout`.
- Copy: “Sign in”, “Sign up”, and “That username or password doesn't look right.”
- auth.put.io still ships the older card layout: drift.
- References: `web-s06-auth`, `web-p00c-auth-signin`, `web-p00d-auth-signup`, `web-p00e-auth-2fa`. Outside references: the TIDAL, Stripe Link, Cursor, Linear, and Vercel sign-in pages.
- One-time codes are one `.otp-input` (`inputmode="numeric"`, `autocomplete="one-time-code"`, `maxlength="6"`, `aria-invalid`) shown through two `.otp-group`s, one `.otp-separator`, and six `.otp-slot`s; script syncs slot text and `filled`/`active`, and maps a clicked slot to the input selection. The slots stretch the full column with mono digits. The label reads “Code from your authenticator app”, with no hint line.
- Editing an invalid code closes the error; retry waits for six digits. `data-state="verifying"` disables the input, keeps the digits, and announces through a polite live region. `data-state="success"` keeps the digits read-only, announces continuation in a `role="status"` region, and shows no further action; the consumer owns navigation. The submit turns a disabled `.btn-success` with `data-state="success"`, relabelled “Verified”, announced through a visually hidden status region.
- “Use a recovery code” appears only once a consumer owns the route. Groups own the responsive width, so the control fits narrow columns without scrolling.

### TV

- TV is list-first and focus-first: a file browser, not a poster wall. TV repos consume the generic tokens and own their bindings.
- Surfaces are solid token colours, no blur or translucency. Focus is a fill: rows go to `--component-bg-active`; web TV buttons step fill and border at `--border-width` (1px); `tv.focus.borderWidth` (3px) is unused. Values live in `tv.focus.row.*` and `tv.focus.control.*`. Roku dialog buttons are borderless and follow their variant.
- Navigation is a Home hub pushing full screens; no tab bar. Menus are centred modals.
- These rules bind every TV app. tvOS and Android TV ship one React Native app that draws the same fill with the system lift off.
- The `tv` token group (type, spacing, overscan, radius, focus, z) is adapter data, absent from web CSS: cite it by graph path, never `--tv-*`. Overscan multiplies `tv.overscan.x` by width and `tv.overscan.y` by height. `tv.z.overlay` sits above `tv.z.toast`, the reverse of web.

## Content and Icons

Show filenames exactly as stored, such as `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`. Icons are Phosphor-style inline SVG; product UI carries no emoji.
