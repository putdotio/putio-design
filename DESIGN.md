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

## Colors

Yellow `#FDCE45` is the resting `--yellow-solid` brand value in both light and dark modes. Use it for the put.io brand mark, primary action fill, folder/file emphasis, progress, and focus affordances. Use `--yellow-solid-hover` for primary button hover feedback; do not invent alternate yellows, gradient yellow into a different accent, or use yellow as foreground text on light surfaces.

Dark app surfaces are the default product mode, but the token contract includes both dark and light palettes. Light surfaces are allowed for landing, docs, and narrow product states where readability is stronger. Semantic red, green, and neutral scales should come from tokens rather than one-off CSS values.

## Typography

Use GT America for product UI and display. Berkeley Mono is the single mono face: numerics, timestamps, file sizes, ETAs, counts, code, logs, identifiers, hashes, magnet URIs, and filenames. Its tabular figures keep metadata columns aligned, so pair it with `font-variant-numeric: tabular-nums` wherever numbers sit in a column.

The mono role is web and mobile only. TV surfaces have no mono face — 10-foot numerics render in GT America with tabular figures.

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

Buttons use yellow only for primary commands. Primary buttons use `--button-primary-bg` at rest and `--button-primary-bg-hover` on hover so the CTA never feels inert. Secondary buttons should feel quiet and tokenized against the active surface. File rows are the core component: preserve raw names, keep metadata compact, and make hover/focus states obvious without inflating row height.

Form fields use the shared `--field-*` aliases: `--field-bg` for the fill, `--field-border` for the resting border, and `--field-ring` for focus. Invalid fields opt in with `aria-invalid="true"` and use red border/text only; do not add red fill. Raised panels use the shared `--panel-*` aliases instead of auth- or screen-specific panel variables.

TV components are list-first and focus-first. A TV app is still a file browser, not a poster wall. Roku, native Apple, Android, and web TV repos should consume the generic tokens and generate their own platform bindings.

TV surfaces are solid token colors — no translucent materials and no blur. Focus is expressed as a fill, never a lift: rows go transparent to `--component-bg-active`, and buttons step both their fill and their border. Navigation is a Home hub that pushes full screens onto a stack; there is no tab bar. Menus are centred modals, not popovers anchored to a trigger.

The 10-foot scale lives in the `tv` token group — type steps, spacing ramp, overscan percentages, screen paddings, and z-indices — carried as data for platform emitters rather than emitted into web CSS. Two rules do not cross over: TV has no mono face, and TV stacks `--tv-z-overlay` above `--tv-z-toast`, the reverse of the web `--z-*` order. Emit the two scales separately.

## Do's and Don'ts

Do show raw filenames such as `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`.

Do use Phosphor-style inline SVG for forward-looking icon guidance and no emoji in product UI.

Do keep `DESIGN.md`, `tokens/`, `dist/`, and `system/tokens.css` in agreement.

Don't publish private material in this public repo — the enumerated list lives in the repo's `docs/DISTRIBUTION.md` (Public Safety).

Don't generate platform-native outputs (Swift, Kotlin, Android XML, Roku) from this repo — platform repos own their adapters. Policy in the repo's `docs/DISTRIBUTION.md`.
