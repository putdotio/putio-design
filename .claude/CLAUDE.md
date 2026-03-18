# put.io Design System

## Quick start

```bash
cd prototypes && python3 -m http.server 8765
# Browse at http://localhost:8765
```

## Repo structure

```
prototypes/     149 self-contained HTML design screens + gallery index
docs/
  design.md     Master design document (1170 lines — read this first)
  decisions.md  Design decisions with reasoning
  progress.md   Progress tracker
  plans/        Execution plans
  assets/       Screenshots of current app
```

## Key rules

- **Read `docs/design.md` before designing.** It has personas, user research, and product context.
- **Read `docs/decisions.md`** for constraints and past decisions.
- **No emoji as icons.** Use inline SVG (Phosphor-style).
- **Yellow #FDCE45 is sacred.** The brand color. Never change it.
- **TV apps are file browsers.** List views, not media card grids. put.io has no metadata.
- **Chill Institute is out of scope.** Separate product.
- **Never stop to ask.** Loop autonomously when iterating.
- **Check `docs/assets/` screenshots** before designing platform screens.

## Skills

- `/iterate-design` — generate new prototypes from references or briefs. Handles the full workflow: inspect reference → map to put.io → build HTML → update index → commit.

## Naming convention

```
{platform}-{screen}-{variant}-{iteration}.html
```

| Variant | Stack |
|---------|-------|
| v2-clean | Inter |
| v2-mono | JetBrains Mono |
| v3-brutalist | Inter Black + JetBrains Mono |
| v4-editorial | DM Serif Display + Inter |
| native / m3-v3 | Platform default |

## Viewports

Web 1440x900 · iOS 390x844 · Android 412x915 · iPad 1024x768 · tvOS 1920x1080 · Android TV 1920x1080 · Roku 1280x720
