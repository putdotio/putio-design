# put.io Design System — Progress

## Final Status: 94 HTML files, 74+ Figma frames, 4 variants, 9 platforms

Figma: https://www.figma.com/design/fSGN6KSI5USS2GdTRBha4L/design-system

## Design Variants

1. **Clean Modern** — Inter. Linear/Vercel inspired. Production-ready polish.
2. **Monospace/Terminal** — JetBrains Mono. Vim status bar, command palette, ASCII progress. For the Pipeline Builder.
3. **Brutalist** — Inter Black 900 + JetBrains Mono. Mission control aesthetic. Oxide meets arcade.
4. **Editorial** — DM Serif Display + Inter. "Your Library." Candlelight yellow. Private cinema. Made with love.

## Web Screens (dark + light)

| Screen | Clean | Mono | Brutalist | Editorial |
|--------|-------|------|-----------|-----------|
| Files | v1 + light | v1 + light | v1 + v2 + light | v1 + v2 + light |
| Transfers | v1 | v1 | v1 + v2 | v1 + v2 |
| Player | v1 | v1 | v1 + v2 | v1 + v2 |
| Storage | v1 | v1 | v1 | v1 + v2 |
| RSS | v1 | v1 | v1 | v1 |
| History | v1 | v1 | v1 | v1 |
| Sharing | v1 | v1 | v1 | v1 |
| Onboarding | v1 | — | — | v1 |
| Pricing | v1 | — | v1 | — |

## iOS

| Screen | Clean | Mono | Brutalist | Editorial |
|--------|-------|------|-----------|-----------|
| Files | v1 + light | v1 | v1 | v1 |
| Transfers | v1 | v1 | v1 | v1 |
| Player | v1 | v1 | — | v1 |
| Downloads | v1 |
| Widgets | v1 |

## Android (Material 3)

| Screen | Clean | Mono | Brutalist | Editorial |
|--------|-------|------|-----------|-----------|
| Files | v1 | v1 | v1 | v1 |
| Transfers | v1 | v1 | v1 | v1 |

## TV (list-based file browsing)

| Platform | Screens |
|----------|---------|
| tvOS | Home v2, Files v2, Player, Search, Transfers, Settings |
| Android TV | Home, Player, Files |
| Roku | Files (720p, extreme simplicity) |

## Other Platforms

| Platform | Screens |
|----------|---------|
| watchOS | Complications + Notifications (4 faces) |
| visionOS | Immersive spatial player (starfield theater) |
| CLI | Terminal mockup with command examples |

## Marketing Pages

| Page | Clean | Mono | Brutalist | Editorial |
|------|-------|------|-----------|-----------|
| Landing | v1 | v1 | v1 | v1 |
| About | — | — | v1 | v1 |

## Key Design Decisions

- **All icons SVG** (Phosphor-style), no emoji
- **TV apps are file browsers** — list views, not media cards. No metadata/posters to depend on
- **Yellow #FDCE45 sacred** throughout every platform
- **Brand signatures**: kaomoji ᕦ(ò_óˇ)ᕤ, space invader avatars, put.io voice in microcopy
- **Icon disambiguation**: cloud+upload / device+arrow / play triangle — three distinct metaphors
- **Filename parsing**: "The.Wire.S03E04.1080p.BluRay.x264-DEMAND.mkv" → "The Wire · S03E04" + badges
- **Transfer health**: green/yellow/red dots replace torrent jargon
- **Storage dashboard**: invented new screen — file type donut, insights, largest files, never-opened
- **Pricing restructured**: 4 persona-based tiers (Trial/Casual/Plus/Power), no jargon

## v2 Iterations (second-pass with more craft)

### Brutalist v2
- Top rail replaces sidebar — file list gets full width
- "Your" (light) / "Files" (black yellow glow) typographic tension
- Spotlight search as command palette with glow border
- Mission Control transfers with pulse visualizations on health dots
- Per-transfer speed as hero metric
- Failed transfers visually urgent with red glow rings

### Editorial v2
- "Your Library" framing — folders have personality subtitles
- Transfer ticker: "Inception is almost ready — 63%, about 23 minutes to go"
- Player as private cinema — film title card overlay, programme/playbill right panel
- Helen Stead quote as pullquote: "put.io does everything I need, and it's mine"
- Failed transfers empathetic: "We couldn't find sources. It happens sometimes."
- Storage as "Your Digital Attic" — warm colors, conversational insights
- Footer quotes the 10th birthday email: "Can you frakking believe this?"
