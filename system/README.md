# put.io design system

This folder holds the generated site tokens, preview cards, and design-system index.

## Layout

```
project root/
├── platforms/               ← per-platform binding contracts (DESIGN.md each)
└── system/
    ├── index.html           ← redirects to the design-system guide
    ├── design-system.html   ← guide and preview-card index
    ├── design-system-light.html ← legacy redirect to design-system.html?theme=light
    ├── tokens.css           ← generated from ../tokens/**/*.tokens.json
    ├── components.css       ← the tier-1 component layer (the web contract)
    ├── tv.css               ← TV / 10ft component CSS, scoped to .tv artboards
    ├── assets/              ← logos, favicons, retro marks, app icons
    └── preview/             ← specimen cards for foundations + every platform tier
        └── _*.css, _resize.js ← card chrome only (frame, tier strip, HIG/M3/Roku shells)
```

Cards are named `<platform>-<section><n>-<subject>.html` — section letter `f`
foundations, `c` components, `e` elements, `p` patterns, `s` screens
(`ios-e01-toggle.html`); the numbered `00-…13-…` files are the tier-0
foundations. Element cards are a fixed 1120×580 viewport: one control, its
states, a spec strip, a don't block.

## Fonts

Preview pages load the public put.io font CSS from `static.put.io` (the same
source as the product), so the design system always matches production. Do not
commit font files here. Two families, so each HTML file links two stylesheets in
`<head>`:

```html
<link rel="stylesheet" href="https://static.put.io/fonts/gt-america/standard/font.css">
<link rel="stylesheet" href="https://static.put.io/fonts/berkeley-mono/variable/font.css">
```

GT America Mono is retired. `--font-ui-mono` no longer exists and everything mono
reads `--font-mono` (Berkeley Mono), whose tabular figures carry the numerics the
UI mono used to. Do not re-add the `gt-america/mono/font.css` load.

Canonical weight mapping (matches the brand font host):
`100 ultra-light · 200 thin · 300 light · 400 regular · 500 medium · 700 bold · 900 black`

## Using tokens

For the static guide, pages in `system/` load the generated site stylesheet:

```html
<link rel="stylesheet" href="./tokens.css">
```

The canonical source is DTCG-compatible JSON in [`../tokens`](../tokens). This
site stylesheet (`system/tokens.css`) and the package stylesheet
(`dist/css/tokens.css`, exported as `@putdotio/design/css`) are generated from
the same source. Guide and component CSS should consume custom properties rather
than hard-coded palette values. Brand yellow is `var(--yellow-solid)` —
canonical `#FDCE45`; the emitted hsl form is pinned in
[`../DESIGN.md`](../DESIGN.md) front-matter, and the `--yellow-solid-hover` →
`--button-primary-bg-hover` derivation is specified in the repo's
`docs/DISTRIBUTION.md`.

Stacking and breakpoints are tokenized (`--z-*`, `--bp-*`) and the root
font-size is responsive; the canonical values live in
[`../DESIGN.md`](../DESIGN.md) (Layout & Spacing, Typography). Guide-specific
rule: CSS media queries can't read custom properties, so write the literal px
in `@media` and keep it in sync with the `--bp-*` token.

Web package consumers import the generated tokens first. Tier-1 consumers also
import the component recipes:

```css
@import "@putdotio/design/css";
@import "@putdotio/design/components";
```

For **TV preview cards**, also load `tv.css` — it adds the `.tv`, `.scr`,
`.row`, solid surface tiers, and player chrome on top of the tokens, authored
1:1 at 1920×1080 (a px in the file is a px on the TV). Every component selector
is scoped under `.tv`, so the file is safe to bundle globally without bleeding
into web components. Platform repos still implement TV components in their
native UI stacks:

```html
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./tv.css">
```

TV surfaces are **solid token colors** — no `backdrop-filter`, no translucent
white fills. Focus is a fill: rows go transparent → `--component-bg-active`,
buttons go `--component-bg` → `--component-bg-active` with the border stepping
to `--border-hover`. There is no scale, shadow, halo, or white invert.

