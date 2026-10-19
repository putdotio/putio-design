# Contributing

## Setup

```bash
pnpm install
```

## Run Locally

```bash
pnpm dev
```

Open the printed local URL. The guide loads production font CSS from
`static.put.io`, so internet access helps visual review.

## Validation

```bash
pnpm verify
```

Run `pnpm verify:full` for token, guide, script, package, or deploy changes;
it adds the Playwright suite and a pack dry run.

`pnpm verify` includes the Markdown formatting check; `pnpm exec oxfmt "**/*.md"`
fixes it.

## Development Notes

- Edit token sources in `tokens/**/*.tokens.json`.
- Run `pnpm tokens:build` after token changes; `pnpm tokens:check` rebuilds and runs the contract checks. Commit the regenerated `dist/` and `system/tokens.css`; CI fails on drift.
- Keep examples public-safe ([Distribution: Public Safety](docs/distribution.md#public-safety)) and content-agnostic, using the raw filename examples in [Agent guide](AGENTS.md#content).
- Put deploy and package details in [Distribution](docs/distribution.md).

## Pull Requests

- Update docs when public behavior, commands, tokens, or delivery changes.
- Use the pull request template and include the relevant verification command.
