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
    family: "\"GT America\", sans-serif"
    weight: 400
    size: "1rem"
    lineHeight: 1.45
  display:
    family: "\"GT America\", sans-serif"
    weight: 900
    size: "96px"
    lineHeight: 1.1
  mono:
    family: "\"Berkeley Mono\", monospace"
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

put.io is a content-agnostic cloud file product. The interface should feel premium because the file browser is useful, fast, quiet, and honest about the data it has. Design for raw filenames, folders, transfers, storage, playback controls, and settings without pretending that structured media metadata is always available.

The canonical source for tokens is DTCG-compatible JSON in `tokens/`. Generated artifacts in `dist/` and `system/tokens.css` are outputs. This file explains how to use those tokens.

## Binding Tiers

A web-rendered mock is never a native spec. Every surface binds to the system at one of five tiers, and every specimen card in `system/preview/` declares its tier in a strip above the artboard (`system/preview/_tier.css`; if the wording here changes, change that file in the same PR).

- **Tier 0 — Foundations.** The token graph. Binds every tier, values only, never a component recipe.
- **Tier 1 — www · app · auth.** The full design system: the component library and `system/components.css` recipes. The recipes are the contract here, and only here.
- **Tier 2 — iOS · iPadOS · tvOS · watchOS · Android · Android TV.** Tokens only. Every component, composition, and page comes from the platform's human interface guidelines; the cards document how a stock control receives put.io tokens, never how to rebuild one.
- **Tier 3 — Roku.** Tier-2 token inheritance, plus room for put.io conventions in custom SceneGraph components.
- **Tier 4 — tv.put.io · Tizen · webOS.** The design system as on web, restrained to a generic, calm, list-first 10-foot interface.

A tier-1/3/4 card is a Component — put.io owns the recipe. A tier-2 card is an Element — the platform owns the control. Per-platform binding contracts live in `platforms/<platform>/DESIGN.md`. One rule holds on every tier: every file-type icon is brand yellow, Phosphor, never a text glyph.

## Colors

Yellow `#FDCE45` is the resting `--yellow-solid` brand value in both light and dark modes. Use it for the put.io brand mark, primary action fill, folder/file emphasis, progress, and focus affordances. Use `--yellow-solid-hover` for primary button hover feedback; do not invent alternate yellows, gradient yellow into a different accent, or use yellow as foreground text on light surfaces.

Dark app surfaces are the default product mode, but the token contract includes both dark and light palettes. Light surfaces are allowed for landing, docs, and narrow product states where readability is stronger. Semantic red, green, and neutral scales should come from tokens rather than one-off CSS values.

## Typography

Use GT America for product UI and display. Berkeley Mono is the single mono face: numerics, timestamps, file sizes, ETAs, counts, code, logs, identifiers, hashes, magnet URIs, and filenames. Its tabular figures keep metadata columns aligned, so pair it with `font-variant-numeric: tabular-nums` wherever numbers sit in a column.

The mono role is web and mobile only. TV surfaces have no mono face — 10-foot numerics render in GT America, and should ask for its tabular figures wherever a number ticks or sits in a column. GT America Standard carries `tnum`, so any platform that can select OpenType features can honour this: web through `font-variant-numeric: tabular-nums`, React Native through the same font feature settings. Platforms that cannot select features get the default proportional figures, where `1` is 399/1000 em against `0` at 636, so a running timecode visibly reflows. Roku is the current example — its SceneGraph `Font` node accepts only a `uri` and a `size` — so budget 10-foot numeric layouts for proportional figures rather than assuming the columns line up.

GT America is a Latin face: 523 codepoints covering Western and Central European Latin plus Turkish, with no Cyrillic, Greek, CJK, Arabic, Hebrew, Thai, or Hangul, and no dingbats — no `U+2713 ✓`, `U+2714`, `U+25B6 ▶`, or `U+2605 ★`. Two rules follow. Symbols are always icons, never text glyphs, because a checkmark typed as text renders as nothing. And because put.io shows raw filenames, user content routinely arrives outside that coverage: keep a fallback family behind GT America for any text that can hold a filename. Web gets this for free — `"GT America", sans-serif` falls back per glyph — so the gap is invisible there and shows up on platforms that resolve one font per label with no per-glyph fallback, where uncovered characters become `.notdef` boxes. Treat a platform's fallback story for content text as part of adopting the face, not an afterthought.

Body UI text should stay readable and dense. Use medium weight for labels and controls, bold weight only where the hierarchy earns it, and black weight for deliberate display moments.

The root font-size is responsive like the product: 14px, stepping to 15px at the `--bp-lg` breakpoint. Body, labels, and inputs sit at `--fs-base` (1rem, equal to the root); captions and button labels sit at `--fs-sm` (0.875rem). The display tiers (`--fs-2xl`, `--fs-3xl`, `--fs-display`) are fixed pixel sizes and do not scale with the root.