The 10-foot scale itself is graph data, not CSS. The `tv` token group
(`--tv-text-*`, `--tv-space-*`, `--tv-overscan-*`,
`--tv-radius`, `--tv-z-*`) carries the 1:1 values for native emitters and is
`mode: "tv"`, so it is deliberately **not** emitted into `tokens.css` — read it
from `dist/tokens.flat.json`. Only `--radius-tv` (12px, the single radius for
every TV surface) is global and reachable in CSS. Two things must not be folded
into the web scales: TV has no mono face, and TV orders `--tv-z-overlay` (300)
*above* `--tv-z-toast` (200), the opposite of the web `--z-*` stack.

## Core rules

- **Yellow `#FDCE45` is the brand constant at rest** — full rule and approved uses in [`../DESIGN.md`](../DESIGN.md) (Colors). Guide specifics: `--yellow-solid-hover` (`#F3C435`) is the hover peer with its own canonical hex in both modes, and focus rings use the yellow at 35% alpha (`--shadow-focus-color`).
- **Yellow as text on light needs `--yellow-text-secondary`** (≈5:1, AA) — the brand `--yellow-solid` is fill-only on light backgrounds.
- **Labels on yellow** use `--primary-foreground` (`hsl(38, 65%, 10%)` — warm dark, never pure black). Passes AA on the yellow fill without feeling "hard."
- **Icons: Phosphor-style inline SVG.** No emoji, ever.
- **One design, two modes.** Light and dark are the same markup and components with different token values. Toggle `.dark` on `<html>`; do not fork the page or rebuild a light-specific copy. Components must consume semantic tokens (`--bg`, `--text`, `--border`, `--accent`, …), not raw `#hex` or `hsl()`.
- **Fields and panels use the shared aliases** (`--field-*`, `--panel-*`) — full rules, including the `aria-invalid` red-border-only requirement, in [`../DESIGN.md`](../DESIGN.md) (Components).
- **Wordmarks are optically pre-centred.** All three logo SVGs carry built-in top padding in the viewBox (retro pair `0 -16 376 112`, `logo.svg` `0 -24.44 621.79 176.055`). Flex-centre as-is; never add a `translateY` nudge. Height-set placements size boxes at 7/6 of the ink height.
- **Content-agnostic.** put.io doesn't know what the user's files are. Never parse `The.Wire.S03E04.1080p.mkv` into `The Wire`. Raw filenames only. See the root [`DESIGN.md`](../DESIGN.md) for the full principle.

## Binding tiers

ADR 0009 (putio-frontend `docs/decisions/0009-design-binding-tiers.md`): **a
web-rendered mock is never a native spec**. Every specimen card declares its
tier in a strip above the artboard (`preview/_tier.css` — the only place the
tier text lives besides `../DESIGN.md`; change both in the same PR).

| Tier | Surfaces | What binds |
| --- | --- | --- |
| 0 | Foundations | The token graph. Binds all tiers, values only |
| 1 | www · app · auth | The full system — `components.css` recipes are the contract, here and only here |
| 2 | iOS · iPadOS · tvOS · watchOS · Android · Android TV | Tokens only; every control from the platform HIG / Material 3 |
| 3 | Roku | Tier-2 token inheritance + put.io conventions in custom SceneGraph components |
| 4 | tv.put.io · Tizen · webOS | The web system, restrained to a list-first 10-foot interface |

A tier-1/3/4 card is a **Component** (put.io owns the recipe); a tier-2 card is
an **Element** (the platform owns the control; the card documents how it is
tokenized). Never read an Element card as a build-a-custom-control instruction.

Native cards are drawn 1:1 in their own unit — iPhone 393×852pt, iPad
1024×768pt, Apple Watch 176×215pt, Android 412×915dp, TV 1920×1080px — so a
number written on a card is the number in the HIG or the Material spec. Those
metrics are Apple's and Google's; they are **not** put.io spacing tokens and
must never be promoted into the graph. Device bezels and on-video chrome stay
deliberately un-tokenised.

## Theme System

