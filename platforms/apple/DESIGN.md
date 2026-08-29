---
version: "0.2.0"
name: "put.io on Apple platforms"
description: "Binding contract for iOS, iPadOS, watchOS and tvOS. Tier 2: tokens only, every component from the HIG."
tier: 2
platforms: ["iOS 26", "iPadOS 26", "watchOS", "tvOS"]
source: "Apple HIG + @putdotio/design token graph"
reviewed:
  date: "2026-08-29"
  against: "Apple HIG (iOS 26 / iPadOS 26 / watchOS / tvOS) + the token graph + stock SwiftUI controls."
  cards: ["ios-s00-shell", "ios-s01-files", "ios-s02-transfers", "ios-s04-settings", "ios-s03-players", "watchos-s00-shell", "tvos-s00-shell", "tvos-s01-search", "tvos-s02-account", "tvos-s03-continue-watching"]
canvas:
  iphone: "393x852pt"
  ipad: "1024x768pt"
  watch: "176x215pt"
  tv: "1920x1080px"
tint: "--yellow-solid"
mode: "dark only"
---

# put.io on Apple platforms

## Binding

Tier 2. Tokens only. Every component, composition and page comes from Apple's
human interface guidelines. put.io supplies four things and nothing else:

1. **Tint**. `--yellow-solid` `#FDCE45`, set once as the SwiftUI `.tint()`.
2. **Surfaces**. `--app-bg`, `--text`, `--text-secondary`. Dark only.
3. **Type**. GT America replaces SF Pro in app-drawn content. App-drawn control
   labels use `--fw-medium`. System-rendered chrome keeps SF, including tab
   labels and navigation titles.
4. **File icons**. Phosphor, yellow, every file type.