## Layout & Spacing

put.io layouts are file-browser layouts first: lists, rows, columns, sidebars, toolbars, and sheets. Prefer whitespace and subtle dividers before card-heavy composition.

The spacing scale is intentionally steep: `4, 8, 16, 32, 64, 128, 256, 512`. Use it consistently rather than tuning one-off gaps.

Stacking uses the token scale — `--z-dropdown` (1000), `--z-sticky` (1100), `--z-modal` (1300), `--z-notification` (1400), `--z-tooltip` (1500) — gapped for platform chrome; never invent z-index numbers. Breakpoints (`--bp-sm`/`--bp-md`/`--bp-lg` = 640/768/1280px) mirror the product's responsive tiers; CSS media queries cannot read custom properties, so write the literal pixels in `@media` and keep them in sync with the tokens.

## Elevation & Depth

Elevation should clarify interaction, not decorate. Use borders and soft shadows for popovers, modals, menus, TV focus, and draggable/drop targets. Avoid decorative glow except where it is part of a focused TV state.

## Shapes

The default radius is `6px`. Use `4px` for tight controls, `8px` or `10px` for larger panels, and pill radius for segmented controls and badges.

TV is the exception: every 10-foot surface — list rows, buttons, sheets, cards, code tiles, keys — uses the single `--radius-tv` (`12px`). TV has one radius, not a scale; the only other radii on a TV surface are intentional pills and circles.

## Components

