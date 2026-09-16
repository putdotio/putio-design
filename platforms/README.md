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

Tier definitions: [DESIGN.md Binding Tiers](../DESIGN.md#binding-tiers).

## Staying current

Each file carries a `reviewed` block naming the date, the sources it was checked
against, and the cards it describes. These are hand-written, so that block is
the only drift signal. Update it in the same change as the content.

If two go stale, generate them from the cards' tier strips instead.
