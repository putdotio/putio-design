<div align="center">
  <p>
    <img src="https://static.put.io/images/putio-boncuk.png" width="72">
  </p>

  <h1>put.io design</h1>

  <p>Public design tokens, foundations, and design-system guidance for <a href="https://put.io">put.io</a></p>
</div>

<br />

## View

Live design system: [design.put.io](https://design.put.io)

The site is deployed with SST to AWS S3, CloudFront, and Route 53. The deployed
artifact is the checked-in [`system`](system) directory, which consumes generated
tokens from [`tokens`](tokens).

Legacy HTML explorations remain in [`prototypes`](prototypes), but reusable
decisions should move into the design system as tokens, preview cards, public
guidance, or private planning docs outside this public repo.

## Tokens

The canonical token source is DTCG-compatible JSON in [`tokens`](tokens).
Generated outputs are checked in under [`dist`](dist):

- [`dist/css/tokens.css`](dist/css/tokens.css) — generic CSS custom properties
- [`dist/tokens.dtcg.json`](dist/tokens.dtcg.json) — merged DTCG token tree
- [`dist/tokens.flat.json`](dist/tokens.flat.json) — resolved token metadata
- [`dist/tokens.js`](dist/tokens.js) + [`dist/tokens.d.ts`](dist/tokens.d.ts) — typed token metadata for TypeScript consumers
- [`dist/tokens.ts`](dist/tokens.ts) — source-form generated metadata for repository review
- [`dist/figma/putio.tokens.json`](dist/figma/putio.tokens.json) — Figma-safe subset

Run `pnpm tokens:build` after editing token sources. Run `pnpm verify` before
shipping a token or design-system change.

## Verify

```bash
pnpm verify       # scripts, tokens, HTML validation, static smoke, SST version
pnpm verify:full  # verify + Playwright accessibility/browser pass + npm pack dry-run
pnpm dev          # serve system/ at http://127.0.0.1:4173
```

## Docs

- [Agent guide](AGENTS.md) — contributor and agent guidance
- [DESIGN.md](DESIGN.md) — human and AI-readable design contract
- [Design system guide](system/README.md) — generated tokens, preview cards, and usage rules
- [Distribution](docs/DISTRIBUTION.md) — deploy, package, and generated artifact rules
- [Docs index](docs/README.md) — public docs in this repo

## Contributing

See [Contributing](CONTRIBUTING.md).

## Security

See [Security](SECURITY.md).

## License

This project is available under the [MIT License](LICENSE)
