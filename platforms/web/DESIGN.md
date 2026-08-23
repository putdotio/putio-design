---
version: "0.1.0"
name: "put.io on web"
description: "Binding contract for www.put.io, app.put.io and auth.put.io. Tier 1: the full design system."
tier: 1
platforms: ["www.put.io", "app.put.io", "auth.put.io"]
source: "putio-web apps/app + system/components.css"
reviewed:
  date: "2026-08-23"
  against: "putio-web apps/app: ui/AppLayout, features/transfers, features/settings, features/history, features/rss, features/public-shares"
  cards: 36
mode: "dark default, light supported"
---

# put.io on web

## Binding

Tier 1. The full design system applies: the component library, the
`components.css` recipes, dedicated styles.

**This is the one tier where the web recipes are the contract.** Every other
tier inherits the token values and builds components from its own platform.

Tier definitions live in [ADR 0009](https://github.com/putdotio/putio-frontend/blob/main/docs/decisions/0009-design-binding-tiers.md).

## Surfaces

| Surface | Rules |
| --- | --- |
| App | dark by default, dense, 14px body, 1440x900 |
| Landing | either mode, 16px body, more air |
| Auth | panel on page background, `--panel-*` aliases |

Dark is the product default. Light is allowed for landing, docs and narrow
product states where readability is stronger.

## Scale

Root font-size is responsive: 14px, stepping to 15px at `--bp-lg`. Body, labels
and inputs sit at `--fs-base` (1rem). Captions and button labels at `--fs-sm`
(0.875rem). Display tiers (`--fs-2xl`, `--fs-3xl`, `--fs-display`) are fixed px
and do not scale with the root.

Spacing is steep: 4, 8, 16, 32, 64, 128, 256, 512. Use it rather than tuning
one-off gaps.

Radius default 6px. 4px for tight controls, 8px or 10px for larger panels, pill
for segmented controls and badges.

Z-index comes from the token scale: `--z-dropdown` 1000, `--z-sticky` 1100,
`--z-modal` 1300, `--z-notification` 1400, `--z-tooltip` 1500. Never invent one.

Breakpoints `--bp-sm`/`--bp-md`/`--bp-lg` are 640/768/1280px. CSS media queries
cannot read custom properties, so write the literal px in `@media` and keep them
in sync.

## Buttons

Three tiers on one axis: emphasis.

| Tier | Rest | Hover |
| --- | --- | --- |
| Primary | `--button-primary-bg` fill, `--button-primary-fg` label | `--button-primary-bg-hover` |
| Secondary | `--button-default-bg` fill, border at `--border` | `--button-default-bg-hover`, `--border-hover` |
| Ghost | text only, `--button-ghost-fg` | `--button-ghost-bg-hover` behind the label, `--button-ghost-fg-hover` |

Yellow is reserved for primary commands. An action group carries at most one.

The ghost label lift is mandatory. The faint fill is never the only hover cue.

Disabled drops colour to `--solid` at full opacity rather than fading the box.

**Outline is not a tier.** The system ships no transparent-background bordered
button. Never place a border-only button in the same action group as a solid
fill: at identical box heights the outlined shape reads smaller, because a solid
resolves to a hard edge and a low-contrast hairline resolves to a soft one. It
is worst on dark surfaces, where a 15%-white hairline is barely visible. If a
bordered treatment must sit near a fill, it fills: that is the secondary tier.

Four sizes, no others. Read them from the tokens rather than restating numbers:
`--button-height` (`-md`, `-sm`, `-xs`), `--button-padding-x`,
`--button-label-size`, `--button-tracking`, `--button-icon-size`,
`--button-gap`.

| Size | Height | Tracking |
| --- | --- | --- |
| default | 36px, 12px padding, `--fs-sm` uppercase | 1px |
| md | 32px | 0.8px |
| sm | 28px | 0.6px |
| xs | 24px, 8px padding, `--fs-xs` | 0.3px |

Geometry is tokenized so every tier and variant of a size shares an identical
box. Tiers change colour only, which makes cross-variant comparison safe by
construction.

Sticky top bar is `--nav-height` (56px), or `--nav-height-compact` (52px) on
narrow viewports. Its CTA is the `md` box via `--nav-cta-height`.

## File rows

The core component. Preserve raw names, keep metadata compact, make hover and
focus obvious without inflating row height.

Every file-type icon is `--yellow-solid`, Phosphor, all types.

## Fields

Shared `--field-*` aliases: `--field-bg` fill, `--field-border` resting border,
`--field-ring` focus.

Invalid fields opt in with `aria-invalid="true"` and use red border and text
only. No red fill.

Raised panels use the shared `--panel-*` aliases, never auth- or screen-specific
panel variables.

## Type

GT America for UI and display. Berkeley Mono for numerics, timestamps, file
sizes, ETAs, counts, code, logs, identifiers, hashes, magnet URIs and filenames.
Pair mono with `font-variant-numeric: tabular-nums` wherever numbers sit in a
column.

GT America is Latin, 523 codepoints, no dingbats. Two consequences:

1. **Symbols are always icons, never text glyphs.** A checkmark typed as
   `U+2713` renders as nothing.
2. **Keep a fallback family behind GT America for any text that can hold a
   filename.** Web gets per-glyph fallback free, so the gap is invisible here
   and appears on platforms that resolve one font per label.

Medium weight for labels and controls. Bold where hierarchy earns it. Black for
deliberate display moments.

## Colour

Yellow `#FDCE45` is `--yellow-solid` in both modes. Brand mark, primary action
fill, file emphasis, progress, focus. `--yellow-solid-hover` for primary hover.

Do not invent alternate yellows, gradient yellow into another accent, or use
yellow as foreground text on light surfaces.

Semantic red, green and neutral scales come from tokens, never one-off CSS.

Every button token aliases the neutral scale, which carries both modes, so a
dark bar on a light page is a `.dark`-scoped region and never hand-picked dark
literals.

## Elevation

Clarifies interaction, does not decorate. Borders and soft shadows for popovers,
modals, menus and drop targets. No decorative glow.

## Layout

File-browser layouts first: lists, rows, columns, sidebars, toolbars, sheets.
Prefer whitespace and subtle dividers before card-heavy composition.

## Style

This file follows the house style in [system/README.md](../../system/README.md#house-style): one fact per line, tables over paragraphs, no em dashes.

## Don't

- Invent a z-index, a yellow, or a radius outside the scale.
- Ship a transparent bordered button.
- Use a text glyph as a symbol.
- Put more than one primary in an action group.
- Assume these recipes bind any other tier.
