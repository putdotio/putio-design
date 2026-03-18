# Iterate Design

Generate new put.io design prototypes from screenshot references or design briefs.

## Use when

- User shares a screenshot or URL for design inspiration
- User asks to iterate on an existing prototype
- User wants a new screen or variant explored
- User says "make this", "iterate on this", "try this style"

## Workflow

1. **Gather context** — read `docs/design.md` (sections 1-6 minimum), `docs/decisions.md`, and inspect `docs/assets/` screenshots of the current app. Understand put.io's product, personas, and voice before designing.

2. **Inspect reference** — if the user provides a screenshot or URL, analyze it thoroughly. Extract: color palette, typography choices, spacing system, component patterns, layout approach, what makes it distinctive.

3. **Map to put.io** — decide which screen(s) to design and how the reference style applies to put.io's needs. Consider:
   - Which persona does this serve? (Pipeline Builder / Casual Streamer / Archivist)
   - Which platform? (web 1440x900, iOS 390x844, Android 412x915, tvOS 1920x1080, etc.)
   - Does this complement or replace an existing variant?

4. **Build the prototype** — create self-contained HTML files in `prototypes/`. Every file must:
   - Use inline CSS and inline SVG icons (no emoji, no external assets except Google Fonts)
   - Include `<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>`
   - Keep `#FDCE45` as the brand yellow — it's sacred
   - Follow platform conventions (HIG for iOS, Material 3 for Android, Leanback for TV)
   - Have put.io personality — kaomoji, space invader avatars, warm copy
   - TV apps must be list-based file browsers (no media card grids — put.io has no metadata)

5. **Name correctly** — follow `{platform}-{screen}-{variant}-{iteration}.html`
   - New variant? Pick a short name: e.g. `v5-geometric`, `v6-retro`
   - Iteration on existing? Append: e.g. `web-files-v2-clean-v4.html`

6. **Update index** — regenerate the file list in `prototypes/index.html`:
   ```bash
   cd /path/to/putio-design
   FILELIST=$(ls prototypes/*.html | grep -v index.html | sed 's|prototypes/||' | sort | python3 -c "import sys,json;print(json.dumps([l.strip() for l in sys.stdin]))")
   python3 -c "
   import re
   with open('prototypes/index.html','r') as f: c=f.read()
   c=re.sub(r'const files = \[.*?\];','const files = $FILELIST;',c,flags=re.DOTALL)
   with open('prototypes/index.html','w') as f: f.write(c)
   "
   ```

7. **Commit and push**:
   ```bash
   git add prototypes/ && git commit -m "add: {description}" && git push origin main
   ```

## Rules

- **Never use emoji as icons.** Always inline SVG.
- **Never stop to ask.** Loop autonomously: build → review → fix → next.
- **TV apps are file browsers.** List views with folder/file hierarchy. No card grids.
- **Chill Institute is out of scope.** It's a separate product.
- **Yellow #FDCE45 is sacred.** Everything else can change.
- **Check existing screenshots** in `docs/assets/` before designing platform screens.
- **Multiple variants per request.** When asked to iterate, produce 3-5 variations minimum.
- **Use subagents** for parallel work when building multiple screens.

## Existing variants

| Code | Name | Stack | Reference |
|------|------|-------|-----------|
| v2-clean | Clean Modern | Inter | Linear, Raycast, Notion |
| v2-mono | Monospace | JetBrains Mono | Terminal, iA Writer |
| v3-brutalist | Brutalist | Inter Black + JetBrains Mono | Oxide Computer |
| v4-editorial | Editorial | DM Serif Display + Inter | Letterboxd, Are.na |
| native / m3-v3 | Platform Native | Platform default | Apple HIG, Material 3 |

## File dimensions

| Platform | Viewport |
|----------|----------|
| Web | 1440x900 |
| iOS | 390x844 |
| Android | 412x915 |
| iPad | 1024x768 |
| tvOS | 1920x1080 |
| Android TV | 1920x1080 |
| Roku | 1280x720 |
| watchOS | 198x242 per face |
| visionOS | 1440x900 |
| Browser Extension | 400x600 |
| CLI | 1200x800 |
