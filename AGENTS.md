# Agent Guide

put.io's design system. Token sources build the public `@putdotio/design` npm
package, the public guide at `design.put.io`, and the claude.ai design system.
The web, Apple, Android, Roku, and TV apps consume the package. Everything
here ships publicly.

- [DESIGN.md](DESIGN.md): the design contract; open before changing tokens,
  components, or cards.
- [Design guide](system/README.md): open before editing `system/**`.

## Commands

```bash
pnpm install
pnpm dev            # serves the guide; open the printed URL
pnpm tokens:build   # regenerates dist/ and system/tokens.css from tokens/
pnpm verify         # fast gate: types, token contracts, artifact build, HTML, Markdown
pnpm verify:full    # CI gate: adds Playwright and an npm pack dry run
pnpm artifact       # builds the claude.ai design system into artifact/out/
```

## Repo Rules

- `tokens/**/*.tokens.json` is the source of truth. `dist/` and
  `system/tokens.css` are generated and committed.
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

Do not invent titles, posters, thumbnails, descriptions, codecs, or metadata the product does not have.

## Proof

- Token sources: `pnpm tokens:build`, commit `dist/` and `system/tokens.css`,
  then `pnpm verify:full`. CI fails if the rebuilt files differ.
- Guide (`system/**`): `pnpm verify:full`, then check the affected section
  from `pnpm dev` in light and dark. Attach the captures to the pull request
  with `gh pr create --attach` (gh 2.99+); keep them out of Git.
- Scripts, infra, or package config: `pnpm verify:full`.
- Artifact inputs (`artifact/**`, `scripts/build-artifact.ts`): `pnpm verify`
  builds it; after publishing, check the changed cards on the artifact page.
- `DESIGN.md`: `pnpm verify`, which checks its frontmatter against the tokens.
- Other Markdown: `pnpm markdown:check`. The [CI](.github/workflows/ci.yml)
  verify job checks relative links and anchors.
- Workflows (`.github/**`): the CI verify job runs Actionlint and Zizmor on
  `main` pushes that change them and on manual dispatch, not on pull requests.

## Delivery

Pull requests squash-merge into `main`. A merge runs
[CI](.github/workflows/ci.yml), whose semantic-release step publishes
`@putdotio/design` to npm when a commit warrants a release, and
[Deploy](.github/workflows/deploy.yml), which redeploys `design.put.io` when
the merge touches its paths. Only the `production` SST stage exists; do not
create preview, spike, or staging stages.

### claude.ai design system

Nothing republishes the `put.io design` artifact automatically. After a merge
that changes tokens, `system/**`, `artifact/**`, or the artifact scripts, a
Claude session with edit access republishes it:

1. Run `pnpm artifact`.
2. Read the artifact's `project/design-system.json`.
3. Publish the paths in `artifact/out/core/files.json` with `root`
   `artifact/out/core`.
4. Last, send the index only if its title or asset records changed, merged
   into the copy read in step 2.
5. Check that the changed cards render on its page. The artifact cannot load
   `static.put.io`, so it renders in Inter and JetBrains Mono.

Find the artifact with the Artifact tool (`list`). Never edit it on its page;
the next publish overwrites the edit. A new `system/assets/` file needs an
upload, its `/_blob/` URL in `artifact/notes.json`, and a record in the
design system's `assetGroups`.
