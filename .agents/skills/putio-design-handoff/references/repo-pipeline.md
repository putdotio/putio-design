# Repo Pipeline Mapping

Use this when comparing a Claude Design prototype bundle with this repo.

## Prototype Names To Translate

| Prototype file or concept | Repo equivalent |
| --- | --- |
| `system/tokens.json` (single-file graph) | `tokens/**/*.tokens.json` (typed split: `$type` + `putio.mode` + `cssName`) |
| `system/tokens.base.css` | `tokens/foundation.css` |
| `tools/build-tokens.mjs` / `.cjs` | `scripts/build-tokens.ts` |
| generated `system/tokens.css` | generated `system/tokens.css` plus `dist/*` |
| `system/fonts.css` (self-hosted faces) | not imported — repo previews link the public `static.put.io` font CSS |
| first-line `<!-- @dsCard … -->` markers | stripped on import; repo cards start at `<!DOCTYPE html>` |
| `components/*` (compiled React), `templates/*` (DC pages) | reference only — platform-native outputs stay out of this repo |
| `styles.css`, `_ds_*` manifests, `SKILL.md`, `_adherence.*` | design-tool-side, not imported |
| local preview assets | `system/assets/` only when public and package-safe |
| chat logs, uploads, scraps, screenshots | `tmp/` evidence only |

## Fixed Checks

- Yellow brand fill: `#FDCE45` / `hsl(44.7, 97.9%, 63.1%)`
- Primary hover: `#F3C435` / `hsl(45, 89%, 58%)` (watch for the recurring `#F3C437` caption typo)
- `--solid-foreground` is mode-aware (light: black, 6.5:1 on the gray solid; dark: white, 4.96:1) — reject graph versions that flatten it to global white
- Token source edits happen under `tokens/`
- Generated token artifacts must stay current after `pnpm tokens:build`
- `DESIGN.md` front-matter typography sizes are string-compared to built `fontSize.base/sm/display` values
- `tv-shell.css`: no `!important` anywhere in the file (comments included); TV tokens scoped to `.tv`
- Platform-native adapters stay in consuming platform repos
