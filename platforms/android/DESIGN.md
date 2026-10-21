---
version: "0.2.0"
name: "put.io on Android"
description: "Contract for Android phone and Android TV as shipped. Phone: tier 2, stock Material 3 on a token-built colour scheme. Android TV: the React Native TV app shared with Apple TV."
tier: 2
platforms: ["Android", "Android TV"]
source: "Material 3 + @putdotio/design token graph"
reviewed:
  date: "2026-10-21"
  against: "putio-android@84f5ce0 (mobile, core, design) + putio-tv-native-legacy@b1fb14a (Android TV target)"
  cards:
    [
      "android-e00-listitem",
      "android-e01-switch",
      "android-e02-navbar",
      "android-e03-fab",
      "android-e04-topbar",
      "android-e05-dialog",
      "android-e06-sheet",
      "android-e07-progress",
      "android-e08-button",
      "android-e09-slider",
      "android-e10-searchbar",
      "android-e11-snackbar",
      "android-s00-shell",
      "android-s01-settings",
      "androidtv-s00-shell",
      "androidtv-s01-search",
      "androidtv-s02-account",
      "androidtv-s03-continue-watching",
      "androidtv-s04-sign-in-verifying",
      "androidtv-s05-diagnostics",
      "androidtv-s06-unsupported",
      "mobile-s00-welcome",
    ]
canvas:
  phone: "412x915dp"
  tv: "1920x1080px"
mode: "dark only"
---

# put.io on Android

## Binding

