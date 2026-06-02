---
name: putio-design-handoff
description: Import, inspect, implement, verify, and respond to design handoffs for this put.io design-system repo, especially Claude Design export URLs and prototype bundles. Use when the user provides a design handoff URL, asks to pull or inspect Claude Design output, asks whether design/tokens are ready, asks to port prototype changes into putio-design, or asks to write feedback back to the design tool about discrepancies, failed checks, missing assets, token drift, accessibility issues, or implementation notes.
---

# put.io Design Handoff

## Workflow

1. Start from the repo contract.
   - Read `AGENTS.md`, `DESIGN.md`, `system/README.md`, `docs/DISTRIBUTION.md`, and the relevant files under `tokens/`, `system/`, `scripts/`, and `tests/`.
   - Treat `tokens/**/*.tokens.json` as canonical for this repo. `dist/*` and `system/tokens.css` are generated outputs.
   - Preserve public/private boundaries: do not copy private research, local paths, auth-gated URLs, team screenshots, account data, or internal workflow details into checked-in files.

2. Save the Claude Design artifact under `tmp/`.
   - Use a stable local name, for example:

```bash
mkdir -p tmp/design-handoff
curl -L --fail-with-body \
  -D tmp/design-handoff/headers.txt \
  -o tmp/design-handoff/handoff.bin \
  "<claude-design-url>"
file tmp/design-handoff/handoff.bin
```

   - If it is a `tar.gz` bundle, copy or rename it with a `.tar.gz` suffix and extract it:

```bash
cp tmp/design-handoff/handoff.bin tmp/design-handoff/handoff.tar.gz
mkdir -p tmp/design-handoff/extracted
tar -xzf tmp/design-handoff/handoff.tar.gz -C tmp/design-handoff/extracted
```

   - If the URL returns HTML or an error document instead of a bundle, keep the body and headers as evidence and report the blocker.

3. Read intent before diffing.
   - Read the bundle `README.md` first.
   - Read all `chats/*.md` enough to understand where the user and Claude Design landed.
   - Read handoff/change-log files such as `handoff-codex.md`, `FEEDBACK-RESPONSE.md`, and uploaded feedback notes if present.
   - Read the `open_file` target from the URL or bundle, usually `project/system/design-system.html`, then follow its local imports.

4. Compare against the repo shape, not the prototype shape.
   - For the prototype-to-repo mapping, read `references/repo-pipeline.md`.
   - Useful commands:

```bash
diff -qr system tmp/design-handoff/extracted/*/project/system
rg -n "tokens.json|tokens.base.css|tools/build-tokens.mjs|yellow-solid|button-primary-bg-hover|field-ring|panel-bg|data-contrast-contract|ph-folder-fill|ph-screencast|F3C437|F3C435" system tokens scripts dist
```

   - Do not import prototype-only process material such as `uploads/`, `scraps/`, screenshots, chat logs, or generated notes into public package outputs.

5. Implement scoped changes.
   - Patch only repo-owned files needed to satisfy the handoff and repo contract.
   - Keep raw filenames content-agnostic.
   - Use Phosphor-style inline SVG/icon classes in previews; avoid emoji or decorative dingbats as UI icons.
   - Keep yellow `#FDCE45` fixed as `hsl(44.7, 97.9%, 63.1%)`; primary hover is `hsl(45, 89%, 58%)` / `#F3C435`.
   - If editing tokens, edit source JSON under `tokens/` and run `pnpm tokens:build`; never hand-edit generated token artifacts.
   - If a Claude prototype value conflicts with `DESIGN.md`, `system/README.md`, or token checks, prefer the repo contract unless the user explicitly asks to change it.

6. Verify.
   - For investigation-only work, at least run targeted checks that prove the answer.
   - After implementation, run:

```bash
pnpm verify:full
```

   - This should cover type checks, token generation drift, design-system contract checks, HTML validation, static smoke, Playwright accessibility/render checks, and `npm pack --dry-run`.
   - If a check fails, fix the root cause or report the exact blocker. Do not call the work done while relevant verification is red.

7. Write Claude Design feedback.
   - Save feedback under `tmp/design-handoff/feedback-to-design-tool.md` unless the user asks for another path.
   - Write it as a copyable note for Claude Design, not as a repo changelog.
   - Use `references/feedback-template.md` for the feedback shape.
   - Include:
     - What was accepted and implemented.
     - Discrepancies between prototype claims and repo-verified truth.
     - Failed checks or stale captions/values, with the exact expected value.
     - Prototype artifacts intentionally not imported.
     - Repo-specific pipeline differences Claude Design should honor next time.
     - Verification evidence, summarized without leaking local machine paths.

Keep feedback factual and actionable. Prefer examples like "`--yellow-solid-hover` renders as `#F3C435`; one caption said `#F3C437`" over broad criticism.
