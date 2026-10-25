<div align="center">
  <p>
    <img src="https://static.put.io/images/putio-boncuk.png" width="72">
  </p>

  <h1>put.io design</h1>

  <p>Public design tokens, brand assets, and design-system guidance for <a href="https://put.io">put.io</a>.</p>

  <p>
    <a href="https://www.npmjs.com/package/@putdotio/design" style="text-decoration:none;"><img src="https://img.shields.io/npm/v/%40putdotio%2Fdesign?style=flat&label=npm&logo=npm&colorA=000000&colorB=000000" alt="npm version"></a>
  </p>
</div>

<br />

## View

Live guide: [design.put.io](https://design.put.io)

## Install

```bash
npm install @putdotio/design
```

## Use

Import the generated tokens first. Tier-1 web surfaces also import the
component recipes:

```css
@import "@putdotio/design/css";
@import "@putdotio/design/components";
```

Component recipes consume semantic aliases such as `--field-*`, `--panel-*`,
`--primary`, `--success`, and `--destructive`, not palette tokens.

Tailwind v4 apps add the theme after Tailwind and the tokens. `layer(base)`
keeps the token file's element styles below utilities:

```css
@import "tailwindcss";
@import "@putdotio/design/css" layer(base);
@import "@putdotio/design/tailwind";
```

Utilities then read the tokens: `bg-bg` is `var(--bg)`, `rounded-sm` is
`var(--radius-sm)`, `text-lg` is `var(--fs-lg)`. The full mapping:
[Tailwind v4 theme](system/README.md#tailwind-v4-theme).

Package entrypoints, from `exports` in [package.json](package.json):

| Subpath                          | File                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `@putdotio/design/css`           | [`dist/css/tokens.css`](dist/css/tokens.css)                                        |
| `@putdotio/design/components`    | [`system/components.css`](system/components.css)                                    |
| `@putdotio/design/tailwind`      | [`dist/css/tailwind.css`](dist/css/tailwind.css)                                    |
| `@putdotio/design/tokens`        | [`dist/tokens.flat.json`](dist/tokens.flat.json)                                    |
| `@putdotio/design/tokens/meta`   | [`dist/tokens.js`](dist/tokens.js), typed by [`dist/tokens.d.ts`](dist/tokens.d.ts) |
| `@putdotio/design/tokens/dtcg`   | [`dist/tokens.dtcg.json`](dist/tokens.dtcg.json)                                    |
| `@putdotio/design/tokens/figma`  | [`dist/figma/putio.tokens.json`](dist/figma/putio.tokens.json)                      |
| `@putdotio/design/assets/<file>` | [`system/assets`](system/assets)                                                    |
| `@putdotio/design/design.md`     | [`DESIGN.md`](DESIGN.md)                                                            |

## Docs

- [Design contract](DESIGN.md)
- [Design guide](system/README.md)
- [Contributing](CONTRIBUTING.md)
- [Security](https://github.com/putdotio/.github/blob/main/SECURITY.md)
- [Agent guide](AGENTS.md)

## License

[MIT](LICENSE)
