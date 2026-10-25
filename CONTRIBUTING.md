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

`pnpm verify:full` is the CI gate. Which change needs which:
[Agent guide](AGENTS.md#proof). To fix a Markdown formatting failure, run
`pnpm exec oxfmt "**/*.md"`.
