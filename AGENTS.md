# AGENTS.md

## Before you start

Read these in order:
1. `docs/design-brief.md` — product context, personas, principles
2. `docs/platform-strategy.md` — how we build (native, agents, VLC-kit)
3. `docs/specs/tv-app.md` — the spec you're implementing (if working on TV)

## Repo structure

```
docs/              design docs, specs, research
docs/specs/        feature specs
docs/references/   platform UI guides, reference images
prototypes/        HTML design screens + gallery index
```

## Key rules

- Read the spec before writing code. The spec is the source of truth.
- Yellow `#FDCE45` is sacred. Never change it.
- Icons: inline SVG (Phosphor-style). No emoji.
- TV apps are file browsers — list views, not media card grids.
- Ecosystem apps are out of scope.
- Check `docs/references/images/` screenshots before designing platform screens.
- Never stop to ask — loop autonomously when iterating.
- When writing or updating docs: never include customer PII (real names, emails, employers). Use anonymous IDs (e.g. "User 01"). Never reference third-party apps by name — use generic descriptions instead.

## Design variants

| Variant | Type stack | Reference |
|---------|-----------|-----------|
| Clean Modern | Inter | Linear, Raycast |
| Monospace | JetBrains Mono | Terminal, iA Writer |
| Brutalist | Inter Black + JetBrains Mono | Oxide Computer |
| Editorial | DM Serif Display + Inter | Letterboxd, Are.na |

Additional variants explored: Retro, Ink, Neubrutalism, Swiss, Scandi, Glass, Starry.

## Prototype naming

```
{platform}-{screen}-{variant}.html
```

## Viewports

Web 1440×900 · iOS 390×844 · Android 412×915 · tvOS 1920×1080 · Android TV 1920×1080
