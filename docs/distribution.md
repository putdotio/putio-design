# Distribution

This repo ships three surfaces: the static guide at `design.put.io`, the
`@putdotio/design` npm package, and the claude.ai design system artifact.

## Static Site

SST deploys the checked-in `system/` directory to AWS S3, CloudFront, and Route 53. Only the `production` stage is supported.

```bash
pnpm deploy:production
```

[`deploy.yml`](../.github/workflows/deploy.yml) deploys on manual dispatch and on
`main` pushes that touch its `on.push.paths`. It does not re-run verification;
CI runs `pnpm verify:full` on the same push.

## Package Artifacts

`@putdotio/design` is a public scoped npm package. It exposes generic token
artifacts, package-safe brand assets, and the design contract; the subpaths are
`package.json` `exports`, mapped to files in the [README](../README.md#use).

The token CSS export is the web custom-property contract. It includes palette
tokens, component aliases such as `--field-*` and `--panel-*`, plus action
aliases such as `--primary`, `--success`, `--destructive`, and their
`--*-foreground` companions. The component export is the Tier-1 web recipe
contract.

Do not publish platform-native outputs from this repo. Web, iOS, Android,
Roku, and TV repos consume the generic token artifacts and brand assets and
own their platform adapters; revisit only if a consuming platform repo
explicitly asks for a generated adapter.

Merges to `main` are publishable. [ci.yml](../.github/workflows/ci.yml) runs
`pnpm verify:full` on pull requests and `main` pushes, then semantic-release on
`main`. The `release` config in `package.json` decides whether a commit
publishes; releases go to npm with provenance and to GitHub Releases.

## Generated Files

Token sources live in `tokens/**/*.tokens.json`. The generated `dist/` files
and `system/tokens.css` are checked in so package consumers and the static
site need no build step. CI fails if the rebuilt files differ from what is
committed; the rebuild commands are in [Contributing](../CONTRIBUTING.md#development-notes).

Color tokens are emitted as `hsl()` / `hsla()` CSS values. Brand yellow remains
canonical `#FDCE45` in prose and identity guidance, with the generated CSS value
`hsl(44.7, 97.9%, 63.1%)`. Primary button hover uses the separate
`--button-primary-bg-hover` alias, generated from `--yellow-solid-hover`.

## Design System Artifact

The claude.ai Design System artifact `put.io design` gives Claude sessions the
system as tokens, cards, and a brand book. It is generated, never edited on its
page: the next publish overwrites page edits.
[`scripts/build-artifact.ts`](../scripts/build-artifact.ts) builds its
`project/` files into `artifact/out/` from `dist/tokens.flat.json`, the guide
CSS, and `system/preview/`, plus the hand-written brand book, cover, and asset
notes in `artifact/project/`. The brand book stays a one-screen summary that
links `DESIGN.md` and the platform contracts.

- The artifact can't load `static.put.io`, so its previews render in Inter and
  JetBrains Mono.
- Every `system/assets/` file is an upload in the artifact, mapped to its
  `/_blob/` URL in `artifact/notes.json`; the build fails on an unmapped file.
  A new asset is an upload, a record in the artifact index's `assetGroups`, and
  a `notes.json` entry.

No API lets CI publish, so a Claude session with edit access to the artifact
republishes it:

1. `pnpm artifact`.
2. Find the artifact with the Artifact tool (`list`, type `Design System`) and
   read its `project/design-system.json`.
3. Publish the paths in `artifact/out/files.json` with `root` `artifact/out`,
   at most 255 per call. Send the index only when its title or asset records
   change, merged into the copy just read, in the last call.

Done when the changed cards render on the artifact page in light and dark.

## Fonts And Assets

- Tokens reference the GT America and Berkeley Mono family names only. Do not
  publish proprietary font files unless licensing is explicitly cleared.
- Platform font bundles register GT America and Berkeley Mono only; GT America
  Mono is retired.
- The design guide loads production font CSS from `static.put.io`.
- Package-safe brand assets under `system/assets/` publish through
  `@putdotio/design/assets/*`.
- `app-icon-beta.png` stays published as a deprecated compatibility asset; new
  integrations use the standard app icon.

## Public Safety

Do not publish private research, local paths, auth-gated links or workspace
URLs, internal project links, screenshots from private workspaces, team photos,
account data, discount strategy, or tracker notes in this repo.
