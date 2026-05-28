# Contributing

Thanks for contributing to put.io design.

## Setup

```bash
pnpm install
```

## Run Locally

```bash
pnpm dev
```

Open the printed local URL. The guide loads production font CSS from `static.put.io`, so internet access helps visual review.

## Validation

```bash
pnpm verify
```

Use `pnpm verify:full` before large guide, token, package, or deploy changes.

## Development Notes

- Edit token sources in `tokens/**/*.tokens.json`.
- Run `pnpm tokens:build` after token changes; run `pnpm tokens:check` when reviewing generated drift.
- Keep examples public-safe and content-agnostic.
- Use raw filename examples from [Agent guide](AGENTS.md).
- Put deploy and package details in [Distribution](docs/DISTRIBUTION.md).

## Pull Requests

- Keep changes focused.
- Update docs when public behavior, commands, tokens, or delivery changes.
- Use the pull request template and include the relevant verification command.
