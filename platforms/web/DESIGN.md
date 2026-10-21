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

Tier 1: the full design system applies, including the component library, the
`components.css` recipes and dedicated styles. Tier definitions live in
[Binding Tiers](../../DESIGN.md#binding-tiers).

**This is the one tier where the web recipes are the contract.** Every other
tier inherits the token values and builds components from its own platform.

## Surfaces

| Surface | Rules                                                    |
| ------- | -------------------------------------------------------- |
| App     | dark by default, dense, product root font-size, 1440x900 |
| Landing | either mode, 16px body, more air                         |
| Auth    | panel on page background, `--panel-*` aliases            |

Mode defaults follow [Colors](../../DESIGN.md#colors); the root font-size
follows [Typography](../../DESIGN.md#typography).

## Values

The root [DESIGN.md](../../DESIGN.md) owns every web value and rule:

| Topic                                                      | Owner                                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Root font-size, `--fs-*`, spacing ramp, `--z-*`, `--bp-*`  | [Layout & Spacing](../../DESIGN.md#layout--spacing), [Typography](../../DESIGN.md#typography) |
| Radius scale                                               | [Shapes](../../DESIGN.md#shapes)                                                              |
| Button tiers, outline rule, the four sizes, `--nav-height` | [Components](../../DESIGN.md#components)                                                      |
| File rows, `--field-*`, `--panel-*`, `aria-invalid`        | [Components](../../DESIGN.md#components)                                                      |
| GT America coverage, Berkeley Mono roles, weights          | [Typography](../../DESIGN.md#typography)                                                      |
| Yellow, hover peer, semantic scales                        | [Colors](../../DESIGN.md#colors)                                                              |
| Elevation                                                  | [Elevation & Depth](../../DESIGN.md#elevation--depth)                                         |
| File-type icons                                            | [Binding Tiers](../../DESIGN.md#binding-tiers)                                                |

## Don't

- Invent a z-index, a yellow, or a radius outside the scale.
- Ship a transparent bordered button; a bordered button fills, as the secondary tier.
- Use a text glyph as a symbol; use a Phosphor icon.
- Put more than one primary in an action group.
- Apply these recipes to any other tier.
