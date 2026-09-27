# Distribution

This repo ships two public surfaces: the static guide at `design.put.io` and the
`@putdotio/design` npm package.

## Static Site

SST deploys the checked-in `system/` directory to AWS S3, CloudFront, and Route
53. Only the `production` stage is supported.

```bash
pnpm deploy:production
```

[`deploy.yml`](../.github/workflows/deploy.yml) deploys on `main` pushes that
touch a path in its `on.push.paths` filter, which includes `DESIGN.md`,
`docs/**`, `system/**`, `tokens/**`, and `dist/**`, and on manual dispatch. It
does not re-run verification; CI runs `pnpm verify:full` on the same push.

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
site need no build step. Run `pnpm tokens:build` after token edits;
`pnpm tokens:check` rebuilds and runs the design-system contract checks, and
CI fails if the rebuilt files differ from what is committed.

Color tokens are emitted as `hsl()` / `hsla()` CSS values. Brand yellow remains
canonical `#FDCE45` in prose and identity guidance, with the generated CSS value
`hsl(44.7, 97.9%, 63.1%)`. Primary button hover uses the separate
`--button-primary-bg-hover` alias, generated from `--yellow-solid-hover`.

## Readiness Checks

`pnpm verify` is the fast local gate. `pnpm verify:full` is the PR CI gate; it
adds Playwright browser coverage (computed-style contracts, TV geometry, axe
accessibility) and a pack dry run. Use it before release-like changes or large
guide updates. Their composition is the `scripts` block in `package.json` and nowhere else.

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
