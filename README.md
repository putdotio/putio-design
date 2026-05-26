<div align="center">
  <p>
    <img src="https://static.put.io/images/putio-boncuk.png" width="72">
  </p>

  <h1>put.io design</h1>

  <p>Public design tokens and design-system guidance for <a href="https://put.io">put.io</a>.</p>
</div>

<br />

## View

Live guide: [design.put.io](https://design.put.io)

This repo owns the public contract behind it: DTCG token sources, generated CSS/JSON/TypeScript artifacts, preview cards, and deployable static guidance.

## Use

Token sources live in [`tokens`](tokens). Generated package artifacts live in [`dist`](dist).

```bash
npm install @putdotio/design
```

Common entrypoints:

- CSS custom properties: [`dist/css/tokens.css`](dist/css/tokens.css)
- DTCG token tree: [`dist/tokens.dtcg.json`](dist/tokens.dtcg.json)
- Flat token metadata: [`dist/tokens.flat.json`](dist/tokens.flat.json)
- Figma-safe subset: [`dist/figma/putio.tokens.json`](dist/figma/putio.tokens.json)
- Human and AI design contract: [`DESIGN.md`](DESIGN.md)

## Commands

```bash
pnpm install
pnpm dev
pnpm verify
pnpm verify:full
```

Use `pnpm tokens:build` after token edits.

## Docs

- [Design contract](DESIGN.md)
- [Design guide structure](system/README.md)
- [Distribution](docs/DISTRIBUTION.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Agent guide](AGENTS.md)

## License

[MIT](LICENSE)
