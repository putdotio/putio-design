---
version: "0.4.0"
name: "put.io on Apple platforms"
description: "Contract for iOS, iPadOS and tvOS as shipped. iOS and iPadOS: one UIKit app, tier 2. tvOS: the React Native TV app. watchOS: nothing ships."
tier: 2
platforms: ["iOS 26", "iPadOS 26", "tvOS", "watchOS (proposed)"]
source: "UIKit + @putdotio/design token graph"
reviewed:
  date: "2026-10-21"
  against: "putio-ios main@db149b5e (iOS, iPadOS) + putio-tv-native-legacy@b1fb14a (tvOS); watchOS: no app"
  cards:
    [
      "ios-e00-list-row",
      "ios-e01-toggle",
      "ios-e02-slider",
      "ios-e03-segmented",
      "ios-e04-stepper",
      "ios-e05-glass-button",
      "ios-e06-picker",
      "ios-e07-inset-group",
      "ios-e08-searchfield",
      "ios-e09-progress",
      "ios-e10-tabbar",
      "ios-e11-navbar",
      "ios-e12-sheet",
      "ios-e13-contextmenu",
      "ios-e14-swipe",
      "ios-e15-emptystate",
      "ios-e16-gauge",
      "ios-s00-shell",
      "ios-s01-files",
      "ios-s02-transfers",
      "ios-s03-players",
      "ios-s04-settings",
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
tint: "--yellow-text-secondary"
mode: "dark only"
---

# put.io on Apple platforms

## Binding

Tier 2: tokens only on stock UIKit. Tier definitions live in
[Binding Tiers](../../DESIGN.md#binding-tiers). put.io supplies four things:

1. **Tint**. `--yellow-text-secondary`, set on the window, tab bar, nav bar,
   toolbar and table cells.
2. **Surfaces**. `--app-bg` content, opaque `--nav-bg` nav bar,
   `--component-bg` settings rows. Dark only (`UIUserInterfaceStyle` Dark).
3. **Type**. GT America on app labels through the type-scale roles; nav titles
   Bold 17, tab labels Medium 10. Berkeley Mono only for audio player times
   and two-factor codes. Search fields and alerts stay system SF. Filenames,
   sizes and dates in GT America are drift from the Berkeley Mono roles.
4. **Icons**. Phosphor, regular with a fill variant for selection. Only
   folders are yellow; other file glyphs in `--text-secondary` are drift from
   the yellow file-icon rule.

Every colour is a generated `UIColor.Putio.*`. Cards without a shipped
counterpart carry a Proposed marker.

## Shell

- One UIKit app, iPhone and iPad (`TARGETED_DEVICE_FAMILY` 1,2).
- `UITabBarController`: Files, History, Downloads, Account. History hides
  when history is off. Glyphs are folder, clock-counter-clockwise,
  cloud-arrow-down and user-circle at 24pt, filled when selected.
- Badges: active download count on Downloads, unread support on Account.
- iOS 26 draws the tab bar as floating glass on iPhone and as a top tab bar on
  iPad. No split view, no sidebar, no Search tab.
- Large titles are off. Bar buttons sit in system glass with the tint.
- One `UISearchController`, on the root **Your Files**.

## Liquid Glass

Glass comes from the OS: the tab bar and bar buttons. The app sets tint only
and draws no glass of its own. Content stays opaque.

At most one prominent glass capsule appears on a screen. Today none does.

## Elements

| Element     | Shipped as                                        | put.io supplies                                                        |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| File row    | `UITableViewCell` xib, 55pt                       | 20pt Phosphor icon; GT America 17 title, 13 subtitle; caret, eye       |
| Swipe       | `UIContextualAction`, trailing, no full swipe     | Trash `--red-solid`, Download `--solid`, More `--component-bg`         |
| Row menu    | `UIAlertController` action sheet                  | Rename, Move, Play original in VLC                                     |
| ⋯ menu      | pull-down `UIMenu`                                | Select, New Folder, sort options                                       |
| Empty state | `EmptyStateView.xib`                              | GT America Bold 28 heading and 17 line, `--text`, no glyph             |
| Settings    | `.grouped` `UITableView`                          | `--component-bg` rows, Phosphor icons, `--yellow-text-secondary` caret |
| Switch      | `UISwitch`                                        | nothing; on state is system green                                      |
| Choices     | `UIAlertController`                               | one action per option                                                  |
| Slider      | `UISlider`, audio player only                     | fill `--yellow-solid`, track `--solid`                                 |
| Progress    | `UIProgressView`, Converting Video only           | fill `--yellow-solid`, track `--line`                                  |
| Sheet       | `UISheetPresentationController`, analytics prompt | `--bg-secondary`, fitted detent, grabber                               |
| Video       | `AVPlayerViewController`                          | nothing on the video surface                                           |

Not shipped: segmented control, stepper, picker, context menu, `Gauge`,
`ContentUnavailableView`, inset-grouped forms.

App-authored text and system accents share one tint, `--yellow-text-secondary`.
`--yellow-solid` marks folder icons, carets, the resume eye and progress fills.

### Download state button

The one composed control: a 50pt `UIControl` with a Phosphor glyph and its own
2pt ring (`CAShapeLayer`, 30pt, round caps).

| State       | Glyph                                      | Ring                                  |
| ----------- | ------------------------------------------ | ------------------------------------- |
| Idle        | `download-simple` 20pt, `--solid`          | none                                  |
| Queued      | `clock` 20pt, `--solid`                    | none                                  |
| Downloading | `stop` fill 14pt, `--solid`                | `--line` track, `--yellow-solid` fill |
| Downloaded  | `check-circle` fill 20pt, `--yellow-solid` | hidden                                |
| Stopped     | idle glyph                                 | none; reason in the subtitle          |

Subtitles: "In Queue", "Starting...", "Downloading... N%", "Stopped",
"Failed: <message>", "<size> - Downloaded <ago>".

## tvOS

The shipped tvOS app is React Native (react-native-tvos), shared with Android
TV. It draws its own components from its own `@putdotio/colors`: drift from the
tier-2 binding, documented as shipped.

- Home is the logo over a list: Your Files, Search, History, Account. Each
  pushes a full-screen stack screen. No `TabView`.
- Focus is a `--component-bg-active` fill on a 12px radius; buttons add a
  `--border-hover` border. The system lift is off.
- GT America, no mono, no tabular figures. Row icons are Phosphor in
  `--yellow-solid`: fill for file types, regular for the rest.
- Values sit as `--text-secondary` sublines under row titles.
- Booleans are an app-drawn 70×40 switch, `--green-solid` when on.
- Button labels are uppercase.
- Search uses an app-drawn field over a hidden `TextInput`, up to five recent
  keywords, and a settings modal that disables or clears history.
- A saved position opens a pre-play screen: filename, screenshot, progress,
  two stacked buttons.
- Sizes: [web TV Scale](../tv-generic/DESIGN.md#scale).

## watchOS

No watchOS app ships. The watch card is proposed.

## Welcome

iOS and Android move to one signed-out screen, drawn in
[`mobile-s00-welcome`](../../system/preview/mobile-s00-welcome.html): the
retro wordmark in the nav bar, a kaomoji roll with mono yellow captions and
page dots, **Welcome!**, one lede line, and one full-width **Sign in** button
that opens `ASWebAuthenticationSession`. The
[Android contract](https://github.com/putdotio/putio-android/blob/main/DESIGN.md#welcome)
owns its states and copy.

The card is Proposed. iOS as reviewed still ships the older screen: a 240pt
`logo-retro-dark`, one 320×38 **Log in** button, and an "Authentication
failed" alert.

## Content

The row title is the file's name as stored, per
[Content and Icons](../../DESIGN.md#content-and-icons): no parsing, no poster,
no thumbnail.

iOS subtitle is `size - relative date` in GT America. tvOS subline is size only.

The audio player's artwork is the disco ball (`discoball.gif`) for every track.

## Don't

- Port `components.css`. This tier has no put.io tab bar, nav bar or sidebar.
- Write a hex literal in native code; use the generated `UIColor.Putio.*`.
- Ship a custom video player. Rebuilding the transport loses PiP, Lock Screen,
  CarPlay and the remote.
- Make the Android app look like this one. Same tokens, different platform.

## Gaps

Record a missing token upstream in the graph instead of hand-rolling a value.
