# Repo Pipeline Mapping

Use this when comparing a Claude Design prototype bundle with this repo.

## Prototype Names To Translate

| Prototype file or concept | Repo equivalent |
| --- | --- |
| `system/tokens.json` | `tokens/**/*.tokens.json` |
| `system/tokens.base.css` | `tokens/foundation.css` |
| `tools/build-tokens.mjs` | `scripts/build-tokens.ts` |
| generated `system/tokens.css` | generated `system/tokens.css` plus `dist/*` |
| local preview assets | `system/assets/` only when public and package-safe |
| chat logs, uploads, scraps, screenshots | `tmp/` evidence only |

## Fixed Checks

- Yellow brand fill: `#FDCE45` / `hsl(44.7, 97.9%, 63.1%)`
- Primary hover: `#F3C435` / `hsl(45, 89%, 58%)`
- Token source edits happen under `tokens/`
- Generated token artifacts must stay current after `pnpm tokens:build`
- Platform-native adapters stay in consuming platform repos
