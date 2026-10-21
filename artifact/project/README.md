**put.io** is a content-agnostic cloud file product: a file browser that is fast, quiet, and honest about the data it has. Dark by default; light where it reads better.

## Rules

- **Content:** show filenames exactly as stored (`The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`). Show only metadata the product has.
- **Color:** neutrals do the work. `--yellow-solid` (`#FDCE45`) is the brand fill: brand mark, the one primary action per group, folder and file emphasis, progress, focus. Yellow text on light uses `--yellow-text-secondary`.
- **Type:** GT America for UI and display. Berkeley Mono for numbers, sizes, times, code, and filenames, with `tabular-nums` in columns. TV has no mono.
- **Space and shape:** spacing doubles from 4 to 512. Radius `6px` by default, `4px` for tight controls, `8px` or `10px` for panels, pills for segmented controls and badges. TV uses only `--radius-tv`.
- **Icons:** Phosphor inline SVG. File-type icons are brand yellow.
- **Layout:** lists, rows, sidebars, toolbars, sheets; dividers before cards. TV is list-first and focus-first, and focus is a fill.

## Tiers

Web (www, app, auth) uses tokens plus the `components.css` recipes. iOS, iPadOS, tvOS, watchOS, Android, and Android TV put tokens on stock controls. Roku and web TV add put.io conventions. Each card names its tier.

## Source

Generated from [putdotio/putio-design](https://github.com/putdotio/putio-design); change it there. Full contract: [DESIGN.md](https://github.com/putdotio/putio-design/blob/main/DESIGN.md). Platform contracts: [platforms/](https://github.com/putdotio/putio-design/tree/main/platforms). Code imports `@putdotio/design/css` and `@putdotio/design/components`. Previews use Inter and JetBrains Mono in place of the licensed GT America and Berkeley Mono.
