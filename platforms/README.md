# platforms

Per-platform binding contracts. Each `DESIGN.md` here follows the shape of the
root [DESIGN.md](../DESIGN.md): YAML frontmatter carrying the machine-readable
contract, prose below it.

Tier definitions: [DESIGN.md Binding Tiers](../DESIGN.md#binding-tiers).

A contract that moves to its app repository leaves a pointer with no
frontmatter here, as [android](android/DESIGN.md) points to
[putio-android](https://github.com/putdotio/putio-android/blob/main/DESIGN.md).
Its `reviewed` block moves with it.

## Staying current

Each contract's `reviewed` block records the review date, the sources it was
checked against, and the cards it describes. It is the only drift signal: a
card or source that changed after `reviewed.date` needs a fresh review.
