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

Package publishing uses the manual `Publish Package` GitHub Actions workflow.
The workflow runs `pnpm verify:full`, publishes with npm provenance, and expects
npm Trusted Publishing to be configured for the `release` GitHub Environment.
Use the `next` dist-tag for pre-release or adoption-test packages, and `latest`
only for a release that should become the default npm install target.

Before the first publish, an npm maintainer must trust this workflow for the
package:

```bash
npx -y npm@^11.10.0 trust github @putdotio/design --repo putdotio/putio-design --file publish-package.yml --env release --allow-publish --yes
```

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
