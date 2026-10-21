# Agent Guide

put.io's design system. Token sources build the public `@putdotio/design` npm
package, which the web, Apple, Android, Roku, and TV apps consume, the public
guide at `design.put.io`, and the claude.ai design system and canvases. Everything
here ships publicly.

## Start Here

- [DESIGN.md](DESIGN.md): the design contract; open before changing tokens,
  components, or cards.
- [Design guide](system/README.md): open before editing `system/**`.
- [Distribution](docs/distribution.md): open before a deploy, a release, an
  asset, or an artifact publish.

## Commands

```bash
pnpm install
pnpm dev            # serves the guide; open the printed URL
pnpm tokens:build   # regenerates dist/ and system/tokens.css from tokens/
pnpm verify         # fast gate: types, token contracts, artifact build, HTML, Markdown
pnpm verify:full    # CI gate: adds Playwright and an npm pack dry run
pnpm artifact       # builds the claude.ai design system and canvases into artifact/out/
```

## PR Evidence

The pull request template asks for screenshots or recordings on visual guide
changes. Capture the affected guide section from `pnpm dev` in both light and
dark modes, upload the media with `gh pr create --attach ./file.png` or
`gh pr comment <n> --attach ./file.mp4` (gh 2.99+), and reference it under
Review Notes. Keep proof media out of Git.

## Worktrees

`.worktreeinclude` carries optional `.env` files into Codex and Claude
worktrees; a fresh worktree needs `pnpm install`.

## Repo Rules

- `tokens/**/*.tokens.json` is the source of truth.
- Generated artifacts live in `dist/` and `system/tokens.css`.
- Yellow `#FDCE45` is the fixed brand constant; CSS emits it as `hsl(44.7, 97.9%, 63.1%)`.
- Shared form and panel chrome lives in `--field-*` and `--panel-*` aliases.
- Icons use Phosphor-style inline SVG.
- TV surfaces are file browsers: list-first, focus-first, not poster grids.
- Public-safety list and the no-platform-native-outputs policy: [Distribution](docs/distribution.md#public-safety), [Package Artifacts](docs/distribution.md#package-artifacts).

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

Berkeley Mono is the only mono face; TV product UI has no mono; a TV debug overlay may use the platform's system monospace. Font
licensing and loading: [Distribution](docs/distribution.md#fonts-and-assets).

## Proof

- Token sources: `pnpm tokens:build`, commit `dist/` and `system/tokens.css`,
  then `pnpm verify:full`.
- Guide (`system/**`): `pnpm verify:full`, then check the affected section
  from `pnpm dev` in light and dark.
- Scripts, infra, or package config: `pnpm verify:full`.
- Artifact inputs (`artifact/**`, `scripts/build-artifact.ts`): `pnpm verify`
  builds it; after publishing, check the changed cards on the artifact page.
- `DESIGN.md`: `pnpm verify`, which checks its frontmatter against the tokens.
- Other Markdown: `pnpm markdown:check`; no runtime proof. The
  [CI](.github/workflows/ci.yml) verify job checks relative links and anchors
  on every run.
- Workflows (`.github/**`): the CI verify job runs Actionlint and Zizmor on
  `main` pushes that change them and on manual dispatch, not on pull requests.

## Delivery

Pull requests squash-merge into `main`. A merge runs [CI](.github/workflows/ci.yml),
whose semantic-release step publishes `@putdotio/design` to npm when a commit
warrants a release, and [Deploy](.github/workflows/deploy.yml) redeploys
`design.put.io` when the merge touches its paths, `docs/**` included. Only the
`production` SST stage exists; do not create preview, spike, or staging
stages. Mechanics: [Distribution](docs/distribution.md#static-site).

Nothing republishes the claude.ai artifacts automatically. After a merge that
changes tokens, `system/**`, `artifact/**`, or the artifact scripts,
republish them: [Distribution](docs/distribution.md#claude-artifacts).