The guide (`design-system.html`) owns the theme toggle. It writes
`putio-ds-theme` to `localStorage`, updates `html.dark`, and broadcasts
`{type:'__theme', theme}` to every embedded preview iframe via `postMessage`,
so embeds flip live without reloading. Each preview's inline bootstrap reads
the same storage key on standalone open, and `preview/_resize.js` listens for
the parent broadcast when embedded. A URL query (`?theme=light` or
`?theme=dark`) overrides both — useful for screenshots.

Fixed-mode previews opt out with `<html data-theme-lock="dark">`. This is only
for product mockups whose visual language is intrinsically one mode — a 10-foot
screen, a native app mockup, and on-video player chrome are fixed-mode
surfaces, so the `ios-*`, `android-*`, `androidtv-*`, `tvos-*`, `watchos-*`,
`roku-*`, and `tv-*` cards plus `web-p06-player.html` are locked. Locked
previews ignore both `localStorage` and parent broadcasts.
If you write a new component preview, you almost certainly don't want the
lock — let the tokens do the work and your specimen will render correctly in
both modes.

## shadcn / Base UI interop

The token layer ships a name-alias bridge so external component libraries that
read canonical shadcn token names theme correctly without renaming. Drop in a
shadcn/ui block, install a Base UI component, paste a Tailwind preset — they
resolve against our values via the aliases. Always alias, never duplicate, so
the two name systems can't drift.

| shadcn name | put.io target |
| --- | --- |
| `--primary` / `--primary-foreground` | `--yellow-solid` / `var(--primary-foreground)` (warm dark) |
| `--destructive` / `--destructive-foreground` | `--red-solid` / `var(--destructive-foreground)` (= `#fff`) |
| `--success` / `--success-foreground` | `--green-solid` / `var(--success-foreground)` (= `#fff`) |
| `--muted` / `--muted-foreground` | `--bg-secondary` / `--text-secondary` |
| `--accent` / `--accent-foreground` | `--component-bg` / `--text` |
| `--card` / `--card-foreground` | `--component-bg` / `--text` |
| `--popover` / `--popover-foreground` | `--component-bg` / `--text` |
| `--input` | `--border` |
| `--ring` | `--shadow-focus-color` |
| `--background` / `--foreground` | `--bg` / `--text` |

There is also a full `--input-*` set (`-bg`, `-border`, `-border-hover`,
`-border-focus`, `-ring`, `-text`, `-placeholder`, `-radius`) that aliases the
`--field-*` tokens one-for-one, so shadcn-shaped input code themes without
renaming. **Author against `--field-*`;** the `--input-*` names exist only as the
alias bridge and must never carry their own value.

The foreground tokens (`--primary-foreground`, `--destructive-foreground`,
`--success-foreground`) encode the mode-safe inverse pair — always read these
instead of writing literal `#000` / `#fff` on a solid surface.

Use whichever name reads cleaner in context. Our own components prefer the long
descriptive names (`--component-bg-hover`, `--yellow-text-secondary`) because
they describe the role exactly. shadcn-imported code prefers the short names.

### State via `data-state`, not class flags

Base UI / headless primitives set
`data-state="open|closed|checked|unchecked|active|completed|pending|loading"`
on the DOM. Our components target those same attribute values in CSS — see the
wizard step bar in `web-p00b-form-flows.html`
(`.step[data-state="completed"]`) and the menu/table cards. Prefer `data-state`
over inventing class flags (`.is-active`, `.on`, `.current`) so the same DOM
contract works whether the controlling code is React, Vue, vanilla JS, or
hand-written HTML, and so devtools can read the component's state at a glance.

### Compound parts via `data-slot`

shadcn marks parts of compound components with `data-slot="card-header"`,
`data-slot="card-title"`, etc. We do the same on the folder picker
(`data-slot="modal" / "modal-header" / "modal-body" / "modal-footer"`) and the
auth cards in `web-p00c-auth-signin.html` and `web-p00d-auth-signup.html`
(`data-slot="auth" / "auth-header" / "auth-body"`). This lets external CSS tweak one part without inventing
nested class chains.

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
