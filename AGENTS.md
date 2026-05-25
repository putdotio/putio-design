# Agent Guide

## Before you start

Read these in order:
1. [DESIGN.md](DESIGN.md) — public design contract for humans and agents
2. [Design system guide](system/README.md) — deployed guide, preview cards, and token usage
3. [Distribution](docs/DISTRIBUTION.md) — deploy, package, and artifact policy
4. [README](README.md) — repo overview and commands

## Repo structure

```
tokens/            canonical DTCG-compatible token sources
dist/              generated package artifacts
docs/              public repo docs
prototypes/        HTML design screens + gallery index
infra/             SST-managed AWS static-site infrastructure
sst.config.ts      SST app entry point for design.put.io
```

## Key rules

- Treat `tokens/**/*.tokens.json` as the source of truth for design tokens.
- Yellow `#FDCE45` is sacred. Keep it unchanged.
- Icons: Lucide-style inline SVG for new native TV work. No emoji.
- TV apps are file browsers — list views, not media card grids.
- Ecosystem apps are out of scope.
- Loop autonomously when iterating.
- When writing or updating docs, use anonymous IDs such as "User 01" and generic third-party app descriptions.
- Keep this repo focused on public tokens, generated package artifacts, the deployable design-system guide, generated galleries, and raw visual experiments. Private research, plans, and unreleased product decisions stay outside this public repo unless sanitized for publication.

## Content-agnostic design (critical)

put.io is content-agnostic. We only know raw filenames, not structured media metadata. Design for that reality.

**In prototypes, always use raw filenames exactly as they appear:**
- `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`
- `Seinfeld.S09E23.The.Finale.Part.2.720p.HDTV.x264-FLEET.mkv`
- `ubuntu-24.04.1-desktop-amd64.iso`
- `podcast_ep127_final_mixdown_v2.mp3`
- `IMG_4392.HEIC`
- `homework_answers_DONT_DELETE`
- `document-scan-march-2026.pdf`

**Use these constraints:**
- Show raw filenames instead of derived display titles
- Leave quality, source, and codec details inside the filename
- Treat posters, thumbnails, descriptions, and structured metadata as unavailable unless the product surface provides them
- Show only states backed by actual product data

**The design challenge:** Make a list of ugly, truncated filenames feel premium through typography, spacing, and interaction quality alone. The beauty comes from the utility itself while staying honest about the metadata we have.

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

## Deployment

`design.put.io` is an SST-managed static site. SST uploads `system/` to S3,
serves it through CloudFront, and owns the Route 53 record.

Useful commands:

```bash
pnpm install
pnpm check
pnpm verify:full
pnpm deploy:production
```

Only the `production` SST stage is supported for this repo. Do not create
preview, spike, or staging stages.

Production deploys from GitHub Actions use AWS OIDC with the
`AWS_DEPLOY_ROLE_ARN` repository variable.

Deploys require `AWS_REGION`, `AWS_ROUTE53_ZONE_ID`,
`AWS_WILDCARD_CERT_ARN`, and `DESIGN_DOMAIN` repository variables
