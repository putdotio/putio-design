---
title: "put.io — Design System"
created: 2026-03-18
updated: 2026-03-19
---

# put.io — Design System

Current state of put.io's visual system: what exists, what works, what doesn't.

**Related docs:**
- [Design Brief](design-brief.md) — why we're redesigning, personas, principles
- [TV App Spec → Shared Contracts](specs/tv-app.md#shared-contracts) — design tokens, i18n, SDK types for the rewrite
- [Platform Strategy](platform-strategy.md) — architecture decisions

**Brand constants:**
- Yellow: `#FDCE45` (sacred, never changes)
- Font: GT America (Standard + Mono)
- Color system: Radix UI semantic scale

---

## Current UI Audit (from screenshots, March 2026)

### Landing Page (put.io)
- Dark background (#1a1a1a-ish), white/gold text
- Hero: large stylized "PUT.IO" logo with sparkle/constellation animation
- Tagline: "The cloud storage service with a certain gravity"
- Gold/yellow CTA button: "GO TO APP"
- Product Hunt badge (#1 Product of the Day)
- "What we are / What we are not" section — good copywriting, clear positioning
- "Sneak Peek" section: 3 product screenshots (light mode web, dark mode web, tvOS)
- "Apps & Integrations" grid: 15 platforms (Apple TV, iOS, Roku, Samsung, LG, Fire TV, Android, Chromecast, Kodi, IFTTT, FTP/WebDAV, Browser Extensions, Gaming Consoles, Make Your Own)
- Footer: standard links + "Hero Animation" and "X (Twitter)" links
- Kaomoji in header nav: ᕦ(ò_óˇ)ᕤ — personality touch
- **Assessment:** Solid for what it is. The dark theme with gold accents has personality. Copy is strong. Layout is standard but not generic. The platform grid is impressive but visually noisy.

### Plans & Pricing (put.io/plans)
- Same dark theme as landing
- $0.99/1-day trial at top
- Two plans: 100GB ($9.99/mo) and 1TB ($19.99/mo)
- Monthly/Annually toggle (17% savings)
- White cards on dark background
- Gold "Choose" buttons
- Feature comparison: storage, downloads, seeding ratio, active transfers, family invites
- "No friction money-back guarantee during your first week"
- **Assessment:** Clean but only two plans. The gap from 100GB to 1TB with nothing in between validates Tobias's complaint. No 10TB plan visible here (exists but not shown?). The "seeding ratio" language is torrent jargon that casual users won't understand.

### Web App — Files
- Dark mode (appears to be default)
- Left sidebar: Files, Transfers, RSS Automation, Sharing, History, Trash, Extensions
- Storage bar at bottom of sidebar: "11 TB of 50 TB free" with green progress bar
- Username "altay" at bottom with robot icon
- Yellow folder icons — distinctive, recognizable
- File list: name, size, last modified — simple table layout
- Top bar: search (with / shortcut hint), "+ NEW TRANSFER" gold button
- "Select all" checkbox, Actions dropdown, Sort dropdown
- **Assessment:** This is the "shadcn/Radix" feel the brief mentioned. Functional, clean, zero personality. The yellow folders are the most distinctive element. Sidebar has 7 items — users said half are unused. Search dominates the top bar but is rarely used (per internal data).

### Web App — Transfers
- Same layout, transfer list view
- Green completion dots
- File names include torrent metadata (resolution, source, codec) — messy but informative
- "Seeded: X MB of Y MB | seed time: Z | ratio: N" — pure torrent jargon
- "GO TO FILE" gold buttons on completed transfers
- "CLEAR COMPLETED" button
- **Assessment:** This page is for power users only. The metadata is useful but overwhelming for casual users. No visual distinction between qualities, no health indicators.

### Web App — RSS Automation
- Empty state: RSS icon, "No watched RSS feeds whatsoever"
- Helpful text: "If you don't know where to start, just google 'RSS torrents'. You'll see the light."
- "ADD A NEW RSS FEED" button
- **Assessment:** Great empty state copy (personality!) but this validates the discovery crisis — it's a top-level nav item that most users never touch. The instruction to "just google" is charming but also an admission that the feature is poorly discoverable.

### Web App — Sharing
- Three sections: Friends (72), Files shared with put.io friends, Files shared with special people
- Friend grid: avatar + name + "Sharing files with them/each other"
- Shared folder: __o-o__ "Shared with all of your friends"
- "Files shared with special people: You don't have any shared links"
- "INVITE YOUR FRIENDS!" button
- **Assessment:** Wait — 72 friends? This is Altay's account. The "friendship" feature was supposedly killed in Oct 2019 but the data persists? The three-section layout is confusing. "Special people" vs "friends" vs "put.io friends" — three sharing concepts on one page.

### Web App — History
- Extremely long page — hundreds of entries
- Dark theme, tiny text, pure text list
- Each entry: filename + action + timestamp
- Shows everything: video plays, downloads, conversions, transfers
- **Assessment:** This is a log, not a history page. Useful for debugging but useless for "what was I watching?" or "what did I download last week?" No filtering, no grouping, no visual hierarchy.

### Web App — Settings
- Well-organized sections: Theme, Application layout, Files, Media Playback, Subtitles, Transfers, Storage, Privacy and Safety
- Light/Dark/System theme toggle
- Fixed/Fluid layout toggle
- Detailed media playback options (proxy selection, playback type, autoplay, next suggestion)
- Transfer settings: default folder, magnet link handler, fixed IP for private trackers, callback URL, Pushover
- Storage: trash behavior, disk usage display format
- Privacy: history logging, invisible mode, account activity alerts
- **Assessment:** Best-organized page in the app. Clean sections, clear labels, good descriptions. But it's also proof of feature depth that users never discover — "Suggest playing next media" is buried in settings, not surfaced in the player. Callback URL and Pushover are power-user features mixed with basic preferences.

### Web App — Video Player
- Inline player with breadcrumb navigation
- Right sidebar: "Play on Chromecast" button (prominent, gold), Up Next (Autoplay toggle), then file actions
- File actions: Move, Trash, Open in popup window, Mark as unwatched, Download (with size), Stream link, VLC playlist, Show media info, Exclusive access
- Hash info shown: CRC32 + SHA1
- Player controls: play/pause, volume, progress bar, speed (1x), PiP, aspect ratio, fullscreen
- **Assessment:** This is where the icon ambiguity hits hardest. The right sidebar has 10+ actions of wildly different importance. "Download (209.89 MB)" vs "Stream link" vs "VLC playlist" — three ways to get the same content, no visual hierarchy. The VLC playlist trick that users discover by accident is RIGHT THERE but visually identical to everything else.

### Web App — Billing/Subscription
- Same two-plan layout as public pricing but in-app context
- "Switch to Recurring Payments" header
- Monthly/Yearly toggle
- Plan comparison cards (identical to pricing page)
- **Assessment:** Functional but zero upsell craft. No "You've used X GB this month" or "Based on your usage, 1TB would save you cleanup time." Pricing restructuring will need this page to do more work.

### About Page
- "Hello, We're pilli. A 26 year old web company hailing from Istanbul."
- Company history: web design shop (2000) → own products (2005) → PilliNetwork (community blogs, Spotify model before Spotify) → Sosyomat (social tagging, 400k users) → put.io
- Team: 7 people with photos and personality descriptions
  - Hasan Yalçınkaya — "veteran web worker," business + product + support
  - Ceren Akış — manager, "actually a very entertaining person"
  - Ömer Murat Yıldırım — dev, "His favorite show is still Seinfeld"
  - Altay — dev, "His favorite The Office character is Creed"
  - Çiğdem Çabuker — support, "obsessed with dystopias and feeds on memes"
  - Berkan Teber — dev, "believes he can exhaust the Internet"
  - Zeynep Yazıcı — support, "likes long and boring movies"
- Special Thanks section with alumni names
- Company details: PUTiO Internet Hizmetleri AS., Istanbul
- **Assessment:** This page has more personality than the entire web app. The team descriptions are wonderful. "We don't have a bounty program, but if your discovery leads to an action on our part we will mention you here" — peak put.io voice. This warmth needs to infuse the product itself.

### Current Pricing (from screenshots)
- **$0.99** — 1-day trial
- **$9.99/month** — 100GB, unlimited downloads, 10 active transfers, seeding ratio 2.00/10 days
- **$19.99/month** — 1TB, unlimited downloads, 50 active transfers, seeding ratio 20.00/14 days, family up to 4
- Annually: 17% discount
- No 10TB plan shown on public pricing (exists for existing users?)
- No middle tier between 100GB and 1TB

### Navigation Structure (Information Architecture)
```
Landing: put.io
├── Plans & Pricing
├── About Us
├── ᕦ(ò_óˇ)ᕤ (kaomoji — ?)
└── Go to app →

App: app.put.io
├── Files (file browser, video player)
├── Transfers (active/completed downloads)
├── RSS Automation (feed management)
├── Sharing (friends, shared files, special links)
├── History (activity log)
├── Trash
├── Extensions (browser extensions)
├── Settings
│   ├── Theme / Layout
│   ├── Files (sorting)
│   ├── Media Playback (proxy, player, autoplay)
│   ├── Subtitles
│   ├── Transfers (folder, magnet handler, IP, callbacks)
│   ├── Storage (trash, usage display)
│   └── Privacy and Safety
└── Billing (plan management)
```

### Android TV App (from store screenshots)

**Login/Activation:**
- Activation code flow (6-letter code, enter at put.io/link) — standard TV login pattern
- Kaomoji welcome: ┌( ಠ_ಠ)┘ — brand personality even on TV
- Yellow brand background on store frames

**File Browser:**
- Dark background, yellow folder icons (consistent with web)
- List view: folder name + size + chevron
- "Refresh" and "Name" sort buttons in top bar
- Simple, functional. No metadata, no thumbnails — just filenames and sizes
- "Items shared with you" folder visible — sharing feature surfaces naturally here

**Search:**
- Full-width search bar with recent searches as pill chips
- Results: mix of folders and files with type icons (folder, video, subtitle)
- Eye icon on focused video items — indicates "watched"
- **Assessment:** Clean but basic. The search chip history is good. No voice search integration visible

**Video Player:**
- Full-screen player with subtitles
- Audio track picker overlay (multi-track support)
- Bottom bar: filename (raw .mkv), yellow progress bar, timestamp, Language/Audio/Subtitles/Settings icons
- **Assessment:** Functional player. Filename shown raw (no parsing). Audio track picker works but looks generic

**Settings:**
- User avatar (space invader icon!) + username + storage bar
- Sections: Playback settings, Storage settings
- Proxy selection (Amsterdam Direct), playback type (HLS), buffer size, subtitle toggle
- **Assessment:** Well-organized for TV. The space invader avatar is a nice touch. Proxy/buffer settings are power-user features on a TV — might want to simplify defaults

**Overall TV assessment:** Consistent brand feel (dark + yellow), functional but generic. The kaomoji and space invader avatar show personality peeking through. Biggest opportunity: filename parsing, continue-watching row, and grid view for visual browsing. Currently feels like the web app projected onto a TV screen rather than a TV-native experience.

### Android Phone App (from store screenshots)

Uses the same React Native codebase as Android TV but with touch UI. Store screenshots show similar screens: activation, file browser, search, player, settings. Same yellow-on-dark theme. Mobile-specific: touch-friendly list items, standard Android navigation patterns.

### Codebase Architecture

**Monorepo: `frontend` (current production)**
```
apps/
  web         — main web app (React, theme-ui + Emotion, Radix primitives)
  landing     — put.io marketing site (SCSS, Gatsby-era)
  ios         — native iOS/tvOS (Swift, UIKit)
  tv          — web-based TV app (React)
  tv-native   — React Native TV app (Android TV, Fire TV)
  roku        — BrightScript
  cli         — command line client

packages/
  colors      — semantic color system (Radix-based, light+dark)
  fonts       — GT America Standard + Mono, Flaticons
  ui          — shared components (shadcn/Radix + Tailwind + CVA)
  core        — API client, errors, validators
  features    — shared feature modules (account, auth, files, billing, etc.)
  sdk         — legacy JS SDK
  translations — typed i18n strings
  starry-night — canvas animation (landing hero, by Ateş Goral)
  utilities   — shared utils
```

**New monorepo: `frontend-next` (SDK overhaul)**
```
packages/
  sdk         — new Effect-based TypeScript SDK
                domains: account, auth, config, files, transfers, sharing, payment,
                         rss, family, friends, oauth, ifttt, tunnel, zips, events,
                         friend-invites, download-links, trash
```

### Color System (from `@putdotio/colors`)

Built on Radix UI Colors with semantic mapping:

```
Step  Semantic Name          Purpose
1     bg                     main background (page, modal)
2     bg-secondary           secondary background (card, sidebar)
3     component-bg           interactive UI elements (button, input)
4     component-bg-hover     hover state
5     component-bg-active    active/pressed state
6     line                   borders of non-interactive elements
7     border                 borders of interactive elements
8     border-hover           hover borders + focus rings
9     solid                  solid color fills
10    solid-hover            solid hover
11    text-secondary         low-contrast text (labels)
12    text                   high-contrast text (body)
```

Four color namespaces: gray (default), green, red, yellow

Brand color: **Yellow** — `#FDCE45` (solid), `#FDD868` (light hover), `#FCBE03` (dark hover)

**Light mode:** white app-bg, gray spectrum, lime for transfer states
**Dark mode:** black html-bg, gray-dark spectrum

### Typography (from `@putdotio/fonts`)

**Primary:** GT America Standard (Grilli Type) — 400, 500, 600 weights
**Monospace:** GT America Mono (Grilli Type)
**Icons:** Flaticons (custom icon font)

Font sizes: `[0.875rem, 1rem, 1.125rem, 1.5rem, 2rem, 48px, 64px, 96px]`
Base: 14-15px (responsive)
Font smoothing: antialiased
Letter/word spacing: normal

Text variants: body (400), button (500), caption (400, secondary color), heading (500), label (500), subheading (500)

### Spacing & Layout

Space scale: `[0, 4, 8, 16, 32, 64, 128, 256, 512]` (4px base)
Border radius: 4px default, 3px wrapped
Breakpoints: MD and LG (responsive)
Layout modes: Fixed / Fluid (user setting)

### Component Inventory (web app)

**Shared UI package (`@putdotio/ui`):**
Alert, Button (5 variants: default/yellow, negative/red, positive/green, ghost, secondary), Form, Input, Label, Link, PasswordInput, Tooltip, Callout, ZodForm

**Web app components:**
ActionMenu, AppLayout, AudioPlayer, Avatar, Breadcrumbs, ButtonGroup, DemoArea, DiskUsage, Dropdown, Dropzone, EditableText, EmptyState, ExternalLink, Form, Icon (Flaticons), InviteLinks, ListItem, Loading, LoadingOverlay, Logo, Markdown, Notification, PDFViewer, PageLayout, Separator, Skeleton, Tabs, TextViewer, Tooltip, ePubViewer

**Feature modules:**
Account, Auth, BFF, Billing, Files, History, IFTTT, PublicShares, Trash, UserConfig

**TV app components:**
EmptyStateScreen, FlatList, ListItem, LoadingScreen, Auth, Icon, Modal, PageHeader, RemoteHandler, Screen, Spinner
Features: Files, History, Home, Search, Settings

### Tech Stack Summary

| Platform | Stack | Styling |
|---|---|---|
| Web | React, theme-ui + Emotion, Radix UI | Semantic tokens via `@putdotio/colors`, some Tailwind (new components) |
| Landing | Gatsby-era, SCSS | Custom SCSS, separate from app design system |
| iOS/tvOS | Swift, UIKit | Native, no shared tokens yet |
| TV (web) | React | Shared components from web |
| TV (native) | React Native | Separate component set |
| Roku | BrightScript | Completely separate |
| New SDK | Effect TypeScript | N/A (library) |

### What the Codebase Tells Us About Design

1. **Two styling systems coexist:** theme-ui/Emotion (legacy web) and Tailwind/CVA (new shared UI). Migration is in progress but not complete.
2. **Color system is solid in concept** but only exists as web CSS/JS. No Swift or Kotlin token generation yet. The `putio-design` repo (planned) would fix this.
3. **GT America is well-integrated** — proper weights, mono variant for code. But only 3 weights (400, 500, 600) limits typographic range.
4. **Flaticons is a custom icon font** — vendor-locked, not an icon system that's easy to extend or contribute to.
5. **The landing site is completely separate** from the web app design system. Different build, different styles, different era.
6. **iOS app is pure UIKit** — no SwiftUI yet, no shared design tokens from the web color system.
7. **TV apps are split** — web-based TV (React) and React Native TV coexist. Different component libraries.
8. **The starry-night package** is a bespoke canvas animation by Ateş Goral — one of the most distinctive brand elements, living as a proper package.
9. **Button is the design system in miniature:** yellow/gold primary, green positive, red negative, ghost, and a clever "secondary" variant that inverts text/bg colors.
10. **4px spacing grid** is consistent but the scale jumps aggressively (0,4,8,16,32,64,128...) — fine for layout, potentially limiting for component-level spacing.

### Design System Observations
- **Colors:** Dark theme primary (#1a1a1a background), gold/yellow accent (#f5c542-ish) for CTAs and brand, green for active/on states, white text
- **Typography:** Clean sans-serif (likely GT America per TOOLS.md), good hierarchy in settings, flat in file lists
- **Icons:** Minimal, monochrome line icons in sidebar. Yellow folder icons are the brand signature in-app
- **Spacing:** Generous in settings, cramped in file/transfer lists
- **Components:** Standard form controls, toggle switches, dropdowns, cards. No custom components that stand out
- **Brand elements:** Kaomoji, sparkle animation on landing, yellow folders, "pilli" heritage
- **Dark mode:** Appears to be default. Light mode exists but not shown
- **Missing:** No empty states with personality (except RSS). No onboarding. No progressive disclosure. No contextual feature discovery.

---

