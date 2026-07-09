# Distribution

This repo ships two public surfaces: the static guide at `design.put.io` and the
`@putdotio/design` npm package.

## Static Site

SST deploys the checked-in `system/` directory to AWS S3, CloudFront, and Route
53. Only the `production` stage is supported.

```bash
pnpm deploy:production
```

The deploy workflow must run `pnpm verify` before publishing the site.

## Package Artifacts

`@putdotio/design` is a public scoped npm package. It exposes generic token
artifacts, package-safe brand assets, and the design contract:

- `@putdotio/design/assets/*`
- `@putdotio/design/css`
- `@putdotio/design/tokens`
- `@putdotio/design/tokens/meta`
- `@putdotio/design/tokens/dtcg`
- `@putdotio/design/tokens/figma`
- `@putdotio/design/design.md`

The CSS export is the web custom-property contract. It includes palette tokens,
component aliases such as `--field-*` and `--panel-*`, plus action aliases such
as `--primary`, `--success`, `--destructive`, and their `--*-foreground`
companions.

Do not publish platform-native outputs from this repo. Web, iOS, Android,
Roku, and TV repos consume the generic token artifacts and brand assets and
own their platform adapters; revisit only if a consuming platform repo
explicitly asks for a generated adapter.

Merges to `main` are considered publishable. The CI workflow runs:

1. `pnpm verify:full` on pull requests and `main` pushes.
2. semantic-release on `main` after verification passes.

semantic-release analyzes Conventional Commits, publishes to npm, creates
GitHub Releases, and publishes the package with npm provenance.

## Generated Files

Token sources live in `tokens/**/*.tokens.json`. Generated files are checked in
so package consumers and the static site do not need a build step:

- `dist/css/tokens.css`
- `dist/tokens.dtcg.json`
- `dist/tokens.flat.json`
- `dist/tokens.js`
- `dist/tokens.d.ts`
- `dist/figma/putio.tokens.json`
- `system/tokens.css`

Run `pnpm tokens:build` after token edits. `pnpm tokens:check` verifies that
generated files match the token sources.

Color tokens are emitted as `hsl()` / `hsla()` CSS values. Brand yellow remains
canonical `#FDCE45` in prose and identity guidance, with the generated CSS value
`hsl(44.7, 97.9%, 63.1%)`. Primary button hover uses the separate
`--button-primary-bg-hover` alias, generated from `--yellow-solid-hover`.

## Readiness Checks

`pnpm verify` is the fast local gate. It typechecks scripts, validates generated
token artifacts, checks HTML, smokes important pages through a local static
server, and checks `sst version`.

`pnpm verify:full` is the PR CI gate. It adds Playwright browser coverage, an
axe accessibility pass, and `npm pack --dry-run`. Use it before release-like
changes or large guide updates.

## Fonts And Assets

Tokens may reference GT America, GT America Mono, and Berkeley Mono family
names. Do not publish proprietary font files from this package unless licensing
is explicitly cleared. Package-safe brand assets under `system/assets/` are
published through `@putdotio/design/assets/*`. The design guide loads production
font CSS from `static.put.io`.

## Public Safety

Do not publish private research, local paths, auth-gated links or workspace
URLs, internal project links, screenshots from private workspaces, team photos,
account data, discount strategy, or tracker notes in this repo. This is the
canonical list; other docs point here.
