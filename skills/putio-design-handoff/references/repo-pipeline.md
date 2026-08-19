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

## Regression Audit

The design tool can rewrite whole files and silently reverse repo-side fixes.
Run the focused token scan alongside the file diff from SKILL.md step 4:

```bash
rg -n "tokens.json|tokens.base.css|tools/build-tokens|yellow-solid|button-primary-bg-hover|field-ring|panel-bg|data-contrast-contract|solid-foreground|F3C437|F3C435" system tokens scripts dist
```

Audit every changed hunk in both directions and fact-check numeric captions
such as contrast ratios, hex values, and ring sizes against the built tokens
and demo CSS.

Recurring regressions:

- `--solid-foreground` is mode-aware (light: black, 6.5:1 on the gray solid; dark: white, 4.96:1) — reject graph versions that flatten it to global white
- Watch for the recurring `#F3C437` hover-caption typo (canonical hover hex is in SKILL.md step 5)
- Preserve repo-side `role="img"`, `role="switch"`, and calendar `aria-label` fixes when regenerated cards drop them
- Platform-native adapters stay in consuming platform repos
