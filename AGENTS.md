# Agent Guide

put.io's design system. Token sources build the public `@putdotio/design` npm
package, the public guide at `design.put.io`, and the claude.ai design system.
The web, Apple, Android, Roku, and TV apps consume the package. Everything
here ships publicly.

- [DESIGN.md](DESIGN.md): the design contract; open before changing tokens,
  components, or cards.
- [Design guide](system/README.md): open before editing `system/**`.

## Repo Rules

- `tokens/**/*.tokens.json` is the source of truth; `dist/` and
  `system/tokens.css` are generated.
- A deprecated token stays published until the next major release removes it.
  Its source sets `$extensions.putio.deprecated: true`, aliases the
  replacement, and names it in `$description`.
- Publish generic token artifacts, brand assets, and the design contract only.
  The Tailwind theme is the one generated adapter; platform repos own theirs.
  Add another only when a consuming platform repo asks for it.
- `system/assets/app-icon-beta.png` stays published as a deprecated
  compatibility asset.
- Tokens name GT America and Berkeley Mono only. Never publish proprietary
  font files unless their licensing is cleared.
- Platform design canvases live in their app repositories, not here.
- Public safety: no private research, local paths, auth-gated or workspace
  URLs, internal project links, private-workspace screenshots, team photos,
  account data, discount strategy, tracker notes, or claude.ai artifact URLs.

## Content

put.io is content-agnostic. Use raw filenames exactly as they appear:

- `The.Wire.S03E04.Back.Burners.1080p.BluRay.x264-DEMAND.mkv`
- `Seinfeld.S09E23.The.Finale.Part.2.720p.HDTV.x264-FLEET.mkv`
- `ubuntu-24.04.1-desktop-amd64.iso`
- `podcast_ep127_final_mixdown_v2.mp3`
- `IMG_4392.HEIC`
- `homework_answers_DONT_DELETE`
- `document-scan-march-2026.pdf`

Show only metadata the product has: no invented titles, posters, thumbnails,
descriptions, or codecs.

## Proof

- Token sources: `pnpm tokens:build`, commit `dist/` and `system/tokens.css`,
  then `pnpm verify:full`.
- Guide (`system/**`): `pnpm verify:full`, then check the affected section
  from `pnpm dev` in light and dark. Attach the captures to the pull request
  with `gh pr create --attach` (gh 2.99+); keep them out of Git.
- Scripts, infra, or package config: `pnpm verify:full`.
- Artifact inputs (`artifact/**`, `scripts/build-artifact.ts`): `pnpm verify`
  builds it; after publishing, check the changed cards on the artifact page.
- `DESIGN.md`: `pnpm verify`, which checks its frontmatter against the tokens.
- Other Markdown: `pnpm markdown:check`.
- Workflows (`.github/**`): CI lints them only after they reach `main`, not
  on pull requests.

## Delivery

Pull requests squash-merge into `main`. A merge can publish `@putdotio/design`
to npm ([CI](.github/workflows/ci.yml)) and redeploy `design.put.io`
([Deploy](.github/workflows/deploy.yml)). Only the `production` SST stage
exists; create no other stage.

### claude.ai design system

- Nothing republishes the `put.io design` artifact automatically. After a
  merge that changes tokens, `system/**`, `artifact/**`, or the artifact
  scripts, run the
  [republish-design-artifact](.claude/skills/republish-design-artifact/SKILL.md)
  skill.
- Never edit the artifact on its page; the next publish overwrites the edit.
