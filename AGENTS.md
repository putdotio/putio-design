# Agent Guide

## Start Here

1. [DESIGN.md](DESIGN.md) — public design contract
2. [Design guide](system/README.md) — deployed site shape
3. [Distribution](docs/DISTRIBUTION.md) — deploy, package, and artifact policy
4. [Contributing](CONTRIBUTING.md) — local workflow

## Commands

```bash
pnpm install
pnpm verify
pnpm verify:full
pnpm dev
```

Use `pnpm tokens:build` after editing `tokens/**/*.tokens.json`.

## Worktrees

`.worktreeinclude` carries optional `.env` files into Codex and Claude
worktrees. Run `pnpm install` and `pnpm verify`; no Infisical setup is required.

## Repo Rules

- `tokens/**/*.tokens.json` is the source of truth.
- Generated artifacts live in `dist/` and `system/tokens.css`.
- Yellow `#FDCE45` is the fixed brand constant; CSS emits it as `hsl(44.7, 97.9%, 63.1%)`.
- Shared form and panel chrome lives in `--field-*` and `--panel-*` aliases.
- Icons use Phosphor-style inline SVG. No emoji as UI icons.
- TV surfaces are file browsers: list-first, focus-first, not poster grids.
- Keep public docs generic. Private research, local paths, account data, team photos, and unreleased plans stay out.
- Do not publish platform-native outputs from this repo. Platform repos consume generic CSS/JSON/DTCG artifacts and own adapters.

## Content

put.io is content-agnostic. Use raw filenames exactly as they appear:

- `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`
- `Seinfeld.S09E23.The.Finale.Part.2.720p.HDTV.x264-FLEET.mkv`
- `ubuntu-24.04.1-desktop-amd64.iso`
- `podcast_ep127_final_mixdown_v2.mp3`
- `IMG_4392.HEIC`
- `homework_answers_DONT_DELETE`
- `document-scan-march-2026.pdf`

Do not invent titles, posters, thumbnails, descriptions, codecs, or metadata the product does not have.

## Typography

The guide references GT America, GT America Mono, and Berkeley Mono by family name. Do not commit proprietary font files unless licensing is explicitly cleared.

## Deploy

Only the `production` SST stage is supported. Do not create preview, spike, or staging stages for this repo.
