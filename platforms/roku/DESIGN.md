---
version: "0.1.0"
name: "put.io on Roku"
description: "Binding contract for the put.io Roku channel. Tier 3: token inheritance plus custom SceneGraph components."
tier: 3
source: "putdotio/putio-roku@main"
reviewed:
  date: "2026-10-21"
  against: "Roku SceneGraph components, the generated token adapter, and platform metric and icon checks."
  cards:
    [
      "roku-f00-metrics",
      "roku-s00-files",
      "roku-p00-options",
      "roku-p01-destructive",
      "roku-s02-search",
      "roku-s03-settings",
      "roku-s04-history",
      "roku-s05-auth",
      "roku-p03-continue-watching",
      "roku-p04-conversion",
      "roku-p05-not-supported",
    ]
resolution:
  authored: "1920x1080"
  grid: 3
  pageMargin: 102
  rowWidth: 1716
  rowHeight: 120
  borderWidth: 3
  shadowOffset: 12
typography:
  h1: { size: 45, weight: "bold", replaces: "LargeBoldSystemFont" }
  h2: { size: 36, weight: "medium", replaces: "MediumBoldSystemFont" }
  body: { size: 36, weight: "regular", replaces: "MediumSystemFont" }
  small: { size: 33, weight: "regular", replaces: "SmallSystemFont" }
  label: { size: 33, weight: "medium", replaces: "SmallBoldSystemFont" }
  caption: { size: 27, weight: "regular", replaces: "SmallestSystemFont" }
---

# put.io on Roku

## Binding