Tier definitions live in [ADR 0009](https://github.com/putdotio/putio-frontend/blob/main/docs/decisions/0009-design-binding-tiers.md).
Never port `components.css`; native controls bind token values directly.

## Metrics

Points, from the HIG, not the put.io spacing ramp. The ramp (4/8/16/32/64)
applies only where the HIG leaves the choice open.

Corner radius is the system's, concentric to its container. `--radius` is a web
value and looks wrong beside a system corner.

## Liquid Glass

iOS 26. Glass is a material Apple composites, not a token, so it cannot resolve
to a value in the graph.

Glass appears in the **floating layer only**: tab bar, toolbar, sheet chrome,
floating buttons. Lists, rows, forms and full-screen content are opaque
`--app-bg`. Never glass over glass.

Prominent glass takes the brand tint. Plain glass stays neutral.

Buttons on opaque content use the stock `.borderedProminent` and `.bordered`
styles. Glass buttons have no content-layer carve-out.

At most one prominent glass capsule appears on a screen.

## Elements

Stock. Documented on cards so a designer can see tokens land on them. Never a
build instruction.

| Element | Comes from | put.io supplies |
| --- | --- | --- |
| `TabView` | iOS 26 floating tab bar, its glass, shrink-on-scroll, separate Search capsule, SF labels and Search glyph | tint on the selected tab; 24pt Phosphor glyph box |
| `NavigationStack` | SF large title, collapse, back chevron and previous title | tint |
| `NavigationSplitView` | sidebar, selection pill, column widths | tint on the pill |
| `List` | row height, separator insets, swipe actions, scroll-edge effects | row content; `NavigationLink` owns folder disclosure |
| `Form` `.insetGrouped` | 20pt margins, 10pt corners, 44pt rows, header and footer type | surface tokens |
| `Toggle` | 51x31pt, knob, animation | tint when on |
| `Stepper`, `Slider`, `Picker`, segmented `Picker` | geometry and behaviour | tint |
| Sheet | detents, grabber, 38pt corner, parent scale-back | content |
| `.contextMenu` | blur, lifted preview, menu material | menu items |
| `.swipeActions` | widths, roles, rubber-banding | labels |
| `ContentUnavailableView` | the entire empty state | glyph, title, body, tint |
| `ProgressView` | 4pt linear bar and system-owned track | tint on the fill |
| `Gauge` `.accessoryCircularCapacity` | 47pt ring, about 7pt stroke, system-derived track | tint |
| `Button` | bordered styles on content; glass styles on floating layers | tint and app-drawn label |
| `AVPlayerViewController` | the whole video surface | tint only |

### Download state button

The one composed control. iOS has no determinate circular progress button, so
the app assembles one from a `Gauge`, an SF Symbol and a 44pt minimum tap
target.

| State | Glyph | Ring |
| --- | --- | --- |
| Idle | `arrow-down` 20pt, `--solid` | none |
| Queued | `clock` 20pt | none. A queue is not progress |
| Downloading | `stop` 14pt | Gauge, tint fill and system-derived track |
| Downloaded | `check-circle` 22pt, `--yellow-solid` | hidden |
| Failed | idle glyph | none. Reason goes in the subtitle |

The 44pt value is the minimum target for states without a ring. While
downloading, the stock gauge expands the button's label and hit region to its
47pt intrinsic ring, with an approximately 7pt stroke. The gauge derives its
unfilled track from the tint.

The app cannot set the gauge track separately. The stock ring wins over a
custom path.

System-owned accent glyphs and labels use the one app tint. Do not split the
back control, sheet checkmark, or empty-state action across yellow roles.

App-authored text that can bind its foreground independently may still use
`--yellow-text-secondary`.

## watchOS

Scope is counts, states and remote control. Not a file browser.

A 176pt row cannot hold `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`,
and truncating strips exactly the information the name carries. The watch shows
counts and states, and hands the file to the phone.

Rows are full-bleed rounded rectangles on `--component-bg`, 12pt corner, **no
chevron**. The whole row is the target and the Digital Crown is the scroll. A
trailing chevron costs about 12% of usable width on a 41mm screen.

No text entry. Adding a transfer starts on the phone or from a shared link.

One action per screen.

The system time keeps SF and is tinted by the app, so it renders
`--yellow-solid`.

## tvOS

Focus is `UIFocusSystem`'s: the focused view lifts, scaling with a light-source
shadow and a parallax tilt under the remote's touch surface. Make a view
focusable and let the OS do it. Never draw a focus ring.

The tv-native focus recipe (a `--component-bg-active` fill, no scale) is a React
Native binding on tier 4. On tvOS that fill sits underneath the system lift, it
does not replace it.

Top-level navigation is a `TabView`, not a header with a Search button. The bar
floats at the top, hides while content scrolls, and takes focus on swipe up.
Search is a tab.

System-rendered `TabView` labels keep SF. App-authored TV content uses GT
America.

The focused tab is a light pill with dark text. This contradicts the tv-native
"never a white-invert pill" rule deliberately: tv-native is tier 4 where put.io
owns focus, tvOS is tier 2 where the platform does.

No poster wall. A header and a list of destinations, matching every other put.io
TV surface.

Uses the `tv` token group: body 36, caption 32, label 48, heading 64; spacing
4/8/16/32/64/128; radius 12. Overscan 4% x 2%.

No mono. TV numerics are GT America tabular figures.

Search types on the system linear keyboard via `UISearchController`. Recent
keywords surface as app-provided suggestions.

Settings rows are label-left value-right; select cycles booleans or opens a
full-screen chooser. No 51x31 toggle on tvOS.

Continue watching uses a custom pre-play overlay before
`AVPlayerViewController`: title, raw filename, progress preview and two stacked
choices. It is not a stock system alert; its buttons use the system focus
treatment.

The tvOS cards document how search, account and pre-play continuation bind the
token graph to platform navigation and focus. Platform apps own the native
implementation.

## Content

Raw filenames. The row title is the file's name as stored. No parsing into a
title, no poster, no thumbnail.

Subtitle is `size · relative date`, Berkeley Mono, tabular.

Berkeley Mono covers sizes, counts, rates, timestamps, quotas and build numbers
on iOS, iPadOS and watchOS. Not on tvOS.

Failure reasons are sentences, not codes. "No seeders found", not
`ERR_NO_PEERS`.

The disco ball (`discoball.gif`, shipped since 2013) is the audio player's
artwork. The audio player has no cover art and never will.

Chrome sitting on a video frame is not on a theme surface: it uses white at
fixed opacities, same as the web player. Tint is the one token that crosses onto
video.

## Style

This file follows the house style in [system/README.md](../../system/README.md#house-style): one fact per line, tables over paragraphs, no em dashes.

## Don't

- Port `components.css`. There is no put.io tab bar, nav bar, sidebar, switch or field on this tier.
- Hand-build a control. Anything that keeps its shape under Dynamic Type was drawn, not composed.
- Write a hex literal in a native PR. Every colour is `Color.putio*`, generated from the graph.
- Use a 6px or 8px radius on a native surface.
- Ship a custom video player. Rebuilding the transport to add one control loses PiP, Lock Screen, CarPlay and the remote.
- Bring the web transfer row's self-painting progress fill to iOS. Use `ProgressView`.
- Make the Android app look like this one. Same tokens, different platform.

## Gaps

Record token gaps upstream in the graph rather than hand-rolling a value.
