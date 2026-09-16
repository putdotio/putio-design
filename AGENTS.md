# Agent Guide

## Start Here

1. [DESIGN.md](DESIGN.md) — public design contract
2. [Design guide](system/README.md) — deployed site shape
3. [Distribution](docs/DISTRIBUTION.md) — deploy, package, and artifact policy
4. [Contributing](CONTRIBUTING.md) — local workflow

## Commands

Setup, local run, validation, and the token rebuild rule:
[Contributing](CONTRIBUTING.md). Scripts are defined in `package.json` under `scripts` and nowhere else.

## PR Evidence

The pull request template asks for screenshots or recordings on visual guide
changes. Capture the affected guide section from `pnpm dev` in both light and
dark modes, upload the media with `gh pr create --attach ./file.png` or
`gh pr comment <n> --attach ./file.mp4` (gh 2.99+), and reference it under
Review Notes. Keep proof media out of Git.

## Worktrees

`.worktreeinclude` carries optional `.env` files into Codex and Claude
worktrees. Run `pnpm install` and `pnpm verify`.

## Repo Rules

- `tokens/**/*.tokens.json` is the source of truth.
- Generated artifacts live in `dist/` and `system/tokens.css`.
- Yellow `#FDCE45` is the fixed brand constant; CSS emits it as `hsl(44.7, 97.9%, 63.1%)`.
- Shared form and panel chrome lives in `--field-*` and `--panel-*` aliases.
- Icons use Phosphor-style inline SVG. No emoji as UI icons.
- TV surfaces are file browsers: list-first, focus-first, not poster grids.
- Public-safety list and the no-platform-native-outputs policy: [Distribution](docs/DISTRIBUTION.md#public-safety), [Package Artifacts](docs/DISTRIBUTION.md#package-artifacts).

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

Berkeley Mono is the only mono face; TV surfaces have no mono at all. Font
licensing and loading: [Distribution](docs/DISTRIBUTION.md#fonts-and-assets).

## Deploy

Only the `production` SST stage is supported. Do not create preview, spike, or staging stages for this repo. Mechanics: [Distribution](docs/DISTRIBUTION.md#static-site).

## Finishing Work

Finish token, guide, and preview edits plus `pnpm verify` without pausing; ask before deploys, writes to the external design project, and anything outside the task. Done means `pnpm verify` (or `pnpm verify:full` for guide or token changes) passed and the affected guide section was checked in both modes.
