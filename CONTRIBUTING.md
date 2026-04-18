# Contributing

Thanks for contributing to put.io design.

## Setup

No toolchain required — prototypes are self-contained HTML files.

## Browse Locally

```bash
npx serve prototypes
```

## Prototype Conventions

- Naming: `{platform}-{screen}-{variant}.html`
- Viewports: Web 1440×900 · iOS 390×844 · Android 412×915 · tvOS 1920×1080 · Android TV 1920×1080
- Yellow `#FDCE45` is sacred — never change it
- Icons: inline SVG (Phosphor-style), no emoji
- Every prototype gets a favicon link and theme-color meta tag

## Design Variants

| Variant | Type stack | Reference |
|---------|-----------|-----------|
| Clean Modern | Inter | Linear, Raycast |
| Monospace | JetBrains Mono | Terminal, iA Writer |
| Brutalist | Inter Black + JetBrains Mono | Oxide Computer |
| Editorial | DM Serif Display + Inter | Letterboxd, Are.na |

Additional variants explored: Retro, Ink, Neubrutalism, Swiss, Scandi, Glass, Starry.

## Docs

Read [`docs/design-brief.md`](docs/design-brief.md) and [`workspace-frontend/docs/platform-strategy.md`](https://github.com/putdotio/workspace-frontend/blob/main/docs/platform-strategy.md) before adding new prototypes.

## Pull Requests

- Keep changes focused and explicit.
- Read the relevant spec before designing a new screen.
- Check `docs/references/images/` screenshots before designing platform screens.
