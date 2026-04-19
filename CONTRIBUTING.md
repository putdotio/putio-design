# Contributing

Thanks for contributing to put.io design.

## Setup

No toolchain required. Prototypes are self-contained HTML files that pull fonts from `static.put.io` at runtime — internet access is needed for type to render correctly.

## Browse Locally

```bash
npx serve prototypes
```

Prototypes deploy to AWS Amplify on push to `main` — see [`amplify.yml`](amplify.yml).

## Prototype Conventions

- Naming: `{platform}-{screen}-{variant}.html`
- Viewports: Web 1440×900 · iOS 390×844 · Android 412×915 · tvOS 1920×1080 · Android TV 1920×1080
- Yellow `#FDCE45` is sacred — never change it
- Icons: inline SVG (Phosphor-style), no emoji
- Every prototype gets a favicon link and theme-color meta tag
- Typography: GT America + Berkeley Mono only — see the Typography section in [`AGENTS.md`](AGENTS.md)

## Design Variants

Variants differ by color, density, radius, motion, and ornamentation — not typography. Explored variants include Clean Modern, Monospace, Brutalist, Editorial, Retro, Ink, Neubrutalism, Swiss, Scandi, Glass, Starry, Nocturne, and Linear Neutral.

## Docs

Read [`docs/design-brief.md`](docs/design-brief.md) and [`workspace-frontend/docs/platform-strategy.md`](https://github.com/putdotio/workspace-frontend/blob/main/docs/platform-strategy.md) before adding new prototypes.

## Pull Requests

- Keep changes focused and explicit.
- Read the relevant spec before designing a new screen.
- Check `docs/references/images/` screenshots before designing platform screens.
