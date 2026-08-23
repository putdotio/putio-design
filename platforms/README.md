# platforms

Per-platform binding contracts. One `DESIGN.md` each, in the shape of
[putio-design DESIGN.md](https://github.com/putdotio/putio-design/blob/main/DESIGN.md):
YAML frontmatter carrying the machine-readable contract, prose below it.

These are the authoring drafts. Per [ADR 0009](https://github.com/putdotio/putio-frontend/blob/main/docs/decisions/0009-design-binding-tiers.md)
each platform repo owns the copy that ships in it.

| File | Tier | Binds |
| --- | --- | --- |
| [web](web/DESIGN.md) | 1 | www.put.io, app.put.io, auth.put.io |
| [apple](apple/DESIGN.md) | 2 | iOS, iPadOS, watchOS, tvOS |
| [android](android/DESIGN.md) | 2 | Android, Android TV |
| [roku](roku/DESIGN.md) | 3 | Roku channel |
| [tv-generic](tv-generic/DESIGN.md) | 4 | tv.put.io, Tizen, webOS |

## Tiers

1. **Web.** The full design system. The `components.css` recipes are the contract here and only here.
2. **Native apps.** Tokens only. Every component comes from the platform's human interface guidelines.
3. **Roku.** Tier-2 token inheritance plus room for put.io conventions in custom SceneGraph components.
4. **Web TV.** The design system as on web, restrained to a list-first 10-foot interface.

## Staying current

Each file carries a `reviewed` block naming the date, the sources it was checked
against, and the cards it describes. These are hand-written, so that block is
the only drift signal. Update it in the same change as the content.

If two go stale, generate them from the cards' tier strips instead.
