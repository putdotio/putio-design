# Distribution

This repo ships two public surfaces: the static guide at `design.put.io` and the
`@putdotio/design` npm package.

## Static Site

SST deploys the checked-in `system/` directory to AWS S3, CloudFront, and Route
53. Only the `production` stage is supported.

```bash
pnpm deploy:production
```

CI runs `pnpm verify:full` on every `main` push; the deploy workflow publishes
without re-running verification.

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

Run `pnpm tokens:build` after token edits. `pnpm tokens:check` rebuilds the
generated files and runs the design-system contract checks; CI fails if the
rebuilt `dist/` and `system/tokens.css` differ from what is committed.

Color tokens are emitted as `hsl()` / `hsla()` CSS values. Brand yellow remains
canonical `#FDCE45` in prose and identity guidance, with the generated CSS value
`hsl(44.7, 97.9%, 63.1%)`. Primary button hover uses the separate
`--button-primary-bg-hover` alias, generated from `--yellow-solid-hover`.

## Readiness Checks

`pnpm verify` is the fast local gate: skill lint, script typecheck, token build
plus contract checks, and HTML validation.

`pnpm verify:full` is the PR CI gate. It adds the design-mirror unit test,
Playwright browser coverage (computed-style contracts, TV geometry, axe
accessibility), and `npm pack --dry-run`. Use it before release-like changes or
large guide updates.

## Fonts And Assets

- Tokens reference the GT America and Berkeley Mono family names only. Do not
  publish proprietary font files unless licensing is explicitly cleared.
- Platform font bundling must not register GT America Mono; the
  `--font-ui-mono` token was removed, not aliased.
- The design guide loads production font CSS from `static.put.io`.
- Package-safe brand assets under `system/assets/` publish through
  `@putdotio/design/assets/*`.
- `app-icon-beta.png` stays published as a deprecated compatibility asset; new
  integrations use the standard app icon.

## Public Safety

Do not publish private research, local paths, auth-gated links or workspace
URLs, internal project links, screenshots from private workspaces, team photos,
account data, discount strategy, or tracker notes in this repo. This is the
canonical list; other docs point here.
