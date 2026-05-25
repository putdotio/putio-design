---
version: "0.1.0"
name: "put.io Design System"
description: "Public token and guidance contract for put.io product surfaces."
colors:
  brand: "#FDCE45"
  dark:
    app-bg: "hsl(0, 0%, 8.5%)"
    page-bg: "black"
    text: "hsl(0, 0%, 93.0%)"
    text-muted: "hsl(0, 0%, 62.8%)"
    border: "hsl(0, 0%, 24.3%)"
    success: "hsl(151, 55.0%, 41.5%)"
    danger: "hsl(358, 75.0%, 59.0%)"
  light:
    app-bg: "white"
    page-bg: "hsl(0, 0%, 97.3%)"
    text: "hsl(0, 0%, 9.0%)"
    text-muted: "hsl(0, 0%, 43.5%)"
    border: "hsl(0, 0%, 85.8%)"
    success: "hsl(151, 55.0%, 41.5%)"
    danger: "hsl(358, 75.0%, 59.0%)"
typography:
  ui:
    family: "\"GT America\", sans-serif"
    weight: 400
    size: "0.875rem"
    lineHeight: 1.45
  display:
    family: "\"GT America\", sans-serif"
    weight: 900
    size: "6rem"
    lineHeight: 1.1
  mono:
    family: "\"Berkeley Mono\", \"GT America Mono\", monospace"
    weight: 400
    size: "0.8125rem"
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

The canonical source for tokens is DTCG-compatible JSON in `tokens/`. Generated artifacts in `dist/` and `system/tokens.css` are outputs. This file is the human and agent-readable contract that explains how to use those tokens.

## Colors

Yellow `#FDCE45` is sacred. Use it for the put.io brand mark, primary action fill, folder/file emphasis, progress, and focus affordances. Do not tint it into a new brand color, gradient it into a different accent, or use it as foreground text on light surfaces.

Dark app surfaces are the default product mode, but the token contract includes both dark and light palettes. Light surfaces are allowed for landing, docs, and narrow product states where readability is stronger. Semantic red, green, and neutral scales should come from tokens rather than one-off CSS values.

## Typography

Use GT America for product UI and display. Use GT America Mono for compact product numerics where it matches the app. Use Berkeley Mono for code, logs, identifiers, hashes, and raw technical strings.

Body UI text should stay readable and dense. Use medium weight for labels and controls, bold weight only where the hierarchy earns it, and black weight for deliberate display moments.

## Layout & Spacing

put.io layouts are file-browser layouts first: lists, rows, columns, sidebars, toolbars, and sheets. Prefer whitespace and subtle dividers before card-heavy composition.

The spacing scale is intentionally steep: `4, 8, 16, 32, 64, 128, 256, 512`. Use it consistently rather than tuning one-off gaps.

## Elevation & Depth

Elevation should clarify interaction, not decorate. Use borders and soft shadows for popovers, modals, menus, TV focus, and draggable/drop targets. Avoid decorative glow except where it is part of a focused TV state.

## Shapes

The default radius is `6px`. Use `4px` for tight controls, `8px` or `10px` for larger panels, and pill radius for segmented controls, badges, and TV action pills.

## Components

Buttons use yellow only for primary commands. Secondary buttons should feel quiet and tokenized against the active surface. File rows are the core component: preserve raw names, keep metadata compact, and make hover/focus states obvious without inflating row height.

TV components are list-first and focus-first. A TV app is still a file browser, not a poster wall. Roku, native Apple, Android, and web TV repos should consume the generic tokens and generate their own platform bindings.

## Do's and Don'ts

Do show raw filenames such as `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`.

Do use Phosphor-style inline SVG for forward-looking icon guidance and no emoji in product UI.

Do keep `DESIGN.md`, `tokens/`, `dist/`, and `system/tokens.css` in agreement.

Don't publish private research, local file paths, Claude project links, screenshots, team photos, account data, discount strategy, or auth-gated workspace URLs in the public design repo.

Don't generate Swift, Kotlin, Android XML, or Roku outputs from this repo until a consuming platform repo asks for an adapter.
