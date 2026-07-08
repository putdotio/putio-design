---
name: putio-design-handoff
description: Import, inspect, implement, verify, and respond to design handoffs for this put.io design-system repo, especially Claude Design project URLs (claude.ai/design/p/…, read via the DesignSync tool) and prototype export bundles. Use when the user provides a design handoff URL, asks to pull or inspect Claude Design output, asks whether design/tokens are ready, asks to port prototype changes into putio-design, or asks to write feedback back to the design tool about discrepancies, failed checks, missing assets, token drift, accessibility issues, or implementation notes.
---

# put.io Design Handoff

## Workflow

1. Start from the repo contract.
   - Read `AGENTS.md`, `DESIGN.md`, `system/README.md`, `docs/DISTRIBUTION.md`, and the relevant files under `tokens/`, `system/`, `scripts/`, and `tests/`.
   - Treat `tokens/**/*.tokens.json` as canonical for this repo. `dist/*` and `system/tokens.css` are generated outputs.
   - Preserve public/private boundaries: do not copy private research, local paths, auth-gated URLs, team screenshots, account data, or internal workflow details into checked-in files.

2. Save the Claude Design artifact under `tmp/`.

   **Option A — Claude Design project URL** (`https://claude.ai/design/p/<project-uuid>`): use the `DesignSync` tool (load it via ToolSearch; it needs one-time auth via `/design-login` — ask the user to run that if calls return an authorization error).
   - `get_project` with the UUID from the URL to confirm the name/type, then `list_files` for the full inventory.
   - Fetch every relevant text file with `get_file` and write it verbatim to `tmp/design-handoff/project/<same path>`. Fan the fetches out across parallel subagents (they can load DesignSync via ToolSearch too) so file contents stay out of the main context; have each agent report per-file byte counts and `truncated` flags.
   - Skip binaries you don't need: `uploads/`, `scraps/`, `.thumbnail`, PNG assets. Fetch `components/` and `templates/` only as reference material — they are never imported.

   **Option B — export/bundle URL**: download and extract:

```bash
mkdir -p tmp/design-handoff
curl -L --fail-with-body \
  -D tmp/design-handoff/headers.txt \
  -o tmp/design-handoff/handoff.bin \
  "<claude-design-url>"
file tmp/design-handoff/handoff.bin
cp tmp/design-handoff/handoff.bin tmp/design-handoff/handoff.tar.gz
mkdir -p tmp/design-handoff/extracted
tar -xzf tmp/design-handoff/handoff.tar.gz -C tmp/design-handoff/extracted
```

   - If the URL returns HTML or an error document instead of a bundle, keep the body and headers as evidence and report the blocker.

3. Read intent before diffing.
   - Read the project/bundle `README.md` and `AUDIT.md` first.
   - Read the dated handoff note under `handoffs/handoff-YYYY-MM.md` — since mid-2026 this is the canonical per-round change log and maps to what must be ported.
   - Read all `chats/*.md` enough to understand where the user and Claude Design landed.
   - Read handoff/change-log files such as `handoff-codex.md`, `FEEDBACK-RESPONSE.md`, and uploaded feedback notes if present.
   - Read the `open_file` target from the URL or bundle, usually `project/system/design-system.html`, then follow its local imports.

4. Compare against the repo shape, not the prototype shape.
   - For the prototype-to-repo mapping, read `references/repo-pipeline.md`.
   - Project preview files carry a first-line `<!-- @dsCard … -->` marker that repo files never keep — ignore it when diffing, strip it when importing:

