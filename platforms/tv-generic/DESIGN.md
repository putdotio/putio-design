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
  cards:
    [
      "tv-f00-foundations",
      "tv-p00-navigation",
      "tv-s00-account",
      "tv-s01-player",
      "tv-p01-action-menus",
      "tv-f01-focus",
      "tv-s03-search",
      "tv-s04-history",
      "tv-s05-trash",
      "tv-s06-states",
      "tv-s07-auth",
      "tv-p04-resume",
      "tv-p05-conversion",
      "tv-s08-diagnostics",
    ]
canvas: "1920x1080"
radius: "12px, one value"
mode: "dark only"
---

# put.io on web TV

## Binding

Tier 4: the put.io design system as on web, restrained to a generic, calm,
list-first 10-foot interface. Tier definitions live in
[Binding Tiers](../../DESIGN.md#binding-tiers).

The generic TV implementation is the reference look for **every** TV surface.
Web TV and Roku match it directly. tvOS and Android TV share its family look
and keep their platform's focus behaviour.

## Scale

`system/tv.css` is authored 1:1 at 1920x1080: a px value in that file is a px
on the TV. Preview artboards render at the real 1920x1080 and scale down only
when a card is narrower.

The canonical 10-foot scale is the `tv` token group in the DTCG graph. Cite it
by graph path, as [Components](../../DESIGN.md#components) explains, along with
the overscan axes and the reversed `tv.z.*` order.

| Role     | Tokens                                                                                |
| -------- | ------------------------------------------------------------------------------------- |
| Type     | `tv.text.heading`, `tv.text.label`, `tv.text.body`, `tv.text.caption`, `tv.text.smol` |
| Weight   | `tv.fontWeight.regular`, `tv.fontWeight.medium`                                       |
| Spacing  | `tv.space.*`                                                                          |
| Radius   | `tv.radius` (`--radius-tv` in CSS), one value for every TV surface                    |
| Overscan | `tv.overscan.x` × viewport width, `tv.overscan.y` × viewport height                   |
| Stacking | `tv.z.modal`, `tv.z.toast`, `tv.z.overlay`                                            |
| Focus    | `tv.focus.*`, below                                                                   |

## Focus

A fill, as [Components](../../DESIGN.md#components) defines: rows go
transparent to `--component-bg-active`, and buttons step both fill and border.

| Role               | Rest                          | Focused                              |
| ------------------ | ----------------------------- | ------------------------------------ |
| Row fill           | `tv.focus.row.background`     | `tv.focus.row.backgroundFocused`     |
| Control fill       | `tv.focus.control.background` | `tv.focus.control.backgroundFocused` |
| Control border     | `tv.focus.control.border`     | `tv.focus.control.borderFocused`     |
| Control edge width | `tv.focus.borderWidth` (3px)  | same                                 |

Rows carry no border, on web TV or Roku. The edge width stays fixed through
focus, so focus never shifts layout. Label and icon stay
`context.tv.text.primary`.

The fill is the whole treatment: no white-invert pill, no scale, no yellow
halo.

tvOS is the deliberate exception: it is tier 2, the platform owns focus, and its
tab bar uses the system's light focused pill.

## Materials

Solid token colours on every TV surface, per
[Components](../../DESIGN.md#components).

## Navigation

A Home hub pushes full screens onto a stack, and menus are centred modals; see
[Components](../../DESIGN.md#components).

Account is the settings screen.

## Type

No mono in TV product UI; a debug overlay may use the platform's system
monospace. The TV numeric rule lives in [Typography](../../DESIGN.md#typography). Web TV
sets tabular figures with `font-variant-numeric: tabular-nums`, and React
Native with the same font feature settings.

## Content

Browse is a list of raw filenames, per
[Content and Icons](../../DESIGN.md#content-and-icons): no parsing, posters,
thumbnails, ratings or synopsis.

The resume decision is a prompt at play time; the browse-time trace of a
started video is the watched eye on its row, in `--text-secondary`.

History is the TV activity surface: finished outcomes only, nothing
mid-flight. Transfers are managed on web and mobile.

## Family feel

All four TV surfaces read as one product:

| Surface                 | Tier | Focus                                     |
| ----------------------- | ---- | ----------------------------------------- |
| tv.put.io, Tizen, webOS | 4    | `--component-bg-active` fill              |
| Roku                    | 3    | nine-patch footprint, fill only           |
| tvOS                    | 2    | system lift: scale, shadow, parallax tilt |
| Android TV              | 2    | Compose scale plus elevation, no tilt     |

Same header, same row anatomy, same 12px radius, same yellow icon column. They
differ only where the platform's own focus behaviour differs.

## Don't

- Add a tab bar; navigation is the Home hub stack.
- Anchor a menu to its trigger; menus are centred modals.
- Use blur or a translucent material.
- Use mono; numerics are GT America tabular figures.
- Invent a focus treatment; use the `tv.focus.*` fill.
- Use more than one radius.
- Draw an on-screen keyboard. Search delegates typing to the platform IME.
- Build a continue-watching row, shelf or hub tile, or a transfers screen.
