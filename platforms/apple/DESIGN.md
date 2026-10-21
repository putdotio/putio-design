---
version: "0.3.0"
name: "put.io on Apple platforms"
description: "Binding contract for iOS, iPadOS, watchOS and tvOS. Tier 2: tokens only, every component from the HIG."
tier: 2
platforms: ["iOS 26", "iPadOS 26", "watchOS", "tvOS"]
source: "Apple HIG + @putdotio/design token graph"
reviewed:
  date: "2026-10-03"
  against: "Apple HIG (iOS 26 / iPadOS 26 / watchOS / tvOS) + the token graph + stock SwiftUI controls."
  cards:
    [
      "ios-s00-shell",
      "ios-s01-files",
      "ios-s02-transfers",
      "ios-s04-settings",
      "ios-s03-players",
      "watchos-s00-shell",
      "tvos-s00-shell",
      "tvos-s01-search",
      "tvos-s02-account",
      "tvos-s03-continue-watching",
      "tvos-s04-diagnostics",
      "tvos-s05-unsupported",
      "mobile-s00-welcome",
    ]
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

Tier 2: tokens only, every component, composition and page from Apple's human
interface guidelines. Tier definitions live in
[Binding Tiers](../../DESIGN.md#binding-tiers). put.io supplies four things:

1. **Tint**. `--yellow-solid`, set once as the SwiftUI `.tint()`.
2. **Surfaces**. `--app-bg`, `--text`, `--text-secondary`. Dark only.
3. **Type**. GT America replaces SF Pro in app-drawn content. App-drawn control
   labels use `--fw-medium`. System-rendered chrome keeps SF, including tab
   labels, navigation titles and search fields.
4. **File icons**. Phosphor, yellow, every file type.

Native controls bind token values directly. Every colour is `Color.putio*`,
generated from the graph.

## Metrics

Points, from the HIG. The put.io spacing ramp applies only where the HIG leaves
the choice open.

Corner radius is the system's, concentric to its container. The web radius
scale (`--radius` and its steps) looks wrong beside a system corner.

## Liquid Glass

iOS 26. Glass is a material Apple composites, so it has no token value in the
graph.

Glass appears in the **floating layer only**: tab bar, toolbar, sheet chrome,
floating buttons. Lists, rows, forms and full-screen content are opaque
`--app-bg`. Glass never stacks on glass.

Prominent glass takes the brand tint. Plain glass stays neutral.

Buttons on opaque content use the stock `.borderedProminent` and `.bordered`
styles; glass buttons stay on the floating layer.

At most one prominent glass capsule appears on a screen.

## Elements

Every element is stock; its card shows where tokens land on the control, as
[Binding Tiers](../../DESIGN.md#binding-tiers) describes for tier-2 cards.

| Element                                           | Comes from                                                                                                | put.io supplies                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `TabView`                                         | iOS 26 floating tab bar, its glass, shrink-on-scroll, separate Search capsule, SF labels and Search glyph | tint on the selected tab; 24pt Phosphor glyph box    |
| `NavigationStack`                                 | SF large title, collapse, back chevron and previous title                                                 | tint                                                 |
| `NavigationSplitView`                             | sidebar, selection pill, column widths                                                                    | tint on the pill                                     |
| `List`                                            | row height, separator insets, swipe actions, scroll-edge effects                                          | row content; `NavigationLink` owns folder disclosure |
| `Form` `.insetGrouped`                            | 20pt margins, 10pt corners, 44pt rows, header and footer type                                             | surface tokens                                       |
| `Toggle`                                          | 51x31pt, knob, animation                                                                                  | tint when on                                         |
| `Stepper`, `Slider`, `Picker`, segmented `Picker` | geometry and behaviour                                                                                    | tint                                                 |
| Sheet                                             | detents, grabber, 38pt corner, parent scale-back                                                          | content                                              |
| `.contextMenu`                                    | blur, lifted preview, menu material                                                                       | menu items                                           |
| `.swipeActions`                                   | widths, roles, rubber-banding                                                                             | labels                                               |
| `ContentUnavailableView`                          | the entire empty state                                                                                    | glyph, title, body, tint                             |
| `ProgressView`                                    | 4pt linear bar and system-owned track                                                                     | tint on the fill                                     |
| `Gauge` `.accessoryCircularCapacity`              | 47pt ring, about 7pt stroke, system-derived track                                                         | tint                                                 |
| `Button`                                          | bordered styles on content; glass styles on floating layers                                               | tint and app-drawn label                             |
| `AVPlayerViewController`                          | the whole video surface                                                                                   | tint only                                            |

### Download state button

The one composed control. iOS has no determinate circular progress button, so
the app assembles one from a `Gauge`, an SF Symbol and a 44pt minimum tap
target.

| State       | Glyph                                 | Ring                                      |
| ----------- | ------------------------------------- | ----------------------------------------- |
| Idle        | `arrow-down` 20pt, `--solid`          | none                                      |
| Queued      | `clock` 20pt                          | none. A queue is not progress             |
| Downloading | `stop` 14pt                           | Gauge, tint fill and system-derived track |
| Downloaded  | `check-circle` 22pt, `--yellow-solid` | hidden                                    |
| Failed      | idle glyph                            | none. Reason goes in the subtitle         |

States without a ring keep the 44pt minimum target. While downloading, the
stock gauge expands the button's label and hit region to its 47pt intrinsic
ring, with an approximately 7pt stroke, and derives its unfilled track from the
tint. The app cannot set that track separately; use the stock ring rather than
a custom path.

System-owned accent glyphs and labels, such as the back control, sheet
checkmark and empty-state action, use the one app tint.

App-authored text that can bind its foreground independently may still use
`--yellow-text-secondary`.

## watchOS

Scope is counts, states and remote control. The watch is not a file browser.

A 176pt row cannot hold `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`,
and truncating strips exactly the information the name carries. The watch shows
counts and states, and hands the file to the phone.

Rows are full-bleed rounded rectangles on `--component-bg`, 12pt corner, **no
chevron**. The whole row is the target and the Digital Crown is the scroll. A
trailing chevron costs about 12% of usable width on a 41mm screen.

Adding a transfer starts on the phone or from a shared link; the watch has no
text entry.

One action per screen.

The system time keeps SF and is tinted by the app, so it renders
`--yellow-solid`.

## tvOS

Focus is `UIFocusSystem`'s: the focused view lifts, scaling with a light-source
shadow and a parallax tilt under the remote's touch surface. Make a view
focusable and let the OS draw focus.

The tier-4 focus recipe (a `--component-bg-active` fill, no scale) is a React
Native binding. On tvOS that fill sits underneath the system lift and never
replaces it.

Top-level navigation is a `TabView`. The bar floats at the top, hides while
content scrolls, and takes focus on swipe up. Search is a tab.

System-rendered `TabView` labels keep SF. App-authored TV content uses GT
America.

The focused tab is the system's light pill with dark text. Tier 4 forbids that
pill because put.io owns focus there; on tvOS the platform owns it.

Browse is a header and a list of destinations, matching every other put.io TV
surface.

Sizes come from the `tv` token group; see [web TV Scale](../tv-generic/DESIGN.md#scale).
Numerics follow the TV rule in [Typography](../../DESIGN.md#typography); a
debug overlay may use the system monospace.

Search types on the system linear keyboard via `UISearchController`. Recent
keywords surface as app-provided suggestions.

Settings rows are label-left value-right; select cycles booleans or opens a
full-screen chooser. tvOS settings carry no 51x31 toggle.

Continue watching uses a custom pre-play overlay before
`AVPlayerViewController`: title, raw filename, progress preview and two stacked
choices. Its buttons use the system focus treatment.

The tvOS cards show how search, account and pre-play continuation bind the
token graph to platform navigation and focus. Platform apps own the native
implementation.

## Welcome

The signed-out screen is shared with Android and drawn in
[`mobile-s00-welcome`](../../system/preview/mobile-s00-welcome.html).

| Part     | Value                                                                                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header   | `logo-retro-dark.svg`, 88 wide, centred in the 44pt nav bar slot                                                                                                                                                                                                                                                                                             |
| Heading  | `┌( ಠ‿ಠ)┘` on its own line, 32 above **Welcome!**; both Large Title 34/41; kaomoji semibold (its glyphs draw as hairlines), title medium                                                                                                                                                                                                                     |
| Lede     | Body 17/1.4, `--text-secondary`, 16 below the heading                                                                                                                                                                                                                                                                                                        |
| Position | content starts 128 below the header                                                                                                                                                                                                                                                                                                                          |
| Action   | one full-width `.borderedProminent` large capsule (50pt, 20pt side margin) **Sign in**; it opens put.io OAuth in the browser                                                                                                                                                                                                                                 |
| States   | session expired (heading **Welcome back!**), sign-in failed and secure storage unavailable: a notice on `--component-bg` 32 below the heading, its icon aligned to the first text line, with **Sign in**, **Try again** or **Reset and sign in**. No browser-open state: `ASWebAuthenticationSession` is modal and reports cancellation through its callback |

The kaomoji is the one native exception to the tier-1 voice rule. The screen
has one action: no sign-up link, password field or illustration.

## Content

The row title is the file's name as stored, per
[Content and Icons](../../DESIGN.md#content-and-icons): no parsing, no poster,
no thumbnail.

Subtitle is `size · relative date`, Berkeley Mono, tabular.

Berkeley Mono covers sizes, counts, rates, timestamps, quotas and build numbers
on iOS, iPadOS and watchOS. tvOS has no mono.

Failure reasons are sentences: "No seeders found", not `ERR_NO_PEERS`.

The audio player's artwork is the disco ball (`discoball.gif`); it shows no
cover art.

Chrome on a video frame sits off the theme surfaces: it uses white at fixed
opacities, same as the web player. Tint is the one token that crosses onto
video.

## Don't

- Port `components.css`. This tier has no put.io tab bar, nav bar, sidebar, switch or field; use the stock control.
- Hand-build a control. A control that keeps its shape under Dynamic Type was drawn, not composed.
- Write a hex literal in native code; use the generated `Color.putio*`.
- Use a 6px or 8px radius on a native surface; use the system corner.
- Ship a custom video player. Rebuilding the transport to add one control loses PiP, Lock Screen, CarPlay and the remote.
- Bring the web transfer row's self-painting progress fill to iOS. Use `ProgressView`.
- Make the Android app look like this one. Same tokens, different platform.

## Gaps

Record a missing token upstream in the graph instead of hand-rolling a value.
