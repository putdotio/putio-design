---
version: "0.1.0"
name: "put.io on web TV"
description: "Binding contract for tv.put.io, Samsung Tizen and LG webOS. Tier 4: the design system as on web, restrained to a 10-foot interface."
tier: 4
platforms: ["tv.put.io", "Tizen", "webOS"]
source: "generic TV reference implementation + system/tv.css"
reviewed:
  date: "2026-08-25"
  against: "The generic TV reference implementation, its screen inventory, and system/tv.css."
  cards: ["tv-f00-foundations", "tv-p00-navigation", "tv-s00-account", "tv-s01-player", "tv-p01-action-menus", "tv-f01-focus", "tv-s03-search", "tv-s04-history", "tv-s05-trash", "tv-s06-states", "tv-s07-auth", "tv-p04-resume", "tv-p05-conversion"]
canvas: "1920x1080"
radius: "12px, one value"
mode: "dark only"
---

# put.io on web TV

## Binding

Tier 4. The put.io design system applies as on web, restrained to a generic,
calm, list-first 10-foot interface.

The generic TV implementation is the reference look for **every** TV surface.
Web TV and Roku match it directly. tvOS and Android TV align to the same family
feel without giving up their platform's focus behaviour.

Tier definitions live in [ADR 0009](https://github.com/putdotio/putio-frontend/blob/main/docs/decisions/0009-design-binding-tiers.md).

## Scale

`system/tv.css` is authored 1:1 at 1920x1080. A px value in that file is a px on
the TV. Preview artboards render at the real 1920x1080 and scale down only when
a card is narrower.

The canonical 10-foot scale is the `tv` token group in the DTCG graph, not the
stylesheet. Cite it by graph path (`tv.text.body`), never as `--tv-*`: those
names are read from the DTCG artifacts by platform adapters and are deliberately
absent from `dist/css/tokens.css`, so CSS-variable syntax would promise a
`var()` that resolves to nothing.

| Role | Value |
| --- | --- |
| `tv.text.heading` | 64 |
| `tv.text.label` | 48 |
| `tv.text.body` | 36 |
| `tv.text.caption` | 32 |
| Spacing | 4 / 8 / 16 / 32 / 64 / 128 |
| Radius | 12, one value for every TV surface |
| Overscan | 4% of viewport width, 2% of viewport height |

Overscan ratios declare their axis: multiply `tv.overscan.x` by viewport width
and `tv.overscan.y` by viewport height, then compose padding locally with the
spacing tokens.

TV stacks `tv.z.overlay` above `tv.z.toast`, the reverse of the web `--z-*`
order.

## Focus

A fill, never a lift. Rows go transparent to `--component-bg-active`. Buttons
step both fill and border.

Not a white-invert pill. Not `scale(1.06)`. Not a yellow halo. Both of those
were invented in an earlier revision of these specimens and removed.

tvOS is the deliberate exception: it is tier 2, the platform owns focus, and its
tab bar uses the system's light focused pill.

## Materials

Solid token colours. No translucency, no blur on any TV surface.

## Navigation

A Home hub that pushes full screens onto a stack. There is no tab bar.

Menus are centred modals, not popovers anchored to a trigger.

Account is the settings screen. There is no separate preferences screen.

## Type

No mono on any TV tier. Berkeley Mono is a web and mobile rule.

10-foot numerics are GT America with tabular figures, via
`font-variant-numeric: tabular-nums` on web and the same font feature settings
in React Native.

GT America Standard carries `tnum`, so any platform that can select OpenType
features honours this. Platforms that cannot get proportional figures, where `1`
is 399/1000 em against `0` at 636, so a running timecode visibly reflows. Roku
is the current example.

## Content

A TV app is a file browser, not a poster wall.

Raw filenames. No parsing, no posters, no thumbnails, no ratings, no synopsis.

No continue-watching row, shelf or hub tile. The resume decision is a prompt at
play time; the browse-time trace of a started video is the watched eye on its
row.

No transfers screen. History is the TV activity surface: finished outcomes
only, nothing mid-flight.

Watched videos show the watched eye in `--text-secondary`.

The icon set is the app's three glyphs. Do not expand it without a reason.

## Family feel

All four TV surfaces read as one product:

| Surface | Tier | Focus |
| --- | --- | --- |
| tv.put.io, Tizen, webOS | 4 | `--component-bg-active` fill |
| Roku | 3 | nine-patch footprint, fill plus a 3px edge |
| tvOS | 2 | system lift: scale, shadow, parallax tilt |
| Android TV | 2 | Compose scale plus elevation, no tilt |

Same header, same row anatomy, same 12px radius, same yellow icon column. They
differ only where the platform's own focus behaviour differs.

## Style

This file follows the house style in [system/README.md](../../system/README.md#house-style): one fact per line, tables over paragraphs, no em dashes.

## Don't

- Add a tab bar.
- Anchor a menu to its trigger.
- Use blur or a translucent material.
- Use mono.
- Invent a focus treatment.
- Use more than one radius.
- Draw an on-screen keyboard. Search delegates typing to the platform IME.
- Build a continue-watching row or a transfers screen.
