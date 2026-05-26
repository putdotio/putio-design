# Distribution

`putio-design` ships two public surfaces: the static design guide at
`design.put.io` and package artifacts from `@putdotio/design`.

## Static Site

SST deploys the checked-in `system/` directory to AWS S3, CloudFront, and Route
53. Only the `production` stage is supported.

```bash
pnpm deploy:production
```

The deploy workflow must run `pnpm verify` before publishing the site.

## Package Artifacts

`@putdotio/design` is a public scoped npm package. It exposes generic token
artifacts and the design contract only:

- `@putdotio/design/css`
- `@putdotio/design/tokens`
- `@putdotio/design/tokens/meta`
- `@putdotio/design/tokens/dtcg`
- `@putdotio/design/tokens/figma`
- `@putdotio/design/design.md`

Do not publish platform-native outputs from this repo in v1. Web, iOS, Android,
Roku, and TV repos should consume the generic token artifacts and own their
platform adapters.

Package publishing follows the same release flow as the other public put.io
tooling packages. Merges to `main` are considered publishable. The CI workflow
runs:

1. `pnpm verify:full` on pull requests and `main` pushes.
2. semantic-release on `main` after verification passes.

semantic-release analyzes Conventional Commits, publishes to npm, creates
GitHub Releases, and commits released package metadata back to `main` with
`[skip ci]`.

Published packages use npm Trusted Publishing and provenance.

Before the first publish, an npm maintainer must trust this workflow for the
package:

```bash
npx -y npm@^11.10.0 trust github @putdotio/design --repo putdotio/putio-design --file ci.yml --env release --allow-publish --yes
```

The release job uses the `release` GitHub Environment with `deployment: false`.

Required protected inputs:

- `PUTIO_RELEASE_BOT_CLIENT_ID` as a repository or Environment variable
- `PUTIO_RELEASE_BOT_PRIVATE_KEY` as an Environment secret

Release GitHub writes use the put.io release bot. The default `GITHUB_TOKEN`
remains read-only, and the release-bot remote is configured only after
dependencies are installed.

## Generated Files

Token sources live in `tokens/**/*.tokens.json`. Generated files are checked in
so package consumers and the static site do not need a build step:

- `dist/css/tokens.css`
- `dist/tokens.dtcg.json`
- `dist/tokens.flat.json`
- `dist/tokens.js`
- `dist/tokens.d.ts`
- `dist/tokens.ts`
- `dist/figma/putio.tokens.json`
- `system/tokens.css`

Run `pnpm tokens:build` after token edits. `pnpm tokens:check` rebuilds and
fails if generated files drift.

## Readiness Checks

`pnpm verify` is the fast local gate. It typechecks readiness scripts,
rebuilds tokens, validates generated drift, validates deployed HTML, starts a
local static server, smokes important pages, and checks `sst version`.

`pnpm verify:full` is the PR CI gate. It adds Playwright browser coverage, an
axe accessibility pass, and `npm pack --dry-run`. Use it before release-like
changes or large guide updates.

## Fonts And Assets

Tokens may reference GT America, GT America Mono, and Berkeley Mono family
names. Do not publish proprietary font files from this package unless licensing
is explicitly cleared. The design guide loads production font CSS from
`static.put.io`.

## Public Safety

Do not publish private research, local paths, auth-gated links, Claude project
links, screenshots from private workspaces, team photos, account data, discount
strategy, or tracker notes in this repo.
