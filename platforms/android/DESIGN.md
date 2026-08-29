---
version: "0.1.0"
name: "put.io on Android"
description: "Binding contract for Android and Android TV. Tier 2: tokens only, every component from Material 3."
tier: 2
platforms: ["Android", "Android TV"]
source: "Material 3 + @putdotio/design token graph"
reviewed:
  date: "2026-08-29"
  against: "Material 3 + Google's TV design (Compose for TV) + the native Android binding + the token graph."
  cards: ["android-s00-shell", "android-s01-settings", "androidtv-s00-shell", "androidtv-s01-search", "androidtv-s02-account", "androidtv-s03-continue-watching"]
canvas:
  phone: "412x915dp"
  tv: "1920x1080px"
mode: "dark only"
---

# put.io on Android

## Binding

Tier 2. Tokens only. Every component comes from Material 3.

Phone and tablet use an `androidx.compose.material3.darkColorScheme(...)` filled
from the token graph. Android TV uses the separate
`androidx.tv.material3.darkColorScheme(...)` API. Each generated scheme projects
the same semantic contract through the roles exposed by that Compose library.
Material then owns pressed, disabled, selected and focused component states.

The two libraries use separate `MaterialTheme` composition locals. A TV root
provides the TV scheme for `androidx.tv.material3` controls. When a control is
available only from `androidx.compose.material3`, provide the phone/tablet M3
scheme at that boundary or pass the mapped colours explicitly; the TV scheme
does not theme regular M3 controls. Prefer the TV component when both libraries
provide one. At the current library versions, `Switch` is a TV component;
`LinearProgressIndicator` is the regular-M3 mixed-local case.

There is no put.io Android component library and there will not be one.

