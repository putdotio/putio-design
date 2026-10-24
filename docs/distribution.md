# Distribution

This repo ships three surfaces: the static guide at `design.put.io`, the
`@putdotio/design` npm package, and the [Claude artifacts](#claude-artifacts).

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
contract. The Tailwind export is the one generated adapter: a Tailwind v4
`@theme` that maps those custom properties to Tailwind keys and carries no
values of its own.

Do not publish other platform-native outputs from this repo. Web, iOS,
Android, Roku, and TV repos consume the generic token artifacts and brand
assets and own their platform adapters; revisit only if a consuming platform
repo explicitly asks for a generated adapter.

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

## Deprecated Tokens

A deprecated token stays published until the next major release, which
removes it as a breaking change.

- Its source sets `$extensions.putio.deprecated: true`, aliases its
  replacement, and names that replacement in `$description`. The build fails
  otherwise.
- The flat JSON and `tokens.js` carry `deprecated: true`.
- The CSS marks the property: `--input-bg: …; /* deprecated: use --field-bg */`.
- Guide pages read the replacement; `pnpm verify` fails on a deprecated read.

## Claude Artifacts

Four claude.ai artifacts give Claude sessions the system. They are generated,
never edited on their pages: the next publish overwrites page edits.

| Artifact        | Type          | Holds                                               |
| --------------- | ------------- | --------------------------------------------------- |
| `put.io design` | Design System | tokens, foundation cards, brand book                |
| `put.io web`    | Design canvas | web screens, patterns and components as pages       |
| `put.io TV`     | Design canvas | 1920×1080 web TV, Roku, tvOS and Android TV screens |
| `put.io mobile` | Design canvas | iOS, iPadOS, Android and watchOS screens            |

`pnpm artifact` builds each one's `project/` files into `artifact/out/<id>/`
with its publish list in `files.json`:
[`scripts/build-artifact.ts`](../scripts/build-artifact.ts) the design system
(`core`), [`scripts/build-canvases.ts`](../scripts/build-canvases.ts) the
canvases, one artboard per screen in `system/preview/` with the card's
headline as its note. Hand-written inputs: the brand book
(`artifact/core/README.md`), the cover and asset notes (`artifact/shared/`).

- No artifact can load `static.put.io`, so they render in Inter and JetBrains
  Mono. Phosphor ships inside each from the pinned `@phosphor-icons/web` dev
  dependency.
- Every `system/assets/` file and Phosphor font is an upload in each artifact,
  mapped to its `/_blob/` URL in `artifact/notes.json`; the build fails on an
  unmapped one. A new asset is an upload per artifact plus its `notes.json`
  entries, and a record in the design system's `assetGroups`.
- Artifact URLs stay out of this repo. Find them with the Artifact tool
  (`list`).

No API lets CI publish, so a Claude session with edit access republishes:

1. `PUTIO_DESIGN_ARTIFACT_URL=<put.io design URL> pnpm artifact`; the
   variable installs the design system on each canvas.
2. Design system: read its `project/design-system.json`, publish the paths in
   `artifact/out/core/files.json` with `root` `artifact/out/core`, and send the
   index only when its title or asset records change, merged into the copy
   just read, last.
3. Each canvas: publish `project/canvas.json`, `project/Main.dc.html` and
   `project/kit/**` from `artifact/out/<id>/` first, with
   `project/ds/putio/tokens.json` copied from the design system's
   `project/tokens.json`; then the other artboards. Remove artboards the build
   no longer makes.

Done when the changed cards and screens render on their pages.

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
