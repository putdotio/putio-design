# put.io design system

This folder holds the generated site tokens, preview cards, and design-system index.

## Layout

```
project root/
└── system/
    ├── index.html           ← redirects to the design-system guide
    ├── design-system.html   ← guide and preview-card index
    ├── design-system-light.html ← legacy redirect to design-system.html?theme=light
    ├── tokens.css           ← generated from ../tokens/**/*.tokens.json
    ├── assets/              ← logos, favicons, retro marks, app icons
    └── preview/             ← atomic review cards for foundations + components + brand + platforms
        └── tv-shell.css     ← TV / 10ft component CSS, scoped to .tv artboards (preview-only)
```

## Fonts

Preview pages load the public put.io font CSS from `static.put.io`: GT America,
GT America Mono, and Berkeley Mono. Do not commit font files here.

## Using tokens

For the static guide, pages in `system/` load the generated site stylesheet:

```html
<link rel="stylesheet" href="./tokens.css">
```

The canonical source is DTCG-compatible JSON in [`../tokens`](../tokens). This
site stylesheet (`system/tokens.css`) and the package stylesheet
(`dist/css/tokens.css`, exported as `@putdotio/design/css`) are generated from
the same source. Guide and component CSS should consume custom properties rather
than hard-coded palette values. Brand yellow is emitted as
`var(--yellow-solid)`; its CSS token value is `hsl(44.7, 97.9%, 63.1%)`, the
hsl form of canonical `#FDCE45`. Primary hover feedback uses
`--yellow-solid-hover`, exposed to consumers as `--button-primary-bg-hover`.

Web package consumers import the package CSS export:

```css
@import "@putdotio/design/css";
```

For **TV preview cards**, also load `preview/tv-shell.css` — it adds the `.tv`, `.topnav`, `.scr`, glass tiers, and player chrome on top of the tokens. This is preview-only support CSS; platform repos implement TV components in their native UI stacks:

```html
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./preview/tv-shell.css">
```

## Core rules

- **Yellow `#FDCE45` is the brand fill in both modes.** Use it for primary CTAs, folder icons, button/nav/TV focus rings (at 35% alpha), and progress bars. Use `--yellow-solid-hover` / `--button-primary-bg-hover` for CTA hover feedback, `--primary-foreground` for labels on yellow, and `--yellow-text-secondary` for yellow text on light backgrounds.
- **Icons: Phosphor-style inline SVG.** No emoji, ever.
- **One design, two modes.** Light and dark are the same markup and components with different token values. Toggle `.dark` on `<html>`; do not fork the page or rebuild a light-specific copy.
- **Fields stay quiet.** Use `--field-bg`, `--field-border`, and `--field-ring` for text entry. Invalid fields use `aria-invalid="true"` with red border/text only, never a red fill.
- **Panels are shared.** Use `--panel-bg`, `--panel-border`, `--panel-radius`, and `--panel-shadow` for raised cards and auth-style shells instead of screen-specific variables.
- **Content-agnostic.** put.io doesn't know what the user's files are. Never parse `The.Wire.S03E04.1080p.mkv` into `The Wire`. Raw filenames only. See the root [`DESIGN.md`](../DESIGN.md) for the full principle.

## Theme System

The guide owns the theme toggle. It stores `putio-ds-theme` in `localStorage`,
updates `html.dark`, and broadcasts the current mode to embedded preview iframes.
Standalone preview pages read the same storage key before paint. A URL query
(`?theme=light` or `?theme=dark`) can override the preview mode for screenshots.

Fixed-mode previews opt out with `<html data-theme-lock="dark">`. This is only
for product mockups whose visual language is intrinsically one mode, such as TV
and mobile shell specimens. Component previews should stay token-driven and work
in both modes.

## Design variants

Four documented type stacks — pick one per surface:

| Variant | Stack | Use when |
|---------|-------|----------|
| Clean Modern | GT America | default app UI |
| Monospace | Berkeley Mono | terminal, logs, technical dashboards |
| Brutalist | GT America Black + Berkeley Mono | marketing punctuation |
| Editorial | GT America Black 900 (tight tracking) + GT America | landing hero, about |

## Preview cards

Open `system/design-system.html` for the full index. Each card renders a single concept against the actual tokens; treat it as the visual spec.
