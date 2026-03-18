# Design Decisions

Decisions made during the design exploration, with reasoning.

## Icons

**Use inline SVG icons only — no emoji.** Phosphor-style, outlined + filled variants.

Why: Emoji as icon placeholders look amateur and render differently across platforms. SVGs give full control over size, color, and stroke weight. Phosphor covers put.io's needs (cloud ops, media, files) and has a warmer personality than Lucide.

## TV Apps

**TV screens use list-based file browsing, not media card grids.**

Why: put.io is content-agnostic — no posters, no metadata, no album art. The current TV app is a list of folders and files with yellow folder icons, and that's correct. Typography and spacing carry the experience, not imagery. Always check existing screenshots before designing platform screens.

## Scope

**Chill Institute is out of scope.** It's a separate product with its own design concerns. Focus only on put.io's own surfaces: web app, native apps, landing, about, browser extension.

## Design Variants

Four directions explored to find put.io's voice:

| Variant | Type stack | Reference | Persona fit |
|---------|-----------|-----------|-------------|
| Clean Modern | Inter | Linear, Raycast, Notion | Production-ready default |
| Monospace | JetBrains Mono | Terminal, iA Writer | Pipeline Builder |
| Brutalist | Inter Black + JetBrains Mono | Oxide Computer | Bold statement |
| Editorial | DM Serif Display + Inter | Letterboxd, Are.na | Warmth, soul |

## Brand

- **Yellow #FDCE45 is sacred** — the one constant across all variants and platforms
- **Kaomoji preserved** — ᕦ(ò_óˇ)ᕤ in empty states and footers
- **Space invader avatars** — pixel-art SVG, brand signature
- **put.io voice** — nerdy, warm, self-aware. Not corporate. Not sterile.

## Key UX Decisions

- **Icon disambiguation**: cloud+upload = save to put.io, device+arrow = download to device, play triangle = stream. Three visually distinct metaphors.
- **Transfer health indicators**: green/yellow/red dots replace torrent jargon
- **Filename parsing**: raw torrent names → clean title + quality/source badges
- **Collapsible sidebar**: YouTube-style, per user research. v3 uses 56px icon strip.
- **Storage dashboard**: invented new screen addressing Archivist persona
- **Pricing restructured**: 4 persona-based tiers, jargon removed
