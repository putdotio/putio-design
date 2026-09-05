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

## Skills

`skills/putio-design-handoff/` is the authored skill for importing, verifying,
and responding to design handoffs; `.agents/skills/` and `.claude/skills` are
generated discovery links, so edit only under `skills/`. `pnpm skills:lint`
(part of `pnpm verify`) lints it.

## PR Evidence

The pull request template asks for screenshots or recordings on visual guide
changes. Capture the affected guide section from `pnpm dev` in both light and
dark modes, attach the media to the pull request, and reference it under
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

The guide references GT America and Berkeley Mono by family name. Berkeley Mono is the
only mono face; TV surfaces have no mono at all. Do not commit proprietary font files
unless licensing is explicitly cleared.

## Deploy

Only the `production` SST stage is supported. Do not create preview, spike, or staging stages for this repo.

## Finishing Work

Finish token, guide, and preview edits plus `pnpm verify` without pausing; ask before deploys, writes to the external design project, and anything outside the task. Done means `pnpm verify` (or `pnpm verify:full` for guide or token changes) passed and the affected guide section was checked in both modes.