The component recipes below and in `system/components.css` are the **web
binding** of the token graph, and they bind the web surfaces in full. The other
tiers inherit differently: native apps (SwiftUI, Compose) consume the token
*values* and build every component from their platform's human interface
guidelines — stock controls themed with these tokens, never re-drawn web
recipes (first adopter: `DESIGN.md` in
[putio-ios](https://github.com/putdotio/putio-ios)); Roku inherits the tokens
with more room for put.io conventions in custom SceneGraph components; the
web-based TV app applies this system restrained to the product's generic
list-first 10-foot interface, which every TV surface — including the native
ones, within their platform conventions — treats as the shared family look.

Buttons have three tiers on one axis: emphasis. **Primary** is the brand fill — `--button-primary-bg` at rest, `--button-primary-bg-hover` on hover so the CTA never feels inert, label `--button-primary-fg`. Yellow is reserved for primary commands, and an action group carries at most one. **Secondary** is a quiet fill: `--button-default-bg` (aliased as `--button-secondary-bg`) plus a border at `--border`, with hover stepping both (`--button-default-bg-hover`, `--border-hover`). Because it fills, it reads to a hard edge exactly like the primary, so the two compare safely side by side. **Ghost** is text only — no fill, no border. `--button-ghost-fg` at rest; hover paints `--button-ghost-bg-hover` behind the label and lifts it to `--button-ghost-fg-hover`. The label lift is mandatory: the faint fill is never the only hover cue. Disabled drops the colour to `--solid` at full opacity rather than fading the box. Use ghost for anything quieter than a filled secondary — a header `Sign in`, toolbar text actions, `Cancel` beside a filled confirm. An icon-only ghost is the quiet icon button, on the same tokens.

Outline is not a tier. The system ships no transparent-background bordered button, and consumers must not hand-roll one. The pairing rule behind that: never place a border-only button in the same action group as a solid fill. At identical box heights the outlined shape reads smaller, because a solid resolves to a hard edge while a low-contrast hairline resolves to a soft one, and the eye compares the two extents differently. It is worst on dark surfaces, where a 15%-white hairline is barely visible at all. If a bordered treatment must sit near a fill, it must itself fill — the secondary tier — and carry its border at `--border`-step contrast, never a sub-20% hairline on transparent.

Button geometry is tokenized so every tier and variant of a given size shares an identical box; tiers change colour only, which makes cross-variant comparison safe by construction. There are four sizes and no others. The default is `36px` tall with `12px` of horizontal padding, an `--fs-sm` uppercase label and `1px` of tracking; `md` is `32px` at `0.8px` tracking, `sm` is `28px` at `0.6px`, and `xs` is `24px` with `8px` padding, an `--fs-xs` label and `0.3px` tracking. Read them from `--button-height` (`-md`, `-sm`, `-xs`), `--button-padding-x` (`-xs`), `--button-label-size` (`-xs`), `--button-tracking` (`-md`, `-sm`, `-xs`), `--button-icon-size` and `--button-gap` rather than restating the numbers. Every button token aliases the neutral scale, which carries both modes, so a dark bar on a light page is a `.dark`-scoped region and never hand-picked dark literals. The sticky site top bar is `--nav-height` (`56px`), or `--nav-height-compact` (`52px`) on narrow viewports, and its CTA is the `md` box via `--nav-cta-height`.

TV needs no carve-out here: TV buttons keep the `tv` scale box and `--radius-tv`, and TV focus restores a visible box (`--component-bg-active` plus a border step), so the ghost tier stays legible in the 10-foot focus model.

File rows are the core component: preserve raw names, keep metadata compact, and make hover/focus states obvious without inflating row height.

Form fields use the shared `--field-*` aliases: `--field-bg` for the fill, `--field-border` for the resting border, and `--field-ring` for focus. Invalid fields opt in with `aria-invalid="true"` and use red border/text only; do not add red fill. Raised panels use the shared `--panel-*` aliases instead of auth- or screen-specific panel variables.

Browser Auth composition is fluid up to a `340px` column. It uses the standard
`36px` field recipe, a `30.33px` wordmark box (the `26px` ink height multiplied
by its `7/6` view-box ratio), and left-aligned headings at `19px` / weight
`500`. The prompt and its action form a centered two-line footer. User-facing
actions say “Sign in” and “Sign up”, and an invalid credential response says
exactly “That username or password doesn't look right.” The shipped
`web-s06-auth` screen plus `web-p00c-auth-signin`, `web-p00d-auth-signup`, and
`web-p00e-auth-2fa` are the Tier-1 composition references for this contract.

Form feedback uses the exported `.form-callout` recipe. Its block form reads
the `--alert-*` families and selects `info`, `success`, or `error` with
`data-state`; `.inline` removes the surface and border while keeping the same
semantic text colour. Callouts remain messages, not containers for unrelated
form layout. Their parent uses `.form-group`, whose `6px` gap owns the spacing
between a control and its inline feedback.

One-time passwords use one semantic `.otp-input`, never six independent
inputs. Place it with two three-slot `.otp-group` elements, one
`.otp-separator`, and six visual `.otp-slot` elements. The input carries
`inputmode="numeric"`, `autocomplete="one-time-code"`, `maxlength="6"`, and
`aria-invalid`; script synchronizes slot text plus `filled` / `active` state.
The root uses `data-state="verifying"` while submission is in flight and keeps
the entered digits visible; the backing input is disabled for the same period.
Successful verification uses `data-state="success"`, retains the six digits in
a read-only input, announces automatic continuation with a `role="status"`
callout, and does not leave another action on screen. The consumer owns the
backend transition and navigation timing.
Groups, not slots, own the responsive width, so the complete control contracts
to narrow Auth cards without horizontal scrolling.

Password feedback uses `.password-strength` with `data-strength` set to
`empty`, `weak`, `fair`, `good`, or `strong`. Its
`.password-strength-meter` is the semantic `role="meter"` and owns the ARIA
range/value. Its `aria-valuetext` must match both `data-strength` and the
visible categorical label. Four `.password-strength-segment` elements and a
`.password-strength-label` render the visual state and its text equivalent.

TV components are list-first and focus-first. A TV app is still a file browser, not a poster wall. Roku, native Apple, Android, and web TV repos should consume the generic tokens and generate their own platform bindings.

TV surfaces are solid token colors — no translucent materials and no blur. Focus is expressed as a fill, never a lift: rows go transparent to `--component-bg-active`, and buttons step both their fill and their border. Navigation is a Home hub that pushes full screens onto a stack; there is no tab bar. Menus are centred modals, not popovers anchored to a trigger. These focus and material rules bind the web TV and Roku surfaces; a native TV binding follows its platform's own control conventions where the platform owns focus — Apple tvOS buttons use the system focus treatment (adopted 2026-08) while non-control TV surfaces stay solid everywhere.

The 10-foot scale lives in the `tv` token group — type steps, spacing ramp, overscan ratios, radius, and z-indices — carried as data for platform adapters rather than emitted into web CSS. Overscan ratios declare their viewport axis: multiply `tv.overscan.x` by viewport width and `tv.overscan.y` by viewport height, then compose screen padding locally with the spacing tokens. Two rules do not cross over: TV has no mono face, and TV stacks `tv.z.overlay` above `tv.z.toast`, the reverse of the web `--z-*` order. Emit the two scales separately. Cite the `tv` group by its graph path, never as `--tv-*`: those names are read from the DTCG artifacts by platform adapters and are deliberately absent from `dist/css/tokens.css`, so CSS-variable syntax would promise a `var()` that resolves to nothing.

## Do's and Don'ts

Do show raw filenames such as `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`.

Do use Phosphor-style inline SVG for forward-looking icon guidance and no emoji in product UI.

Do keep `DESIGN.md`, `tokens/`, `dist/`, and `system/tokens.css` in agreement.

Don't publish private material in this public repo — the enumerated list lives in the repo's `docs/DISTRIBUTION.md` (Public Safety).

Don't generate platform-native outputs (Swift, Kotlin, Android XML, Roku) from this repo — platform repos own their adapters. Policy in the repo's `docs/DISTRIBUTION.md`.
