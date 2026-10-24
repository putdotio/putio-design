# put.io design system

The guide site: generated site tokens, component CSS, preview cards, and the
design-system index.

## Layout

- `index.html` redirects to `design-system.html`, the guide and preview-card
  index. `design-system-light.html` redirects to
  `design-system.html?theme=light`.
- `tokens.css` is generated from `../tokens/**/*.tokens.json`; edit the token
  sources and rebuild.
- `components.css` is the Tier-1 component layer (the web contract).
- `tv.css` is the TV / 10-foot component CSS, scoped to `.tv` artboards.
- `assets/` holds logos, favicons, retro marks, and app icons.
- `preview/` holds specimen cards for the foundations and every platform tier.
  Its `_`-prefixed files are card chrome only (frame, tier strip, HIG, M3, and
  Roku shells, resize and password-toggle helpers).

Cards are named `<platform>-<section><n>-<subject>.html` with section letter `f`
foundations, `c` components, `e` elements, `p` patterns, or `s` screens
(`ios-e01-toggle.html`); the numbered `00-…13-…` files are the tier-0
foundations. Element cards are a fixed 1120×580 viewport: one control, its
states, a spec strip, a don't block.

## Fonts

Preview pages load the public put.io font CSS from `static.put.io`, the same
source as the product; font licensing is in
[Distribution](../docs/distribution.md#fonts-and-assets). Each preview links
both families in `<head>`:

```html
<link rel="stylesheet" href="https://static.put.io/fonts/gt-america/standard/font.css" />
<link rel="stylesheet" href="https://static.put.io/fonts/berkeley-mono/variable/font.css" />
```

Those two links are the full font set: mono text reads `--font-mono` (Berkeley
Mono), whose tabular figures carry the numerics.

Weight names on the font host:
`100 ultra-light · 200 thin · 300 light · 400 regular · 500 medium · 700 bold · 900 black`.
The tokens use four of them through `--fw-regular`, `--fw-medium`, `--fw-bold`,
and `--fw-black`.

## Using tokens

Guide pages in `system/` load the generated site stylesheet:

```html
<link rel="stylesheet" href="./tokens.css" />
```

The canonical source is DTCG-compatible JSON in [`../tokens`](../tokens). This
site stylesheet (`system/tokens.css`) and the package stylesheet
(`dist/css/tokens.css`, exported as `@putdotio/design/css`) are generated from
the same source. Brand yellow is `var(--yellow-solid)`; its emitted hsl form is
pinned in the [`../DESIGN.md`](../DESIGN.md) frontmatter, and the
`--button-primary-bg-hover` derivation is in
[Distribution](../docs/distribution.md#generated-files).

Stacking, breakpoints, the root font-size, and the `@media` literal rule live
in [Layout & Spacing](../DESIGN.md#layout--spacing) and
[Typography](../DESIGN.md#typography).

Package consumers import as in the [README](../README.md#use).

For **TV preview cards**, also load `tv.css`, which adds the `.tv`, `.scr`,
`.row`, solid surface tiers, and player chrome on top of the tokens, authored
1:1 at 1920×1080 (a px in the file is a px on the TV). Every component selector
is scoped under `.tv`, so the file can be bundled globally alongside web
components. Platform repos implement TV components in their native UI stacks:

```html
<link rel="stylesheet" href="./tokens.css" /> <link rel="stylesheet" href="./tv.css" />
```

TV material, focus, and the `tv` token group rules live in
[Components](../DESIGN.md#components). Guide specifics: the `tv` group is
`mode: "tv"` and read from `dist/tokens.flat.json`; `--radius-tv` is the one
`tv` value the token CSS emits, so `tv.css` declares the `--tv-*` properties
its cards use itself.

## Core rules

- **Yellow** follows [Colors](../DESIGN.md#colors). Guide specifics: `--yellow-solid-hover` is the hover peer with one value in both modes, and button focus-visible rings use `--shadow-focus`: a 2px `--bg` gap, then a 2px `--solid-hover` ring, at least 3:1 against the page and panels. `--shadow-focus-color` (the yellow at 35% alpha) stays only as shadcn's `--ring`. Form fields focus with `--field-ring` instead.
- **Yellow as text on light** uses `--yellow-text-secondary` (≈5:1, AA); `--yellow-solid` is fill-only on light backgrounds.
- **Labels on yellow** use `--primary-foreground`, a warm dark that passes AA on the yellow fill.
- **One design, two modes.** Light and dark are the same markup and components with different token values. Toggle `.dark` on `<html>`; one page serves both modes. Components consume semantic tokens (`--bg`, `--text`, `--border`, `--accent`, …) instead of raw `#hex` or `hsl()`.
- **Wordmarks are optically pre-centred.** All three logo SVGs carry built-in top padding in the viewBox (retro pair `0 -16 376 112`, `logo.svg` `0 -24.44 621.79 176.055`). Flex-centre them as-is, with no `translateY` nudge. Height-set placements size boxes at 7/6 of the ink height.

Icons, fields and panels, and raw filenames follow the root
[Components](../DESIGN.md#components) and
[Content and Icons](../DESIGN.md#content-and-icons).

## Binding tiers

Tier definitions, the Component/Element distinction, and the `preview/_tier.css`
pairing rule live in [Binding Tiers](../DESIGN.md#binding-tiers). An Element
card shows how a stock control receives tokens.

Native cards are drawn 1:1 in their own unit (iPhone 393×852pt, iPad
1024×768pt, Apple Watch 176×215pt, Android 412×915dp, TV 1920×1080px), so a
number written on a card is the number in the HIG or the Material spec. Those
metrics are Apple's and Google's and stay out of the put.io token graph. Device
bezels and on-video chrome stay untokenised.

## Theme System

The guide (`design-system.html`) owns the theme toggle. It writes
`putio-ds-theme` to `localStorage`, updates `html.dark`, and broadcasts
`{type:'__theme', theme}` to every embedded preview iframe via `postMessage`,
so embeds flip live without reloading. Each preview's inline bootstrap reads
the same storage key on standalone open, and `preview/_resize.js` listens for
the parent broadcast when embedded. A URL query (`?theme=light` or
`?theme=dark`) overrides both, for screenshots.

Fixed-mode previews opt out with `<html data-theme-lock="dark">`, reserved for
product mockups whose visual language is intrinsically one mode. A 10-foot
screen, a native app mockup, and on-video player chrome are fixed-mode
surfaces, so the `ios-*`, `android-*`, `androidtv-*`, `tvos-*`, `watchos-*`,
`roku-*`, `tv-*`, and `mobile-*` cards plus `web-p06-player.html` are locked.
Locked previews ignore `localStorage`, parent broadcasts, and the URL query.
New component previews stay unlocked, so the tokens render them in both modes.

## shadcn / Base UI interop

The token layer aliases the canonical shadcn token names, so shadcn/ui blocks,
Base UI components, and Tailwind presets resolve against put.io values without
renaming. Each shadcn name aliases a put.io token and carries no value of its
own, so the two name systems cannot drift.

| shadcn name                                  | put.io target                                              |
| -------------------------------------------- | ---------------------------------------------------------- |
| `--primary` / `--primary-foreground`         | `--yellow-solid` / `var(--primary-foreground)` (warm dark) |
| `--destructive` / `--destructive-foreground` | `--red-solid` / `var(--destructive-foreground)` (= `#fff`) |
| `--success` / `--success-foreground`         | `--green-solid` / `var(--success-foreground)` (= `#fff`)   |
| `--muted` / `--muted-foreground`             | `--bg-secondary` / `--text-secondary`                      |
| `--accent` / `--accent-foreground`           | `--component-bg` / `--text`                                |
| `--card` / `--card-foreground`               | `--component-bg` / `--text`                                |
| `--popover` / `--popover-foreground`         | `--component-bg` / `--text`                                |
| `--input`                                    | `--field-border`                                           |
| `--ring`                                     | `--shadow-focus-color`                                     |
| `--background` / `--foreground`              | `--bg` / `--text`                                          |

The `--input-*` set (`-bg`, `-border`, `-border-hover`, `-border-focus`,
`-ring`, `-text`, `-placeholder`, `-radius`) and `--foreground-muted` are
[deprecated](../docs/distribution.md#deprecated-tokens): shadcn itself names
only `--input` and `--muted-foreground`. Each deprecated name aliases its
replacement; **author against `--field-*` and `--text-secondary`.**

On a solid surface, read the foreground tokens (`--primary-foreground`,
`--destructive-foreground`, `--success-foreground`), which encode the mode-safe
inverse pair, instead of writing literal `#000` / `#fff`.

put.io components use the long descriptive names (`--component-bg-hover`,
`--yellow-text-secondary`) because they name the role exactly; shadcn-imported
code keeps the short names.

### Tailwind v4 theme

`@putdotio/design/tailwind` ([`dist/css/tailwind.css`](../dist/css/tailwind.css))
maps the tokens into Tailwind v4 theme keys. The build derives each key from the
token's type and CSS name, so new tokens join their namespace without a hand
list. Import it after `tailwindcss` and `@putdotio/design/css`; the
[README](../README.md#use) shows the import lines.

| Tailwind key              | put.io token                                               | Example utilities                               |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| `--color-<name>`          | every color token `--<name>`                               | `bg-bg`, `text-muted-foreground`                |
| `--font-*`                | `--font-*`                                                 | `font-sans`, `font-mono`                        |
| `--font-weight-*`         | `--fw-*`                                                   | `font-regular`, `font-bold`                     |
| `--text-*`                | `--fs-*`                                                   | `text-sm`, `text-display`                       |
| `--leading-*`             | `--lh-*`                                                   | `leading-tight`                                 |
| `--tracking-*`            | `--tracking-*`, `--button-tracking*`                       | `tracking-tight`, `tracking-button`             |
| `--radius`, `--radius-*`  | `--radius`, `--radius-*`, `--<component>-radius`           | `rounded`, `rounded-sm`, `rounded-panel`        |
| `--shadow-*`              | `--shadow-*`, `--<component>-shadow`, `--<component>-ring` | `shadow-sm`, `shadow-menu`, `shadow-field-ring` |
| `--ease-*`                | `--ease-*`                                                 | `ease-out`                                      |
| `--transition-duration-*` | `--dur-*`                                                  | `duration-base`                                 |

- The block is `@theme inline reference`. Utilities read the put.io custom
  property where they apply, so `.dark` works. Tailwind declares none of the
  keys, so `--radius-sm` or `--font-sans` stays the token instead of a
  self-reference. In custom CSS, read the put.io name (`var(--bg)`), not
  `var(--color-bg)`.
- shadcn class names such as `bg-primary`, `border-input`, and
  `text-muted-foreground` resolve through the aliases above.
- `text-*` sizes set no line height; the document's `--lh-normal` applies until
  a `leading-*` utility sets one.
- TV tokens, z-indexes and breakpoints stay out. Deprecated tokens stay in until a major release removes them.
- `--spacing` is `var(--space-1)`, so `p-4` is 16px at any root size and equals
  `--space-4`. Tailwind defaults that put.io does not define, such as
  `rounded-xl`, stay available.

### State via `data-state`, not class flags

Base UI / headless primitives set
`data-state="open|closed|checked|unchecked|active|completed|pending|loading"`
on the DOM. put.io components target those same attribute values in CSS; see
the wizard step bar in `web-p00b-form-flows.html`
(`.step[data-state="completed"]`) and the menu/table cards. Express state with
`data-state` rather than class flags (`.is-active`, `.on`, `.current`), so the
same DOM contract works with any controlling code and devtools show the state
directly.

### Compound parts via `data-slot`

shadcn marks parts of compound components with `data-slot="card-header"`,
`data-slot="card-title"`, and so on. put.io does the same on the folder picker
(`data-slot="modal" / "modal-header" / "modal-body" / "modal-footer"`), so
external CSS can target one part without nested class chains.

## Design variants

Four documented type stacks; pick one per surface:

| Variant      | Stack                                              | Use when                             |
| ------------ | -------------------------------------------------- | ------------------------------------ |
| Clean Modern | GT America                                         | default app UI                       |
| Monospace    | Berkeley Mono                                      | terminal, logs, technical dashboards |
| Brutalist    | GT America Black + Berkeley Mono                   | marketing punctuation                |
| Editorial    | GT America Black 900 (tight tracking) + GT America | landing hero, about                  |

## Preview cards

`design-system.html` is the full index. Each card renders one concept against
the real tokens; read it as a spec.
