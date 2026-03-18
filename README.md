# put.io design exploration

Design exploration for [put.io](https://put.io) — a cloud storage and transfer service across every platform.

133 self-contained HTML prototypes, 4 design variants, 9 platforms, 3 iterations deep.

## Browse

```
cd prototypes && python3 -m http.server 8765
# → http://localhost:8765
```

Or visit the deployed gallery on Vercel.

## Structure

```
prototypes/          133 HTML design screens + gallery index
docs/
  design.md          Master design document (personas, research, principles)
  progress.md        Progress tracker
  plans/             Execution plans
  assets/            Screenshots of current app (the "before")
```

## Design Variants

| Variant | Font | Vibe |
|---------|------|------|
| Clean Modern | Inter | Linear, Raycast, Notion |
| Monospace | JetBrains Mono | Terminal, vim, dev tool |
| Brutalist | Inter Black + JetBrains Mono | Oxide Computer, mission control |
| Editorial | DM Serif Display + Inter | Letterboxd, Are.na, warmth |

## Platforms

Web · iOS · Android · tvOS · Android TV · Roku · watchOS · visionOS · CLI

## Naming

```
{platform}-{screen}-{variant}-{iteration}.html
```

`-v3` suffix = latest iteration. Start there

## Context

Start with [`docs/design.md`](docs/design.md) — 1170 lines of product context, user research (61 interviews), personas, and design needs.
