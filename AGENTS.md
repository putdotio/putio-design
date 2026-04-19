# AGENTS.md

## Before you start

Read these in order:
1. `docs/design-brief.md` — product context, personas, principles
2. [`workspace-frontend/docs/platform-strategy.md`](https://github.com/putdotio/workspace-frontend/blob/main/docs/platform-strategy.md) — how we build (native, agents, VLC-kit)
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

## Content-agnostic design (critical)

put.io is content-agnostic. We do NOT know what files the user has. We cannot parse, format, or beautify filenames. This is the inherent reality of the product.

**In prototypes and specs, always use raw filenames exactly as they appear:**
- `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`
- `Seinfeld.S09E23.The.Finale.Part.2.720p.HDTV.x264-FLEET.mkv`
- `ubuntu-24.04.1-desktop-amd64.iso`
- `podcast_ep127_final_mixdown_v2.mp3`
- `IMG_4392.HEIC`
- `homework_answers_DONT_DELETE`
- `document-scan-march-2026.pdf`

**Never do any of these:**
- Parse filenames into clean titles (e.g. showing "Inception" instead of the raw filename)
- Add quality badges (4K, 1080p) as separate UI elements — that info is in the filename
- Add source/codec tags as metadata pills
- Assume we have posters, thumbnails, descriptions, or any structured metadata
- Show "health indicators" that require parsing torrent data into simplified states

**The design challenge:** Make a list of ugly, truncated filenames feel premium through typography, spacing, and interaction quality alone. The beauty comes from the utility itself — not from pretending we have metadata we don't.

## Typography

All prototypes standardize on two typefaces, served from `static.put.io`:

- **Sans / display:** GT America (`standard`, `extended`, `mono` variants)
- **Monospace:** Berkeley Mono (variable)

Import in `<style>`:

```css
@import url('https://static.put.io/fonts/gt-america/standard/font.css');
@import url('https://static.put.io/fonts/gt-america/mono/font.css');
@import url('https://static.put.io/fonts/gt-america/extended/font.css');
@import url('https://static.put.io/fonts/berkeley-mono/variable/font.css');
```

Stacks:

- Sans: `'GT America', -apple-system, system-ui, sans-serif`
- Display (wide/editorial): `'GT America Extended', 'GT America', -apple-system, system-ui, sans-serif`
- Mono: `'Berkeley Mono', ui-monospace, 'SF Mono', Menlo, monospace`
- Retro pixel slot: `'GT America Mono', ui-monospace, monospace`

## Design variants

Variants differ by color, density, radius, motion, and ornamentation — not typography. Variants explored: Clean Modern, Monospace, Brutalist, Editorial, Retro, Ink, Neubrutalism, Swiss, Scandi, Glass, Starry, Nocturne, Linear Neutral.

## Prototype naming

```
{platform}-{screen}-{variant}.html
```

## Viewports

Web 1440×900 · iOS 390×844 · Android 412×915 · tvOS 1920×1080 · Android TV 1920×1080
