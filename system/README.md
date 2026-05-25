# put.io design system

This is the `system/` folder inside [`putdotio/putio-design`](https://github.com/putdotio/putio-design). It holds the **tokens**, **preview cards**, and an **index** of the design system.

## Layout

```
project root/
└── system/
    ├── index.html           ← redirects to the design-system guide
    ├── design-system.html   ← dark-mode guide and preview-card index
    ├── design-system-light.html
    ├── tokens.css           ← generated from ../tokens/**/*.tokens.json
    ├── assets/              ← logos, favicons, retro marks, app icons
    └── preview/             ← atomic review cards for foundations + components + brand + platforms
        └── tv-shell.css     ← TV / 10ft component CSS, scoped to .tv artboards (preview-only)
```

## Fonts

Fonts are loaded directly from `static.put.io`, so the design system uses the same public type families as put.io product surfaces. Each HTML file links three stylesheets in `<head>`:

```html
<link rel="stylesheet" href="https://static.put.io/fonts/gt-america/standard/font.css">
<link rel="stylesheet" href="https://static.put.io/fonts/gt-america/mono/font.css">
<link rel="stylesheet" href="https://static.put.io/fonts/berkeley-mono/variable/font.css">
```

Canonical weight mapping (matches `putdotio/putio-static`):
`100 ultra-light · 200 thin · 300 light · 400 regular · 500 medium · 700 bold · 900 black`

## Using tokens

```html
<link rel="stylesheet" href="system/tokens.css">
```

The canonical source is DTCG-compatible JSON in [`../tokens`](../tokens). This
CSS file is generated for the design site and package consumers. Everything else
is a variable. The only hard-coded value you should ever write is `#FDCE45` —
and even that is exposed as `var(--yellow-solid)`.

For **TV preview cards**, also load `preview/tv-shell.css` — it adds the `.tv`, `.topnav`, `.scr`, glass tiers, and player chrome on top of the tokens. This is preview-only support CSS; platform repos implement TV components in their native UI stacks:

```html
<link rel="stylesheet" href="system/tokens.css">
<link rel="stylesheet" href="system/preview/tv-shell.css">
```

## Core rules

- **Yellow `#FDCE45` is sacred.** Never gradient, tint, or replace. Primary CTAs, folder icons, focus rings (at 35% alpha), progress bars.
- **Icons: Phosphor-style inline SVG.** No emoji, ever.
- **Dark is app-default, light is landing-default.** Both are in tokens; toggle with `.dark` on `<html>`.
- **Content-agnostic.** put.io doesn't know what the user's files are. Never parse `The.Wire.S03E04.1080p.mkv` into `The Wire`. Raw filenames only. See the root [`DESIGN.md`](../DESIGN.md) for the full principle.

## Design variants

Four documented type stacks — pick one per surface:

| Variant | Stack | Use when |
|---------|-------|----------|
| Clean Modern | GT America | default app UI |
| Monospace | Berkeley Mono | terminal, logs, technical dashboards |
| Brutalist | GT America Black + Berkeley Mono | marketing punctuation |
| Editorial | GT America Black 900 (tight tracking) + GT America | landing hero, about |

## Preview cards

Open `system/design-system.html` for the full index. Each card renders a single concept against the actual tokens — read it like a spec.

See the root [`AGENTS.md`](../AGENTS.md) for naming conventions and the rules agents must follow.