```bash
for f in $(cd tmp/design-handoff/project/system && find . -type f | sed 's|^\./||'); do
  repo="system/$f"; proj="tmp/design-handoff/project/system/$f"
  [ -f "$repo" ] || { echo "NEW: $f"; continue; }
  n=$(diff <(grep -v '^<!-- @dsCard' "$repo") <(grep -v '^<!-- @dsCard' "$proj") | grep -c '^[<>]')
  [ "$n" -gt 0 ] && echo "CHANGED($n): $f"
done
rg -n "tokens.json|tokens.base.css|tools/build-tokens|yellow-solid|button-primary-bg-hover|field-ring|panel-bg|data-contrast-contract|solid-foreground|F3C437|F3C435" system tokens scripts dist
```

   - **Expect regeneration regressions.** The design tool rewrites whole files, so fixes from previous rounds can silently reappear reversed (past examples: the `#F3C437` hover caption came back after being corrected; `role="img"` / `role="switch"` / calendar `aria-label`s were dropped from cards the repo had already fixed). Audit every changed hunk in both directions — the repo side is often ahead on a11y — and fact-check numeric caption claims (contrast ratios, hexes, ring sizes) against actual token values and demo CSS before porting them.
   - Do not import prototype-only process material such as `uploads/`, `scraps/`, screenshots, chat logs, or generated notes into public package outputs.

5. Implement scoped changes.
   - Patch only repo-owned files needed to satisfy the handoff and repo contract.
   - Keep raw filenames content-agnostic.
   - Use Phosphor-style inline SVG/icon classes in previews; avoid emoji or decorative dingbats as UI icons.
   - Keep yellow `#FDCE45` fixed as `hsl(44.7, 97.9%, 63.1%)`; primary hover is `hsl(45, 89%, 58%)` / `#F3C435`.
   - If editing tokens, edit source JSON under `tokens/` and run `pnpm tokens:build`; never hand-edit generated token artifacts. The project's single-file `tokens.json` graph translates into the repo's typed split (`$type` + `putio.mode` + `cssName` required) — port concepts, don't copy JSON.
   - If the type scale moves, `DESIGN.md` front-matter must move with it (`typography.ui.size` ↔ `fontSize.base`, `mono.size` ↔ `fontSize.sm`, `display.size` ↔ `fontSize.display`) — `verify-design-system.ts` string-compares them against built values.
   - `tv-shell.css` must stay `!important`-free — the check greps the whole file, so comments mentioning `!important` fail too.
   - New preview cards: strip the `@dsCard` marker, register embeds in `system/design-system.html`, and remember axe runs on every card in both modes (3:1 floor) unless `data-theme-lock` pins one mode.
   - If a Claude prototype value conflicts with `DESIGN.md`, `system/README.md`, or token checks, prefer the repo contract unless the user explicitly asks to change it.
   - Governance (decided 2026-07): this repo's `tokens/**/*.tokens.json` is the canonical authoring source; the design project is the design layer and mirrors the built values. Token changes in a handoff are proposals until they land here. If the project's docs re-assert authoring-layer status, correct them via feedback (see `uploads/putio-design-governance-2026-07.md` in the project).

6. Verify.
   - For investigation-only work, at least run targeted checks that prove the answer.
   - After implementation, run:

```bash
pnpm verify:full
```

   - This should cover type checks, token generation drift, design-system contract checks, HTML validation, static smoke, Playwright accessibility/render checks, and `npm pack --dry-run`.
   - If a check fails, fix the root cause or report the exact blocker. Do not call the work done while relevant verification is red.

7. Refresh the project's token mirror.
   - After a round lands (tokens built, checks green), run:

```bash
pnpm design:mirror
```

   - It reads the fetched project graph as a structural template (`tmp/design-handoff/project/system/tokens.json`) and `dist/tokens.flat.json` for values, and writes `tmp/design-mirror/{tokens.json,tokens.css,tokens.base.css}` in the project's annotated flavor (hex comments, `@kind` hints). Refs that no longer resolve to repo values are replaced with repo literals and warned — carry those warnings into the feedback note.
   - Push the three files to the project's `system/` with DesignSync (`finalize_plan` → `write_files` with `localPath`). `CLAUDE.md` is write-protected; token mirror files are not.

8. Write Claude Design feedback.
   - Save it to `tmp/design-handoff/feedback-to-design-tool.md` unless the user asks for another path, written as a copyable note for Claude Design, not a repo changelog.
   - Follow `references/feedback-template.md` for the sections, tone, and worked example.
