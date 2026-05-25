# put.io design skill

Quick reference for anyone (human or agent) designing a put.io surface.

## 30-second version

- Import `system/tokens.css` in every file.
- Yellow `#FDCE45` is sacred. Use `var(--yellow-solid)`.
- Icons: Lucide-style inline SVG for forward-looking guidance. No emoji.
- Raw filenames only — never parse `Movie.2020.1080p.mkv` into "Movie".
- Dark mode is the default for app surfaces; light is default for landing.

## When you start a design

1. **Pick surface:** app (dark, dense, 14px body, yellow folders) · landing (either mode, 16px body, more air) · TV (1920×1080, 22px min body, 5% safe zone, yellow focus ring)
2. **Open `system/design-system.html`** — tokens + preview cards + platform guidance
3. **Use legacy prototypes only as references**; move durable decisions back into tokens, preview cards, or workspace specs
4. **Use tokens**, never hex values (except `#FDCE45` where you want it explicit)

## Viewports

Web 1440×900 · iOS 390×844 · Android 412×915 · tvOS 1920×1080 · Android TV 1920×1080

## Prototype naming

```
{platform}-{screen}-{variant}.html
```

e.g. `ios-files-v15-linear-neutral-native.html`

## Do not

- Add metadata pills (4K, 1080p, codec) — it's already in the filename
- Invent posters or thumbnails — we don't have them
- Use emoji
- Change `#FDCE45`
- Parse or clean up filenames