Phone and tablet: tier 2, tokens only, every component from Material 3. Tier
definitions live in [Binding Tiers](../../DESIGN.md#binding-tiers).

The app generates one `androidx.compose.material3.darkColorScheme(...)` at build
time from a vendored, version-locked `dist/tokens.dtcg.json` and applies it as
the only theme input. Typography and shapes stay Material's defaults. Material
owns pressed, disabled, selected and focused component states.

Android TV ships the React Native TV app, not Compose; see
[Android TV](#android-tv).

## Phone and tablet colour scheme

| M3 role                   | put.io token              |
| ------------------------- | ------------------------- |
| `primary`                 | `--yellow-solid`          |
| `onPrimary`               | `--primary-foreground`    |
| `primaryContainer`        | `--yellow-solid`          |
| `onPrimaryContainer`      | `--primary-foreground`    |
| `secondary`               | `--text`                  |
| `secondaryContainer`      | `--yellow-solid` at 26%   |
| `onSecondaryContainer`    | `--yellow-solid`          |
| `background`              | `--app-bg`                |
| `onBackground`            | `--text`                  |
| `surface`                 | `--app-bg`                |
| `onSurface`               | `--text`                  |
| `onSurfaceVariant`        | `--text-secondary`        |
| `surfaceContainerLow`     | `--component-bg`          |
| `surfaceContainer`        | `--component-bg`          |
| `surfaceContainerHigh`    | `--component-bg-hover`    |
| `surfaceContainerHighest` | `--component-bg-active`   |
| `inverseSurface`          | `--component-bg-active`   |
| `inverseOnSurface`        | `--text`                  |
| `inversePrimary`          | `--yellow-text-secondary` |
| `outline`                 | `--border`                |
| `outlineVariant`          | `--line`                  |
| `error`                   | `--red-solid`             |

The container roles keep stock FAB, navigation and bottom-sheet components on
the put.io palette. The inverse roles bind stock snackbars to the put.io
surface, text and action colours. State layers are Material's 8% and 12% over
`onSurface`.

## Proposed: Compose for TV colour scheme

Proposed: not in the shipped Android TV app. A Compose for TV build would use
the separate `androidx.tv.material3.darkColorScheme(...)`, projecting the same
semantics through its roles. Compose for TV has no `surfaceContainer` roles and
names its outline roles `border` and `borderVariant`. The two libraries use
separate `MaterialTheme` composition locals: provide the phone scheme, or pass
mapped colours, where a control exists only in `androidx.compose.material3`.

| Compose for TV role    | put.io token              |
| ---------------------- | ------------------------- |
| `primary`              | `--yellow-solid`          |
| `onPrimary`            | `--primary-foreground`    |
| `primaryContainer`     | `--yellow-solid`          |
| `onPrimaryContainer`   | `--primary-foreground`    |
| `inversePrimary`       | `--yellow-text-secondary` |
| `secondary`            | `--text`                  |
| `secondaryContainer`   | `--yellow-solid` at 26%   |
| `onSecondaryContainer` | `--yellow-solid`          |
| `background`           | `--app-bg`                |
| `onBackground`         | `--text`                  |
| `surface`              | `--app-bg`                |
| `onSurface`            | `--text`                  |
| `surfaceVariant`       | `--component-bg`          |
| `onSurfaceVariant`     | `--text-secondary`        |
| `inverseSurface`       | `--component-bg-active`   |
| `inverseOnSurface`     | `--text`                  |
| `border`               | `--border`                |
| `borderVariant`        | `--line`                  |
| `error`                | `--red-solid`             |

Both schemes are dark only. Stock Compose for TV list-item focus reads
`inverseSurface`.

## Metrics

dp, from Material, on a 412x915dp canvas. The put.io spacing ramp applies only
where M3 leaves the choice open.

| Element        | Metric                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Top app bar    | 64dp small on every screen; medium and large are proposed                                                   |
| Navigation bar | 80dp; 56x32dp indicator at 26% primary. From 600dp a `NavigationRail`; a modal drawer when labels don't fit |
| List item      | 56 / 72 / 88dp; leading icon 24dp in a 40dp container; names wrap to two lines                              |
| Divider        | 1dp, inset 72dp in Files, 16dp in Transfers                                                                 |
| Switch         | 52x32dp, 2dp outline off, handle 16 to 24dp on select                                                       |
| Slider         | player timeline only: 4dp track, 12dp round thumb, no gap, no stop dot                                      |
| Progress       | 4dp, 4dp gap to the track, stop dot except in file rows                                                     |
| Dialog         | 28dp corner, 24dp padding, on `surfaceContainerHigh`                                                        |
| Bottom sheet   | 28dp top corners, 32x4dp drag handle; item actions                                                          |
| Snackbar       | 48dp, 4dp corner, no action                                                                                 |
| Search field   | `OutlinedTextField` under Search and History tabs; a docked search bar is proposed                          |
| Button         | 40dp, pill: filled, outlined, text. No FAB; tonal is proposed                                               |

## The switch is the proof

The Android switch reads `--yellow-solid` when on: 52x32dp with a 2dp outline
and a handle that grows 16 to 24dp. The shipped iOS `UISwitch` sets no tint, so
it draws system green: drift, documented in the Apple contract.

## Do not translate iOS

| iOS has                 | Android uses                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| Section footer          | The supporting line on a two-line list item                         |
| Stepper                 | Slider, segmented button or menu                                    |
| Inset-grouped list      | Subheads on a flat surface                                          |
| Action sheet            | `ModalBottomSheet` for an item's actions, `AlertDialog` to confirm  |
| Text back-label         | System gesture and a top-bar arrow                                  |
| Long-press context menu | Three-dot button opening the actions sheet; long press opens it too |
| Toolbar plus            | Filled `Button` above the list                                      |

## Type and icons

Type is Material's default scale in Roboto: no GT America, no Berkeley Mono.
Subheads are `titleSmall` in `primary`. The player's elapsed and duration labels
use the system monospace: drift from the Berkeley Mono rule, documented as
shipped. Android TV type is in [Android TV](#android-tv).

File icons are yellow Phosphor fill glyphs for every type; the icon family is a
cross-tier rule, so Material Symbols stay out of file rows. When the API kind
has no dedicated Phosphor file glyph, use the closest file-family glyph: `SWF`
uses `file-code`. Chrome glyphs are Phosphor regular, fill when selected.

## Android TV

Android TV ships `putio-tv-native-legacy`: React Native (react-native-tvos),
the same code as the Apple TV app. It halves the reported density, so 1dp is
one 1080p pixel and the layout matches Apple TV's 1920-wide canvas.

Colours come from the app's own `@putdotio/colors` (Radix gray dark), keyed by
the token names; nothing is generated from the token graph. The app draws its
own components and uses Lucide icons, so Android TV is drift from the tier-2
binding and the Phosphor rule, documented as shipped. Type is GT America,
regular and medium: heading 64, label 48, body 36, caption 32, small 24. No
mono in product UI. Icons are Lucide, stroke 2, in `--yellow-solid` on rows.

Navigation is a stack. Home lists Your Files, Search, History (when account
history is on) and Account under the retro wordmark; each row pushes a screen,
and Back pops it. There is no drawer.

Screens have a header (title 48 medium, or the wordmark on Home) over a 1px
`--line` rule, inset 4% of the width for overscan. Rows have radius 12, padding
32, no divider: a 48 glyph, a 36 title, a 32 `--text-secondary` subline and a
trailing chevron, `eye` on started videos, or a switch.

Focus is a `--component-bg-active` fill. Parallax is off; nothing scales or
elevates. Buttons are 1px `--border` on `--component-bg` with uppercase GT
America labels; focused, `--component-bg-active` with `--border-hover`.

Booleans use the native Android `Switch`: `--green-solid` thumb on
`--green-border` when on. Choices open a centred list modal on `--app-bg` with
a 1px `--line` border over `--overlay-full`.

Text entry is the system IME through a hidden input, with no app-drawn keyboard
and no mic affordance.

Browse is a list, never a poster rail. Leanback launcher channels, programs,
continue-watching and recommendations are system APIs; the app does not fill
them.

## Welcome

The signed-out screen is shared with iOS and drawn in
[`mobile-s00-welcome`](../../system/preview/mobile-s00-welcome.html).

| Part     | Value                                                                                                                                                                                                                                                                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header   | `logo-retro-dark.svg`, 88 wide, centred in the 64dp top app bar slot                                                                                                                                                                                                                                                                            |
| Heading  | `┌( ಠ‿ಠ)┘` on its own line, 32 above **Welcome!**; both headlineLarge 32/40; kaomoji semibold (its glyphs draw as hairlines), title medium                                                                                                                                                                                                      |
| Lede     | bodyLarge 16/1.5, `--text-secondary`, 16 below the heading                                                                                                                                                                                                                                                                                      |
| Position | content starts 20% of the height below the header, at most 128                                                                                                                                                                                                                                                                                  |
| Action   | one full-width M3 `Button` at the 56dp medium size, not the 40dp default, as the screen's only action (16dp side margin) **Sign in**; it opens put.io OAuth in the browser                                                                                                                                                                      |
| States   | session expired (heading **Welcome back!**), sign-in failed and secure storage unavailable: a notice on `--component-bg` 32 below the heading, its icon aligned to the first text line, with **Sign in**, **Try again** or **Reset and sign in**; browser open: **Almost there**, the lede, a 24 spinner 32 below it and an outlined **Cancel** |

The kaomoji is the one native exception to the tier-1 voice rule. The screen
has one action: no sign-up link, password field or illustration.

## Content

Rows follow [Content and Icons](../../DESIGN.md#content-and-icons): raw
filenames, no posters, no thumbnails.

Progress in a row is a Material `LinearProgressIndicator`. The web transfer
row's self-painting background is a tier-1 recipe for a wide desktop list.

Destructive copy names the object and the consequence, in the dialog body.

## Don't

- Reach for `components.css` `.switch`, `.modal` or `.sheet`. They encode web pointer states, a 6px radius and a hover model a phone lacks; use the stock M3 control.
- Port the iOS look. A floating glass capsule, a text back-label or a 51x31 iOS-proportioned switch all read as a port; use the M3 equivalent from [Do not translate iOS](#do-not-translate-ios).
- Hand-write the colour scheme or a resolved colour in the phone app; generate it from the token graph.
