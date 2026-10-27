---
name: republish-design-artifact
description: Republish the `put.io design` claude.ai design system artifact from this repo. Use after a merge that changes tokens, `system/**`, `artifact/**`, or the artifact scripts, or when adding a `system/assets/` file to the artifact.
---

# Republish the design artifact

Needs a Claude session with edit access to the artifact. Find it with the
Artifact tool (`list`). Never edit it on its page; the next publish overwrites
the edit.

## Republish

1. Run `pnpm artifact`.
2. Read the artifact's `project/design-system.json`.
3. Publish the paths in `artifact/out/core/files.json` with `root`
   `artifact/out/core`.
4. Last, send the index only if its title or asset records changed, merged
   into the copy read in step 2.
5. Check that the changed cards render on its page. The artifact cannot load
   `static.put.io`, so it renders in Inter and JetBrains Mono.

## New asset

A new `system/assets/` file needs:

- an upload;
- its `/_blob/` URL in `artifact/notes.json`;
- a record in the design system's `assetGroups`.
