---
name: iterating-design
description: Generates put.io design prototypes as self-contained HTML files from screenshot references, URLs, or design briefs. Use when the user shares a screenshot for inspiration, asks to iterate on an existing prototype, wants a new design variant explored, or says "iterate on this" or "try this style".
---

# Iterating Design

Generate put.io design prototypes from references or briefs.

## Workflow

1. **Read context** — `docs/design.md` (sections 1-6), `docs/decisions.md`
2. **Inspect reference** — analyze screenshots/URLs for palette, type, spacing, what's distinctive
3. **Build prototypes** in `prototypes/` — self-contained HTML, inline CSS, inline SVG icons
4. **Update index** — run the update script below
5. **Commit and push**

## Prototype rules

- Inline SVG icons only — no emoji
- `#FDCE45` yellow is sacred
- TV apps are list-based file browsers — no media card grids
- Ecosystem apps are out of scope
- Produce 3-5 variations per request
- Use subagents for parallel work

## Naming

`{platform}-{screen}-{variant}.html`

New variants use next number: `v5-geometric`, `v6-retro`, `v7-ink`

## Viewports

| Platform | Size |
|----------|------|
| Web | 1440x900 |
| iOS | 390x844 |
| Android | 412x915 |
| iPad | 1024x768 |
| tvOS / Android TV | 1920x1080 |
| Roku | 1280x720 |

## Existing variants

See [decisions.md](../../docs/decisions.md) for design rationale.

| Code | Stack | Reference |
|------|-------|-----------|
| v2-clean | Inter | Linear, Raycast |
| v2-mono | JetBrains Mono | Terminal, iA Writer |
| v3-brutalist | Inter Black + JetBrains Mono | Oxide Computer |
| v4-editorial | DM Serif Display + Inter | Letterboxd |
| native / m3-v3 | Platform default | Apple HIG, Material 3 |

## Update index script

```bash
FILELIST=$(ls prototypes/*.html | grep -v index.html | sed 's|prototypes/||' | sort | python3 -c "import sys,json;print(json.dumps([l.strip() for l in sys.stdin]))")
python3 -c "
import re
with open('prototypes/index.html','r') as f: c=f.read()
c=re.sub(r'const files = \[.*?\];','const files = $FILELIST;',c,flags=re.DOTALL)
with open('prototypes/index.html','w') as f: f.write(c)
"
```