Tier 3: tokens inherit exactly as on tier 2, and put.io builds custom SceneGraph
components where the stock nodes cannot carry the app. Custom components use
graph values and the shared TV row anatomy, so a Roku screen reads as the same
product as the user's Apple TV. Tier definitions live in
[Binding Tiers](../../DESIGN.md#binding-tiers).

## Geometry

Authored at FHD 1920x1080. Every position passes through `uiSnap()`, which
rounds to 3, so an FHD layout lands on whole pixels when the device downscales.

| Value         | Source                               | Number      |
| ------------- | ------------------------------------ | ----------- |
| Screen        | `uiScreenWidth` / `uiScreenHeight`   | 1920 x 1080 |
| Grid          | `uiScaleGrid`                        | 3           |
| Page margin   | `uiPageMargin`                       | 102         |
| List row      | `uiListRowWidth` / `uiListRowHeight` | 1716 x 120  |
| Border        | `uiBorderWidth`                      | 3           |
| Shadow offset | `uiShadowOffset`                     | 12          |

The page margin is a constant; Roku's safe area never comes from
`tv.overscan.*`.

Borders are 3px. `roku-ui-metrics.test.ts` fails any dialog carrying
`width="1"` or `height="1"`, because a 1px border disappears on a real panel
after scaling.

SceneGraph has no border-radius. Rounded focus is `images/list-item-focus.9.png`,
a nine-patch drawn by a `FocusBackground` node. Roku is the one TV tier that
never reads `--radius-tv`.

## Type

`Typography.brs` names a Roku built-in behind every role, so a build packaged
without the licensed faces renders with the built-ins.

Each role matches the size of the built-in it replaces. Changing a size is a
layout change: it reflows every Label height, wrap budget and row baseline
already built against it.

No mono in product UI; a debug overlay may use the system monospace. Roku gets
proportional figures, as [Typography](../../DESIGN.md#typography)
describes. Budget numeric columns for reflow.

## Colour

`scripts/generate-roku-design.ts` reads `@putdotio/design/tokens`, converts each
value to `0xRRGGBBAA`, and emits `source/DesignTokens.brs`. Read colours through
`designTokenColor(name)` or `setDialogNodeColor(node, "<token>")`.

Adding a colour means adding a row to the generator's map. A missing key is a
build error.

| Roku name                               | DTCG key                               | Used for                                                         |
| --------------------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `primary`, `primaryPressed`             | `color.brand.yellow`                   | file and navigation glyphs, progress fill, focused audio control |
| `appBackground`                         | `color.neutral.dark.bg`                | channel canvas                                                   |
| `appBackgroundWash`, `transparent`      | `surface.dark.listItemBg`              | resting list-item background                                     |
| `surface`, `secondary`, `buttonSurface` | `color.neutral.dark.componentBg`       | buttons, keycaps, panels                                         |
| `focus`, `buttonFocus`                  | `color.neutral.dark.componentBgActive` | FocusBackground fill                                             |
| `border`                                | `color.neutral.dark.border`            | resting 3px edges                                                |
| `borderHover`, `panelBorder`            | `color.neutral.dark.borderHover`       | focused edge, dialog chrome                                      |
| `text`                                  | `color.neutral.dark.text`              | row titles, dialog body                                          |
| `textMuted`                             | `color.neutral.dark.textSecondary`     | sublines, incidental history, watched eye                        |
| `textInverse`                           | `component.button.primary.foreground`  | label on a yellow fill                                           |
| `textOnVideo`                           | `tv.video.textOnVideo`                 | text over video                                                  |
| `disabledText`                          | `color.neutral.dark.solid`             | unavailable rows and actions                                     |
| `danger`                                | `color.red.dark.solid`                 | error events, destructive confirmation                           |
| `dangerFocused`                         | `color.red.dark.solidHover`            | destructive action while focused                                 |
| `scrim`                                 | `surface.dark.overlayFull`             | dialog backdrop                                                  |
| `shadow`                                | `surface.dark.overlayInline`           | 12px dialog shadow                                               |

Two names mislead: `primaryPressed` is the same yellow as `primary`, and
`transparent` maps to the list-item background. Read the map, not the name.

## Icons

Phosphor, generated offline from the pinned `@phosphor-icons/core` into white
128x128 PNG templates and recoloured at runtime with `blendColor`, so assets
carry no colour. `loadDisplayMode="scaleToFit"` keeps one 128px source crisp
from 22 to 128px.

Asset filenames differ from Phosphor names. `config/phosphor-icons.json` maps
each `asset` to a Phosphor `name` and `weight`:

| Roku asset     | Phosphor name             | Weight  |
| -------------- | ------------------------- | ------- |
| `captions-off` | `closed-captioning`       | regular |
| `skip-back`    | `arrow-counter-clockwise` | regular |
| `media-filter` | `funnel`                  | regular |

Map through the manifest; a guessed name produces a missing glyph.

| Colour          | Applies to                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------ |
| `primary`       | browse, navigation, settings, all file types. `iconColor` on `ListItemData` defaults to it |
| `primary`       | history complete and warning, so semantic states keep meaning                              |
| `danger`        | history errors. The only red in the set                                                    |
| `textMuted`     | incidental history, watched eye                                                            |
| white, untinted | player transport, because it sits on video                                                 |

Fill weight for filled, active and transport glyphs. Regular otherwise.

`pnpm roku icons` regenerates `images/icons/*.png` from the manifest and prunes
anything unlisted. `pnpm roku check-roku-icons` runs in `pnpm verify` and fails
on PNG, version or licence drift.

Brand artwork, channel posters, splash art, loaders and focus art stay outside
this system.

## Components

Use Roku's: `Overhang`, `Dialog`, `Keyboard`, `MiniKeyboard`, `Video`,
`BusySpinner`, `Poster` with `blendColor`.

Build custom, from tokens: `ListItem`, `FocusBackground`, `UiMetrics.brs`,
`Typography.brs`, `DialogStyle.brs`.

`DialogStyle.brs` imports after `UiMetrics.brs`, because DialogStyle reads the
grid helpers at load. The metrics test asserts that order on every consumer.

### ListItem

Three row components share the 120px anatomy and the `FocusBackground`:

| Component                   | Text layout                                                   | Value slot                                                                                                    |
| --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ListItem` (home, settings) | title h2 36 and description small 33, **horizontal** siblings | computed by `ListItem.brs`: width 520, x = rowWidth − 568. The XML's static `[1260,0]` w412 is a dead default |
| `FileListItem`              | title h2 36 **over** caption 27, vert LayoutGroup, spacing 10 | none; watched eye Poster 40 after the text                                                                    |
| `HistoryListItem`           | title h2 36 **over** caption 27, vert LayoutGroup, spacing 10 | none                                                                                                          |

All three: inline content at `translation="[35,60]"`, `itemSpacings="28"`,
`vertAlignment="center"`, icon `Poster` at 50x50.

Value-free `FileListItem` and `HistoryListItem` rows use
`listItemMainTextWidth(rowWidth)` = rowWidth − 226, floored at 400: 1490 on a
1716 row and 734 on search's 960 rows. A value-bearing `ListItem` caps its
title before the value slot at rowWidth − 568, so the two regions stay apart.

Settings rows set `valueAlign="right"`, which moves the description string
into the value slot. State is that value string, and OK cycles it.

### Focus

A `FocusBackground` node behind the row, toggled by `itemHasFocus`. Its fill is
`focus`, tinting a flat nine-patch; the row has no edge. `uiBorderWidth()` is
for dialogs, TrackMenu and the header divider. SceneGraph lists have no z-axis,
so focus has no scale and no elevation.

The row fills are `tv.focus.row.*`, the same pair web TV reads. Dialog
buttons carry no border and use `applyDialogButtonState`: primary steps to
`primary` with `textInverse`, secondary to `buttonFocus`, danger to
`dangerFocused`. Dialog buttons skip `tv.focus.control.*`.

Of the four TV tiers, Roku is closest to tv.put.io and furthest from tvOS,
which lifts.

## Content

Raw filenames, always: `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`
is the title, as [Content and Icons](../../DESIGN.md#content-and-icons)
requires.

Browse is a list. `PosterGrid` and `RowList` are built for catalogue apps with
artwork: they show fewer items, truncate longer names, and turn a straight
D-pad path into one that crosses the screen.

Remote hints stay on screen (OK, star, Back) because Roku remotes vary by model.

Destructive dialogs name the object and the consequence in the body; the row
label stays neutral. Cancel takes focus first.

## Don't

- Author at 1280x720. The channel is FHD.
- Write a hex literal into a `.brs` file; read the generated tokens.
- Use a 1px border. Borders are 3px.
- Read `--radius-tv`. Rounding comes from the nine-patch.
- Build a custom modal. `Dialog` owns the remote, back button and focus containment.
- Hand-build text entry. Use `Keyboard`.
- Use a Phosphor name where the manifest expects an asset name.
- Restyle `MiniKeyboard` or blend its focus. Search blends only its lists.
- Show events beyond `transfer_completed` and `file_shared` on the History screen.
- Hand-edit `images/icons/*.png`; regenerate them.
