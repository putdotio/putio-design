---
version: "0.1.0"
name: "put.io on web TV"
description: "Binding contract for tv.put.io, Samsung Tizen and LG webOS. Tier 4: the design system as on web, restrained to a 10-foot interface."
tier: 4
platforms: ["tv.put.io", "Tizen", "webOS"]
source: "putio-web apps/tv + system/tv.css"
reviewed:
  date: "2026-10-21"
  against: "putdotio/putio-web apps/tv @ 1e23ebdb7"
  cards:
    [
      "tv-f00-foundations",
      "tv-f01-focus",
      "tv-p00-navigation",
      "tv-p01-action-menus",
      "tv-p03-select-modal",
      "tv-p04-resume",
      "tv-p05-conversion",
      "tv-s00-account",
      "tv-s01-player",
      "tv-s02-player",
      "tv-s03-search",
      "tv-s04-history",
      "tv-s05-trash",
      "tv-s06-states",
      "tv-s07-auth",
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

The shipped app is `apps/tv` in putio-web; the `tv-*` cards draw it. Its look
is the reference for every TV surface. Web TV and Roku match it directly.
tvOS and Android TV share its family look and keep their platform's focus
behaviour.

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

## Screen

A screen is a header over a scrolling body. The header holds the logo on Home
and sign-in, a 48px medium title elsewhere, or Account's avatar block, with
small buttons at the right, over a 1px `--list-item-border` rule. Rows are
114px, 150px with a description line, with a 48px yellow glyph.

## Focus

A fill, as [Components](../../DESIGN.md#components) defines: rows go
transparent to `--component-bg-active`, and buttons step both fill and border.

| Role               | Rest                          | Focused                              |
| ------------------ | ----------------------------- | ------------------------------------ |
| Row fill           | `tv.focus.row.background`     | `tv.focus.row.backgroundFocused`     |
| Control fill       | `tv.focus.control.background` | `tv.focus.control.backgroundFocused` |
| Control border     | `tv.focus.control.border`     | `tv.focus.control.borderFocused`     |
| Control edge width | `--border-width` (1px)        | same                                 |

Rows carry no border. The edge width stays fixed through focus, so focus never
shifts layout. Label and icon keep their colours. `apps/tv` does not use
`tv.focus.borderWidth` (3px).

The fill is the whole treatment: no white-invert pill, no scale, no yellow
halo, no transition. Only the player chrome fades, over `--dur-fast`.

tvOS is the deliberate exception: it is tier 2, the platform owns focus, and its
tab bar uses the system's light focused pill.

## Materials

Solid token colours on every TV surface, per
[Components](../../DESIGN.md#components).

## Navigation

A Home hub of Your Files, Search, History and Account pushes full screens onto
a stack; Back pops. History hides when the account turns history off. Menus,
sort and file actions are one centred select overlay; see
[Components](../../DESIGN.md#components).

Account is the settings screen. It links Playback engine, Tunnel route, Manage
your trash, Device info and Playback test.

## Type

No mono in TV product UI. Support surfaces (the player's Stats panel, Device
info values, a playback failure's support report) use the platform's system
monospace. `apps/tv` sets no tabular figures; times and sizes use GT America's
default figures.

## Content

Browse is a list of raw filenames, per
[Content and Icons](../../DESIGN.md#content-and-icons): no parsing, posters,
thumbnails, ratings or synopsis.

The resume decision is a prompt at play time; the browse-time trace of a
started video is the eye on its row, in `--text-secondary`.

History is the TV activity surface: completed transfers and files shared with
you, nothing mid-flight. Transfers are managed on web and mobile.

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
- Anchor a menu to its trigger; menus are centred overlays.
- Colour a destructive option; every overlay option is the same row.
- Use blur or a translucent material.
- Use mono in product UI.
- Invent a focus treatment; use the `tv.focus.*` fill.
- Use more than one radius.
- Draw an on-screen keyboard. Search delegates typing to the platform
  keyboard.
- Build a continue-watching row, shelf or hub tile, or a transfers screen.