Tier definitions live in [ADR 0009](https://github.com/putdotio/putio-frontend/blob/main/docs/decisions/0009-design-binding-tiers.md).

## Phone and tablet colour scheme

| M3 role | put.io token |
| --- | --- |
| `primary` | `--yellow-solid` |
| `onPrimary` | `--primary-foreground` |
| `primaryContainer` | `--yellow-solid` |
| `onPrimaryContainer` | `--primary-foreground` |
| `secondary` | `--text` |
| `secondaryContainer` | `--yellow-solid` at 26% |
| `onSecondaryContainer` | `--yellow-solid` |
| `background` | `--app-bg` |
| `onBackground` | `--text` |
| `surface` | `--app-bg` |
| `onSurface` | `--text` |
| `onSurfaceVariant` | `--text-secondary` |
| `surfaceContainerLow` | `--component-bg` |
| `surfaceContainer` | `--component-bg` |
| `surfaceContainerHigh` | `--component-bg-hover` |
| `surfaceContainerHighest` | `--component-bg-active` |
| `inverseSurface` | `--component-bg-active` |
| `inverseOnSurface` | `--text` |
| `inversePrimary` | `--yellow-text-secondary` |
| `outline` | `--border` |
| `outlineVariant` | `--line` |
| `error` | `--red-solid` |

The container roles keep stock FAB, navigation and bottom-sheet components on
the put.io palette instead of falling back to Material baseline purple. The
inverse roles bind stock snackbars to the documented surface, text and action
colours. State layers are Material's 8% and 12% over `onSurface`, not put.io
hover tokens.

## Android TV colour scheme

Compose for TV predates the `surfaceContainer` roles and names its outline roles
`border` and `borderVariant`. Its `darkColorScheme(...)` projects the same
contracted semantics through the roles its API provides.

| Compose for TV role | put.io token |
| --- | --- |
| `primary` | `--yellow-solid` |
| `onPrimary` | `--primary-foreground` |
| `primaryContainer` | `--yellow-solid` |
| `onPrimaryContainer` | `--primary-foreground` |
| `inversePrimary` | `--yellow-text-secondary` |
| `secondary` | `--text` |
| `secondaryContainer` | `--yellow-solid` at 26% |
| `onSecondaryContainer` | `--yellow-solid` |
| `background` | `--app-bg` |
| `onBackground` | `--text` |
| `surface` | `--app-bg` |
| `onSurface` | `--text` |
| `surfaceVariant` | `--component-bg` |
| `onSurfaceVariant` | `--text-secondary` |
| `inverseSurface` | `--component-bg-active` |
| `inverseOnSurface` | `--text` |
| `border` | `--border` |
| `borderVariant` | `--line` |
| `error` | `--red-solid` |

Both schemes are dark only.

Stock Compose for TV list-item focus reads `inverseSurface`; binding the inverse
and container roles prevents focused and selected controls from falling back to
Material baseline colours.

Platform repos generate both maps from the token graph. Never hand-write the
resolved colours.

## Metrics

dp, from Material, on a 412x915dp canvas. Not the put.io spacing ramp. The ramp
(4/8/16/32) applies where M3 leaves the choice open.

| Element | Metric |
| --- | --- |
| Top app bar | 64dp small, 152dp large |
| Navigation bar | 80dp; indicator geometry is Material-owned, 56x32dp in the current M3 Expressive implementation, at 26% primary |
| List item | 56 / 72 / 88dp; leading icon 24dp in a 40dp container |
| Divider | 1dp, inset 72dp to align with the label |
| FAB | 56dp, 16dp corner |
| Switch | 52x32dp, 2dp outline off, handle 16 to 24dp on select |
| Slider | 16dp track, 4dp handle, full-round ends |
| Dialog | 28dp corner, 24dp padding |
| Bottom sheet | 28dp top corners, 32x4dp drag handle |
| Snackbar | 48dp, 4dp corner |
| Docked search bar | 56dp, fully rounded |
| Button | 40dp, pill |

## The switch is the proof

Put the Android switch next to the iOS one. Both are yellow when on, because
both read `--yellow-solid`. Neither looks like the other: 52x32dp with a 2dp
outline and a handle that grows 16 to 24dp, against 51x31pt with a full-height
knob and no outline.

That difference is the tier working. A design system that made them match would
be one that had overridden two platforms.

## Do not translate iOS

| iOS has | Android uses |
| --- | --- |
| Section footer | The supporting line on a two-line list item |
| Stepper | Slider, segmented button or menu |
| Inset-grouped list | Subheads on a flat surface |
| Action sheet | `AlertDialog` for destructive, `ModalBottomSheet` for choice-of-many |
| Text back-label | System gesture and a top-bar arrow |
| Long-press context menu | Overflow in a three-dot menu |
| Toolbar plus | FAB |

## Type and icons

GT America as the Material type family. `--fw-medium` on labels.

Berkeley Mono on sizes, rates, timestamps, quotas and version strings. Not on
Android TV.

Yellow Phosphor file icons, every type. Not Material Symbols: the icon family is
a cross-tier decision and Phosphor is it.

When the API kind has no dedicated Phosphor file glyph, use the closest
file-family glyph. `SWF` uses `file-code`.

## Android TV

The TV cards document the tier-2 binding. They apply the token graph to
Google's TV design rather than copying a generic-TV component recipe.

Focus is Compose for TV's: the focused `Surface` scales and elevates. Full-width
rows scale 1.02 to stay inside the safe area; compact surfaces (drawer items,
buttons, chips) take the stock 1.1. Smaller than tvOS's lift and with no
parallax tilt, because most Android TV remotes are five-way pads with no touch
surface. Keep the platform's numbers, do not port Apple's.

Top-level navigation is the M3 navigation drawer: an 80dp icon rail on the
left, expanding with labels while focus is inside it. Destinations are Files,
Search, History and Account.

Text entry is the system IME. No app-drawn keyboard, no mic affordance.

The switch is M3's (52x32dp), reading `primary` when on. Never the RN
iOS-green switch.

Dialogs are M3: 28dp corner, stacked full-width pill buttons on TV, focused
buttons fill `primary` and use the compact-surface 1.1 scale.

Uses the `tv` token group: body 36, caption 32, label 48, heading 64; spacing
4/8/16/32/64/128; radius 12. Overscan 4% x 2%.

No mono. TV numerics are GT America tabular figures.

Structure is the shared TV family look: retro wordmark header, a list of
destinations, 36px titles over 28px sublines, a 42px yellow Phosphor glyph in
the icon column.

Leanback launcher channels, programs, continue-watching and recommendations are
system APIs. Fill them with real files. Do not reproduce them inside the app.

No poster wall. Card-and-rail templates are built for catalogue apps with
artwork. A rail of grey rectangles with filenames underneath shows fewer items,
truncates longer names, and turns a straight D-pad path into one that crosses
the screen.

## Content

Raw filenames. No parsing, no posters, no thumbnails.

Progress in a row is a Material `LinearProgressIndicator`, not a self-painting
row background. The web transfer row paints its own fill; that is a tier-1
recipe built for a wide desktop list.

Destructive copy names the object and the consequence, in the dialog body.

## Style

This file follows the house style in [system/README.md](../../system/README.md#house-style): one fact per line, tables over paragraphs, no em dashes.

## Don't

- Reach for `components.css` `.switch`, `.modal` or `.sheet`. They encode web pointer states, a 6px radius and a hover model that does not exist on a phone.
- Make the Android app look like the iOS app. A floating glass capsule, a text back-label or a 51x31 iOS-proportioned switch all read as a port.
- Hand-write the colour scheme in an app repo.

## Adoption

The native Android implementation consumes `dist/tokens.dtcg.json`, generates
its phone and TV colour schemes, and owns all platform components. This repo
stays free of Kotlin and Android XML outputs by policy. Review Android cards
against the platform implementation before changing this contract.
