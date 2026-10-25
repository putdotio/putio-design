---
version: "0.1.0"
name: "put.io on web"
description: "Binding contract for www.put.io, app.put.io and auth.put.io. Tier 1: the full design system."
tier: 1
platforms: ["www.put.io", "app.put.io", "auth.put.io"]
source: "putio-web apps/app + apps/auth + system/components.css"
reviewed:
  date: "2026-10-21"
  against: "putdotio/putio-web@1e23ebdb7 (apps/app, apps/auth)"
  cards:
    [
      "web-c00-buttons",
      "web-c01-inputs",
      "web-c02-form-fields",
      "web-c02b-field-validation",
      "web-c03-segmented",
      "web-c04-slider",
      "web-c05-tabs",
      "web-c06-badges",
      "web-c07-avatar",
      "web-c08-tooltip",
      "web-c09-menu",
      "web-c10-context-menu",
      "web-c11-modal",
      "web-c12-sheet",
      "web-c13-alert",
      "web-c14-notification",
      "web-c15-list-item",
      "web-c16-file-row",
      "web-c17-table",
      "web-c18-pagination",
      "web-c19-breadcrumbs",
      "web-c20-storage-bar",
      "web-c21-skeleton",
      "web-p00-form-layouts",
      "web-p00b-form-flows",
      "web-p00c-auth-signin",
      "web-p00d-auth-signup",
      "web-p00e-auth-2fa",
      "web-p01-folder-picker",
      "web-p02-dropzone",
      "web-p03-command-palette",
      "web-p04-transfer-states",
      "web-p05-task-progress",
      "web-p06-player",
      "web-s00-shell",
      "web-s01-transfers",
      "web-s02-history",
      "web-s03-rss",
      "web-s04-public-share",
      "web-s05-settings",
      "web-s06-auth",
    ]
mode: "follows the system; light and dark"
---

# put.io on web

## Binding

Tier 1: the full design system applies, including the component library, the
`components.css` recipes and dedicated styles. Tier definitions live in
[Binding Tiers](../../DESIGN.md#binding-tiers).

**This is the one tier where the web recipes are the contract.** Every other
tier inherits the token values and builds components from its own platform.

## Shipped state

| App         | Stack                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| auth.put.io | consumes `@putdotio/design` CSS and components under Tailwind and shadcn; Phosphor icons               |
| app.put.io  | predates the system: theme-ui, emotion, LESS, `@putdotio/colors`, flaticon font icons, GT America Mono |

app.put.io draws radius 4, weights 400/500/600, and a 1.5px `border-hover`
focus ring. Its cards draw the system recipe, and a card note says where the
app differs.

app.put.io also serves sign-up, the public share and its own sign-in, OTP and
reset pages.

The file list shows names with dots as spaces, cut at 120 characters.
Breadcrumbs, titles and dialogs show the raw name.

Cards marked Proposed draw what no shipped app has: the context menu, the
sheet and the command palette. A `proposed` tag marks such a part on a
shipped card.

## Surfaces

| Surface | Rules                                                                                     |
| ------- | ----------------------------------------------------------------------------------------- |
| App     | keeps its own root, 14px and 15px from 1280; header 60px; sidebar 240px or 180px          |
| Landing | either mode, 16px body, more air; not reviewed against `apps/www`                         |
| Auth    | follows the system; card-less 340px column on the page background, standard 36px controls |

## Values

The root [DESIGN.md](../../DESIGN.md) owns every web value and rule.

## Don't

- Invent a z-index, a yellow, or a radius outside the scale.
- Ship a transparent bordered button; a bordered button fills, as the secondary tier.
- Use a text glyph as a symbol; use a Phosphor icon.
- Put more than one primary in an action group.
- Apply these recipes to any other tier.
