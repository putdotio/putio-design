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

Tier definitions live in [Binding Tiers](../../DESIGN.md#binding-tiers).

## Surfaces

| Surface | Rules |
| --- | --- |
| App | dark by default, dense, 14px body, 1440x900 |
| Landing | either mode, 16px body, more air |
| Auth | panel on page background, `--panel-*` aliases |

Dark is the product default. Light is allowed for landing, docs and narrow
product states where readability is stronger.

## Values

The root [DESIGN.md](../../DESIGN.md) owns every web value and rule; this file
does not restate them.

| Topic | Owner |
| --- | --- |
| Root font-size, `--fs-*`, spacing ramp, `--z-*`, `--bp-*` | [Layout & Spacing](../../DESIGN.md#layout--spacing), [Typography](../../DESIGN.md#typography) |
| Radius scale | [Shapes](../../DESIGN.md#shapes) |
| Button tiers, outline rule, the four sizes, `--nav-height` | [Components](../../DESIGN.md#components) |
| File rows, `--field-*`, `--panel-*`, `aria-invalid` | [Components](../../DESIGN.md#components) |
| GT America coverage, Berkeley Mono roles, weights | [Typography](../../DESIGN.md#typography) |
| Yellow, hover peer, semantic scales | [Colors](../../DESIGN.md#colors) |
| Elevation | [Elevation & Depth](../../DESIGN.md#elevation--depth) |

Every file-type icon is `--yellow-solid`, Phosphor, all types.

## Style

House style: one fact per line, tables over paragraphs, no em dashes.

## Don't

- Invent a z-index, a yellow, or a radius outside the scale.
- Ship a transparent bordered button.
- Use a text glyph as a symbol.
- Put more than one primary in an action group.
- Assume these recipes bind any other tier.
