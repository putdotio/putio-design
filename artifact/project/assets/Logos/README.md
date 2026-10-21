# Logos

- `logo.svg`: the put.io wordmark.
- `logo-retro-dark.svg`, `logo-retro-light.svg`: the retro mark for dark and light grounds.
- `favicon.svg`: the browser favicon.

Wordmarks are optically pre-centred: each viewBox carries its own top padding (retro pair `0 -16 376 112`, `logo.svg` `0 -24.44 621.79 176.055`). Flex-centre them as they are; never nudge with `translateY`. In product, load them from `@putdotio/design/assets/*`.
