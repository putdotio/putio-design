# Agent Guide

## Before you start

Read these in order:
1. [Design Brief](https://github.com/putdotio/putio-frontend-workspace/blob/main/docs/design/design-brief.md) — product context, personas, principles
2. [Platform Strategy](https://github.com/putdotio/putio-frontend-workspace/blob/main/docs/platform-strategy.md) — how we build across platforms
3. [TV Product Bar](https://github.com/putdotio/putio-frontend-workspace/blob/main/docs/specs/tv-app/product.md) — what makes a good put.io TV app
4. [TV App Feature Spec](https://github.com/putdotio/putio-frontend-workspace/blob/main/docs/specs/tv-app/feature-spec.md) — detailed TV feature spec

## Repo structure

```
docs/              pointer to workspace-owned docs
prototypes/        HTML design screens + gallery index
moodboard/         pointer to workspace-owned moodboards
infra/             SST-managed AWS static-site infrastructure
sst.config.ts      SST app entry point for design.put.io
```

## Key rules

- Read the workspace spec before writing code. The workspace is the source of truth for durable docs.
- Yellow `#FDCE45` is sacred. Keep it unchanged.
- Icons: Lucide-style inline SVG for new native TV work. No emoji.
- TV apps are file browsers — list views, not media card grids.
- Ecosystem apps are out of scope.
- Check [workspace reference images](https://github.com/putdotio/putio-frontend-workspace/tree/main/docs/references/images) before designing platform screens.
- Loop autonomously when iterating.
- When writing or updating docs, use anonymous IDs such as "User 01" and generic third-party app descriptions.
- Keep this repo focused on prototypes, generated galleries, deployable design-site assets, and raw visual experiments. Durable conclusions, specs, plans, decisions, references, and moodboards belong in [putio-frontend-workspace](https://github.com/putdotio/putio-frontend-workspace).

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

`design.put.io` is an SST-managed static site. SST uploads `prototypes/` to S3,
serves it through CloudFront, and owns the Route 53 record.

Useful commands:

```bash
pnpm install
pnpm check
pnpm deploy:production
```

Only the `production` SST stage is supported for this repo. Do not create
preview, spike, or staging stages.

Production deploys from GitHub Actions use AWS OIDC with the
`AWS_DEPLOY_ROLE_ARN` repository variable.

Deploys require `AWS_REGION`, `AWS_ROUTE53_ZONE_ID`,
`AWS_WILDCARD_CERT_ARN`, and `DESIGN_DOMAIN` repository variables
