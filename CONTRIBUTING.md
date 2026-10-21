# Contributing

## Setup

```bash
pnpm install
```

## Run Locally

```bash
pnpm dev
```

The guide loads its fonts from `static.put.io`; offline, cards render in
fallback faces.

## Validation

```bash
pnpm verify
```

`pnpm verify:full` is the CI gate: it adds the Playwright suite and a pack dry
run. Which change needs which: [Agent guide](AGENTS.md#proof). For a Markdown
formatting failure, `pnpm exec oxfmt "**/*.md"` fixes it.

## Development Notes

- Edit token sources in `tokens/**/*.tokens.json`.
- Run `pnpm tokens:build` after token changes and commit the regenerated `dist/` and `system/tokens.css`; CI fails on drift.
- Keep examples public-safe ([Distribution: Public Safety](docs/distribution.md#public-safety)) and content-agnostic, using the raw filename examples in [Agent guide](AGENTS.md#content).
- Deploy, package, and artifact details live in [Distribution](docs/distribution.md).
