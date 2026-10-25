# put.io design system

The guide site and the package's component and Tailwind layers. The design
rules live in [DESIGN.md](../DESIGN.md).

## Preview cards

`design-system.html` indexes every card. Each card renders one concept against
the real tokens; read it as a spec.

- Name cards `<platform>-<section><n>-<subject>.html`, with section `f`
  foundations, `c` components, `e` elements, `p` patterns, or `s` screens
  (`ios-e01-toggle.html`). The numbered `00-…13-…` files are tier-0
  foundations. `pnpm verify` rejects other names.
- Element cards are a fixed 1120×580 viewport: one control, its states, a spec
  strip, a don't block.
- Native cards are drawn 1:1 in their own unit (iPhone 393×852pt, iPad
  1024×768pt, Apple Watch 176×215pt, Android 412×915dp, TV 1920×1080px), so a
  number on a card is the number in the HIG or the Material spec. Those
  metrics, device bezels, and on-video chrome stay out of the token graph.
- Each card links the public font CSS from `static.put.io`; these two links are
  the full font set:

  ```html
  <link rel="stylesheet" href="https://static.put.io/fonts/gt-america/standard/font.css" />
  <link rel="stylesheet" href="https://static.put.io/fonts/berkeley-mono/variable/font.css" />
  ```

- TV cards also load `tv.css`, authored 1:1 at 1920×1080 and scoped under
  `.tv`. It declares the `--tv-*` properties its cards use, because the token
  CSS emits only `--radius-tv` from the `tv` group.
- Wordmark SVGs carry their optical centring in the viewBox. Flex-centre them
  as is, with no `translateY` nudge.

## Theme System

Light and dark are the same markup with different token values: toggle `.dark`
on `<html>`. The guide stores the choice in `localStorage` and broadcasts it to
embedded cards; `?theme=light` or `?theme=dark` overrides both, for
screenshots.

Native, TV, and on-video player cards are fixed-mode product mockups and set
`<html data-theme-lock="dark">`, which ignores the toggle and the query. Every
other card stays unlocked, and the e2e suite checks it in both modes.

## shadcn / Base UI interop

The token layer defines the shadcn names (`--primary`, `--muted-foreground`,
`--input`, `--ring`, …) as aliases of put.io tokens, so shadcn/ui blocks and
Base UI components resolve against put.io values without renaming.

- Author against `--field-*` and `--text-secondary`. The `--input-*` set and
  `--foreground-muted` are deprecated aliases.
- On a solid fill, read `--primary-foreground`, `--destructive-foreground`, or
  `--success-foreground` instead of literal `#000` or `#fff`.
- Express state with `data-state` (`open`, `checked`, `completed`, …), the
  attribute headless primitives set, not class flags such as `.is-active`.
- Mark compound parts with `data-slot` (`modal-header`, `card-title`, …) so
  external CSS can target one part without nested class chains.

### Tailwind v4 theme

`@putdotio/design/tailwind` ([`dist/css/tailwind.css`](../dist/css/tailwind.css))
maps the tokens into Tailwind v4 theme keys: `bg-bg`, `rounded-panel`,
`text-display`, `duration-base`. Import it after `tailwindcss` and
`@putdotio/design/css`, as in the [README](../README.md#use).

- The block is `@theme inline reference`: utilities read the put.io custom
  property, so `.dark` works. In custom CSS, read the put.io name (`var(--bg)`),
  not `var(--color-bg)`.
- `text-*` sizes set no line height; `--lh-normal` applies until a `leading-*`
  utility sets one.
- `--spacing` is `var(--space-1)`, so `p-4` is 16px and equals `--space-4`.
- z-indexes, breakpoints, and the `tv` group except `--radius-tv` stay out.
  Tailwind defaults that put.io does not define, such as `rounded-xl`, stay
  available.
