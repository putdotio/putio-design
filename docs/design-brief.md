---
title: "put.io — Design Brief"
created: 2026-03-18
updated: 2026-03-19
---

# put.io — Design Brief

Product context, user research, personas, design principles, and scope.

**Related docs:**
- [Design System](design-system.md) — current UI audit, codebase analysis, brand constants
- [Platform Strategy](platform-strategy.md) — native vs hybrid, architecture, agent workflow
- [Research](research.md) — raw interview notes, behavioral patterns, Notion context
- [TV App Spec](specs/tv-app.md) — complete spec for tvOS + Android TV rewrite

---

## 1. What is put.io

put.io is a cloud storage and transfer service. Users add files via magnet links, torrents, and URLs — put.io fetches, stores, and streams them. It's been running for over 15 years.

It's not a media library. It's not Netflix. It's a content-agnostic cloud utility that happens to be really good at playing video. Think of it as "the cloud's download folder."

### Product surface

- **Web app** — primary interface, file manager + player
- **iOS / tvOS** — native apps with offline download
- **Android / Android TV** — native apps
- **Roku, Kodi** — media center integrations
- **Browser extensions** — magnet link interception
- **CLI** — command-line client
- **Public API + SDKs** (TypeScript, Swift, Kotlin)
- **Ecosystem apps** — torrent discovery and streaming companion apps

### The team

- ~6 people total
- Altay Aydemir leads all frontend + native apps solo
- Hasan (founder) is design-aware, shares typography and design references, cares about craft
- No dedicated designer has ever been on the team
- "Design as we code" has been the approach for 15 years
- Internal #design Slack channel is a moodboard of inspiration, not a design process
- Working language: Turkish internally, English for public-facing

---

## 2. The Problem

put.io has never had a design voice. The UI works — functional, fast, reliable. But after 15+ years, it feels like what it is: an engineering-led product without a soul.

The current web app is essentially a well-executed shadcn/Radix implementation. Clean, but generic. You could swap the logo and it could be any SaaS file manager.

put.io is a unique service with a cult following. It deserves to feel like one.

### What we're looking for

A design partner who can define put.io's visual identity and build a cross-platform design system from scratch.

**This is not:**
- A corporate design system project
- A rebrand exercise
- A one-off Figma delivery

**This is:**
- An ongoing collaboration to give put.io a soul
- Defining the visual language that works across web, mobile, and TV
- Building a design system that engineers can execute against
- Evolving the product's feel over time

### But the deeper problem isn't aesthetics

**put.io has a discovery crisis.** The most consistent finding from user research: long-time paying users (5+ years) don't know half the product exists. ShowRSS, ecosystem apps, YouTube-DL integration, family sharing, friend connections — all invisible.

A data engineer at Expedia, paying for 5 years, didn't know put.io could download YouTube videos. That's not a UX bug — that's a product communication failure.

The first design project shouldn't be a visual refresh. It should be an information architecture overhaul. The beauty problem is secondary to the "users can't find shit" problem.

---

## 3. User Personas

Built from real in-person interviews in London (39 users) and Berlin (22 users) — 61 total. These are not marketing fabrications.

### Persona 1: The Pipeline Builder

**Archetype:** User 30 (Berlin), User 33 (Berlin), User 05 (London), User 31 (Berlin)

- **Who:** Senior engineers, CTOs, devops. Technically sophisticated.
- **Setup:** NAS (Synology) → put.io downloads via WebDAV/API → Plex/Infuse/Kodi on Apple TV
- **Mental model:** put.io is infrastructure, not an app. It's a headless download API with a web UI they tolerate.
- **Cares about:** API reliability, WebDAV mount, RSS automation, bulk operations, file organization, speed
- **Doesn't need:** Posters, recommendations, hand-holding, social features
- **Pain points:**
  - Drag-and-drop file organization doesn't work well (User 31: "No cloud storage feels like native OS filesystem, but Google Drive comes close")
  - Left nav is cluttered — wants it collapsible like YouTube
  - File actions list has too many items, most untouched
  - ShowRSS adds too many episodes, cleanup is tedious
- **UI need:** Power tools, keyboard shortcuts, batch operations, minimal chrome, dense information display
- **Revenue:** Typically 1TB yearly. Sticky — they've built infrastructure around put.io.
- **Quote:** *"I use it because German anti-piracy laws are harsh and a friend showed me his RSS setup"* — User 31

### Persona 2: The Casual Streamer

**Archetype:** User 32 (Berlin), User 03 (London), User 15 (London), User 11 (London)

- **Who:** Non-technical or semi-technical. Designers, MBAs, analysts.
- **Setup:** Laptop + phone. Maybe Chromecast. No NAS, no Plex.
- **Mental model:** put.io is where I watch stuff. Like Netflix but with everything.
- **Cares about:** Just press play. Offline download for travel. Simple search. Not feeling like a criminal.
- **Doesn't need:** API access, RSS automation, WebDAV
- **Pain points:**
  - ecosystem apps look untrustworthy ("looked like a ready-made template" — User 33)
  - Too many buttons in ecosystem apps — just want "Download to put.io" (User 38: "Just one button")
  - Seeder/peer counts are meaningless jargon — should be a health indicator
  - Don't know family sharing exists. Don't know ecosystem apps exist. Don't know YouTube download exists.
  - "I downloaded a few search results to see which one plays" because they can't tell quality from the listing 🥺
  - Download icon (⬇️) is ambiguous — local download or save to put.io?
- **UI need:** Media-forward, posters where possible, one-tap flows, hide torrent jargon, clear status indicators
- **Revenue:** 100GB monthly. High churn risk — many cancelled Netflix for this but could flip back.
- **This is the growth persona** — but the current UI actively repels them.
- **Quote:** *"I cancelled Netflix and Amazon Prime after getting used to put.io"* — User 32

### Persona 3: The Archivist

**Archetype:** User 13 (London), User 37 (Berlin), User 01 (London)

- **Who:** Eclectic collectors. Event promoters, font designers, creatives with hoarding tendencies.
- **Setup:** Large storage plans (1TB+). Put.io IS the library. May also use NAS as backup.
- **Mental model:** put.io is my curated collection. Storage is the product. The act of organizing is part of the experience.
- **Cares about:** Organization, folder structure, keeping things forever, browsing their own collection, sharing it with friends
- **Doesn't need:** Speed optimizations, automation, API
- **Pain points:**
  - No sense of what's worth keeping vs. what's taking space
  - Upgrade tiers jump too aggressively in price ("Bir üst seviye çok pahalı" — User 13 wants a middle option)
  - No metadata/posters for their collection. Just filenames in folders.
  - Collection sharing with family is clunky
- **UI need:** Better file management, smart folders, storage visualization, "what am I keeping?" dashboard
- **Revenue:** 1TB+ yearly. Emotionally attached. Very sticky but frustrated by pricing gaps.
- **Quote:** *"I pay because I enjoy curating my collection"* — User 13

### Persona 4: The Evangelist (growth lever, not a product persona)

**Archetype:** User 34 (Berlin), User 35 (Berlin), User 38 (Berlin)

- **Who:** Users who actively recruit friends.
- **Behavior:** Gets genuinely excited about voucher cards. Immediately knows who to give them to. The physical handoff moment triggers more enthusiasm than any feature demo.
- **Blocker:** "I tried to tell my friends but they don't know what a torrent is." The conversation dies without a visual demo.
- **What they need:** Shareable magic — a link, a demo, a 30-second "this is put.io" experience that works for non-technical friends
- **Design implication:** The referral flow and onboarding for non-users needs its own design attention. Ecosystem apps could fill this role, but currently fail at it aesthetically.
- **Quote:** *"Voucher'ları verdiğim an hemen kimlere dağıtacağı geldi aklına"* — about User 34

---

## 4. Design Needs (specific deliverables, distilled from 61 interviews)

### A. Navigation & Information Architecture

**Problem:** 7 sidebar items, most users touch 2-3. Features like ShowRSS, YouTube-DL, browser extension, family sharing are invisible to 5+ year paying users.

**Design needs:**
- **Redesign the sidebar** — collapsible (YouTube-style, requested by multiple users), with smart grouping. Measure click counts per nav item and hide the bottom 50% behind a "More" menu (User 38's suggestion)
- **Progressive disclosure system** — surface the right feature at the right moment. Example: when a user watches episode 3 of a series, suggest ShowRSS ("Want new episodes automatically?"). When they search for content, hint at the browser extension
- **Contextual feature discovery cards** — in-app announcements that aren't tooltips or docs. "Did you know?" moments that feel native, not like onboarding patronization
- **Redesign History page** — currently a raw log of hundreds of entries. Needs: filtering by type (watched/downloaded/converted), grouping by date, "continue watching" section, visual hierarchy. Transform from debugging log to "what was I doing?" dashboard

### B. File Browser & Organization

**Problem:** The core screen looks like any SaaS file manager. Yellow folders are the only distinctive element. No metadata, no thumbnails, no smart organization.

**Design needs:**
- **Dual-mode file browser** — list view (current, for Pipeline Builders who want density) AND grid/card view with thumbnails where possible (for Casual Streamers and Archivists). User toggles between modes
- **Drag-and-drop file organization** — Google Drive is the reference bar. User 31: "No cloud storage feels like native OS filesystem but Google Drive comes close." Current experience causes "pain"
- **Favorites system** (SUP-34) — star/pin files and folders. Accessible from sidebar. Archivists need this for curation
- **Smart folders / views** — "Recently added," "Last watched," "Largest files," "Shared with me." Not actual folders, but filtered views
- **File info on long-press (mobile)** — User 35 tilts his phone sideways to read truncated filenames. Long-press should show full filename, size, date, type, duration
- **Storage dashboard** — not just "11TB of 50TB" progress bar. Show: what types of files, what's oldest, what's never been opened. Help Archivists understand their collection. For 100GB users under constant storage pressure, help them decide what to delete

### C. Video Player & Playback

**Problem:** Right sidebar has 10+ actions of wildly different importance. Three ways to get the same content (Download, Stream link, VLC playlist) with no visual hierarchy. "Suggest playing next media" is buried in Settings, not in the player.

**Design needs:**
- **Simplify player actions** — primary: Play, Download, Chromecast. Secondary (collapsed): Stream link, VLC playlist, media info, hash. Current flat list treats everything equally
- **Autoplay / next episode in the player UI** — not in settings. When a video ends, show the next file in the folder with a countdown. Multiple users asked for this independently
- **Unambiguous icons** — ⬇️ currently means "save to put.io" but users read it as "download to my computer" (User 37 used the wrong button for months). Design distinct icons: cloud+arrow for "save to put.io," device+arrow for "download to device," play triangle for "stream"
- **VLC playlist discovery** — users who find this trick love it (avoid conversion wait). Surface it contextually: when conversion is in progress, show "Watch now via VLC" as a prominent option
- **Audio player redesign** (SUP-193) — currently an afterthought. Users download podcasts, music, audiobooks. Player needs: playback speed control (SUP-192), better placement, mini-player that persists during navigation

### D. Transfers & Downloads

**Problem:** Transfer list is pure torrent jargon. Seeding ratios, peer counts, codec info in filenames. Useful for power users, overwhelming for casual streamers.

**Design needs:**
- **Transfer status as a health indicator** — replace "Seeded: 847MB of 1.2GB | seed time: 2h | ratio: 0.71" with a simple progress/health visual. Green = healthy, done. Yellow = working. Red = problem. Detailed stats available on expand
- **Clean up torrent metadata in filenames** — parse "[1080p.WEB-DL.x264-GROUP]" into structured badges: quality tag, source tag. Show clean title + badges, not raw filename
- **Transfer progress that feels satisfying** — the gap between "I want this" and "it's ready" IS the product (binge trigger pattern). Animation, progress detail, estimated time. Make waiting feel good, not anxious
- **"Go to file" action prominence** — when a transfer completes, the primary action should be unmissable

### E. Sharing & Social

**Problem:** Sharing page has three confusing sections (Friends, put.io friends, special people). Friendship feature killed in 2019 but data persists. Family sharing exists but most users don't know about it.

**Design needs:**
- **Redesign sharing as a first-class feature** — Hasan's vision: folder following (subscribe to someone's collection), collaborative folders (multiple maintainers), casual one-time sharing (time-limited links)
- **Share with Mom redesign** — the existing feature for sharing with non-users. Needs: clearer UX, no put.io account required for recipient, beautiful preview page that sells the product ("Sign up and this is yours instantly")
- **Referral flow** — digital equivalent of the voucher card moment. Personalized share link, track who converted, reward both parties. The Monzo/Calm model
- **Family feature visibility** — users who'd benefit most have no idea it exists. Surface during plan selection and when users share content

### F. Onboarding & First-Run Experience

**Problem:** No onboarding exists. Users land on a file browser and figure it out (or don't). Features are discovered by accident over years.

**Design needs:**
- **First-run tour** — not a 12-step walkthrough. 3 things: how to add content (magnet/URL), how to watch it, and one "did you know" feature based on their plan (RSS for TV watchers, Chromecast for couch users)
- **Empty states with personality** — RSS page already has great empty state copy ("Just google 'RSS torrents'. You'll see the light."). Every empty state should have this energy
- **Referral landing experience** — when someone arrives via voucher/invite, they need to understand put.io in 60 seconds. Different from organic signup

### G. Pricing & Plans Page

**Problem:** Only two plans visible (100GB/$9.99, 1TB/$19.99). The gap is too big — multiple users want something in between. "Seeding ratio" on the pricing page is jargon. 10TB plan exists but isn't shown.

**Design needs:**
- **Pricing page restructured for personas** — the "Yeni planlar" initiative explicitly says "kullanıcı türlerine göre yeniden konumlandırmak" (reposition by user type). Pipeline Builder tier, Casual tier, Archivist tier
- **Middle tier** — 250-500GB plan at ~$14.99. User 46 and User 13 both independently asked for this
- **Remove torrent jargon from pricing** — "seeding ratio 2.00/10 days" means nothing to a casual user. Translate to benefits: "Downloads stay available for 10 days" or similar
- **In-app upsell context** — when a 100GB user is constantly cleaning up storage, show "Based on your usage, 1TB would save you X hours of cleanup per month." Not currently done
- **Turkey-specific pricing visibility** — 35% discount auto-triggers by IP but users miss the popup. The discount code is literally "NEOLACAKBUDOLARINHALI." Make it unmissable

### H. Trust & Security UX

**Problem:** Compromised accounts (PWNED credentials → hackers upgrade to 10TB → create family accounts). Users discover via bank statements. Some leave forever.

**Design needs:**
- **Plan change confirmation flow** — visual friction before upgrading. Show: what you currently have, what you're changing to, cost difference. Require re-entering payment for upgrades
- **Session management dashboard** — show all active sessions, devices, locations. One-tap "end all other sessions." Currently buried
- **2FA encouragement** — not forced, but prominent. During login, after a security email, during plan changes
- **Suspicious activity alerts** — not just email (users miss them). In-app banner: "New login from [location]. Was this you?"

### I. Platform-Specific Design Needs

Each platform has its own interaction model, constraints, and user expectations. The design system must produce coherent but platform-native experiences across all of them.

#### Apple TV (tvOS)
- **Focus-driven navigation** — no touch, no mouse. Everything is D-pad/Siri Remote. Focus states must be large, obvious, and smooth
- **10-foot UI** — text minimum ~32pt. File names that are already hard to read on web become impossible on TV at 3 meters
- **Filename parsing is critical here** — no one can read "The.Wire.S03E04.1080p.BluRay.x264-DEMAND.mkv" from across the room. Parse into: show name, season, episode, quality badge
- **Top Shelf integration** — show "Continue Watching" or "Recently Added" in the tvOS top shelf when put.io is in the dock
- **Content browsing without metadata** — no posters, no descriptions. Typography, spacing, and smart grouping (by folder → by type → by date) carry the entire experience
- **Player: native feel** — match Apple's native video player patterns. Swipe for timeline, click for play/pause, swipe down for info/subtitles/audio tracks

#### iOS
- **Files app integration** (SUP-127) — put.io as a file provider. Users expect to browse put.io files alongside iCloud/Dropbox in the native Files app
- **Share sheet** — magnet link → put.io is already "magical" (user quote). Make it even smoother: show transfer progress in-app without leaving context
- **Offline downloads** — standout feature for travel. Needs: download queue management, storage usage per downloaded item, auto-cleanup of watched downloads
- **Long-press file info** — full filename, size, duration, type, download/stream/share actions in a context menu (User 35's request)
- **Picture-in-Picture** — continue watching while browsing files
- **Lock Screen / Dynamic Island** — playback controls and transfer progress
- **Widgets** — storage usage, active transfers, "continue watching"

#### Android
- **Official app quality gap** — third-party apps (Steven's) can't handle subtitles properly, VPN breaks Chromecast. Users resort to responsive web on Chrome. The official app needs to be definitively better
- **Material You theming** — dynamic color from wallpaper, follow Material 3 conventions
- **Chromecast first-class** — casting is the primary TV-watching flow for Android users. Must work seamlessly with VPN on
- **Download to device** — clear distinction between "save to put.io cloud" and "download to this phone." Icon ambiguity is even worse on mobile

#### Android TV / Fire TV
- **Remote-first navigation** — D-pad, no touch. Similar constraints to tvOS but different design language (Leanback library)
- **Fire TV back button** (UI-1528) — should dismiss playback menu before exiting player, not jump straight out
- **Channel rows** — "Continue Watching," "Recently Added," "Transfers in Progress" as home screen channels
- **Voice search integration** — "Play [filename]" via Alexa/Google Assistant

#### Web-Based TV (tv.put.io)
- **Existing React app** — shared components with web but needs TV-specific interaction model
- **Remote control via phone** — pair phone as remote for navigation/search (typing on TV remotes is painful)
- **Graceful degradation** — works on smart TVs with basic browsers (Samsung Tizen, LG webOS). Can't assume modern CSS/JS
- **User 51 uses LG webOS** — real user on this platform, gave UI feedback

#### Roku
- **BrightScript constraints** — entirely different tech stack, no shared components possible. Design specs need to be platform-agnostic enough to translate
- **Simplest possible navigation** — Roku users expect extreme simplicity. Grid of folders → list of files → player
- **SD resolution support** — some Roku devices are still 720p. Design must work at low resolution

#### Apple Watch
- **Transfer notifications** — "Your download is ready" with haptic tap
- **Now Playing** — playback controls when streaming audio from put.io on iPhone
- **Complication** — storage usage at a glance, active transfer count
- **Not a browsing interface** — no one browses files on a watch. It's for glanceable status and playback control only

#### visionOS (Apple Vision Pro)
- **Spatial video player** — immersive theater environment for video playback. The ultimate put.io flex
- **File browser as spatial UI** — folders as spatial objects? Or just a clean window that coexists with other apps
- **Eye tracking + hand gestures** — no controller. Design for gaze-and-pinch interaction
- **Environments** — custom put.io viewing environment (starry night theme from landing page?)
- **SharePlay** — watch together with friends in a shared virtual space. Natural extension of put.io's social/sharing features

#### Cross-Platform Design Token Requirements

Each platform needs generated outputs from a single token source:

| Platform | Token Format | Component Framework |
|---|---|---|
| Web | CSS custom properties, Tailwind theme | React + Radix |
| Landing | SCSS variables | Standalone (legacy) |
| iOS/tvOS | Swift UIColor/SwiftUI Color extensions | UIKit → SwiftUI migration |
| Android/Android TV | Compose theme, XML resources | Jetpack Compose |
| Roku | BrightScript constants | Custom |
| watchOS | SwiftUI Color extensions | SwiftUI |
| visionOS | SwiftUI + RealityKit materials | SwiftUI |

### J. Cross-Platform Design Token Architecture

**Problem:** Colors exist only as web CSS/JS. iOS is pure UIKit with no shared tokens. Two styling systems coexist in web (theme-ui → Tailwind migration). No Android token generation.

**Design needs:**
- **DTCG-spec token file** — single source of truth in `putio-design` repo. Colors, spacing, radius, typography, shadows
- **Style Dictionary pipeline** — generates: CSS custom properties (web), Swift extensions (iOS), Compose theme (Android), SCSS variables (landing)
- **Consolidate yellow** — brand yellow is `#FDCE45` but there are HSL `var(--primary)` references floating around. One yellow, one source
- **Icon system migration** — Flaticons is a custom icon font, hard to extend. Move to SVG icon system (Lucide, custom, or Figma-exported) that works cross-platform
- **Typography audit** — GT America is great but only 3 weights (400, 500, 600). Evaluate if this is enough for the full design system or if additional weights / a display face are needed

---

## 5. Key Design Challenges

### 5.1 Content-agnostic UI

put.io is content-agnostic. There are no movie posters, no album art, no curated metadata. Users upload whatever — videos, music, documents, archives, random files. File names are messy. Folders are user-organized.

Design questions:
- How do you make a file browser feel premium without visual content to lean on?
- How do you make a video player experience feel intentional when you don't control the content?
- How do you create a TV interface navigable with just filenames and folders?
- How do you make "adding a magnet link" feel delightful?
- How do you show transfer progress in a way that's satisfying?

The beauty has to come from the **utility itself** — interactions, typography, motion, information density. Like how Linear made project management beautiful, or how iA Writer made plain text feel premium.

### 5.2 The three-persona problem

The three personas need fundamentally different interfaces:
- Pipeline Builder → power tools, dense info, automation
- Casual Streamer → media browser, big thumbnails, one-tap play
- Archivist → collection management, organization, storage insights

Currently everyone gets the same file manager. The design system needs to support these modes without fragmenting into three apps.

### 5.3 Feature invisibility

Features exist but users don't find them:
- ShowRSS (automatic TV show downloads)
- Ecosystem apps (torrent discovery + streaming)
- YouTube-DL integration
- Family sharing / friend connections
- File conversion + VLC playlist trick
- Browser extensions

This isn't a marketing problem — it's an in-product discoverability problem. The design needs progressive disclosure: surface the right feature at the right moment.

### 5.4 Icon and action ambiguity

Download means three different things:
1. Save to put.io (from torrent/URL)
2. Download to local device
3. Stream/play

Users are guessing. One user (User 37, Berlin) used the wrong button for months. The icon system needs to eliminate ambiguity completely.

---

## 6. Design Principles (proposed)

### Utility is beautiful
The product's soul comes from making file operations feel premium. Not decoration — the interactions themselves should feel good. Transfer progress, file operations, storage usage — every state change is an opportunity.

### Respect the power user, welcome the newcomer
Default to simplicity. Power features exist but don't clutter the default view. The Pipeline Builder should be able to unlock density; the Casual Streamer should never feel overwhelmed.

### Clarity over cleverness
Every icon, every button, every label should have exactly one meaning. If a user has to guess, the design failed. Especially important given the download/save/stream ambiguity.

### Show, don't document
Features should be discovered through use, not through help pages or tooltips. If ShowRSS exists, the UI should naturally lead users to it when they're watching a series. If ecosystem apps exist, the main app should hint at it when users search.

### Trust through craft
Users associate design quality with legitimacy. Ecosystem apps look sketchy → users feel sketchy using them. Premium design = implicit trust. This matters more for put.io than most products because of the legal grey zone.

### Typography carries the weight
In a content-agnostic product, type does the heavy lifting. File names, folder labels, status text — these ARE the content. Typography needs to make plain text feel considered.

---

## 7. Vibe References

- **Linear** — opinionated, polished, developer-friendly but not cold
- **fal.ai** — tasteful, modern, developer-facing without being sterile
- **Oxide Computer** (oxide.computer) — hardcore infrastructure, beautiful design
- **Stripe** — world-class craft in utility products (BFCM microsite, checkout flows)
- **Vercel / Geist** — the design system that developer tools aspire to
- **bitchat** — personality, not afraid to be different
- **iA Writer** — making plain text feel premium (closest analogy to put.io's challenge)
- Nerdy, geeky energy. put.io users are technical. The design should respect that.

### Typography references
The team cares deeply about type:
- Current: GT America (Grilli Type)
- Internal references: Tiempos Headline (Klim), GT Canon (Grilli), Geist Pixel (Vercel)
- Any design partner must have strong typographic opinions

---

## 8. Technical Constraints

- No reliable metadata — can't depend on posters, descriptions, ratings
- Mixed content types in the same space (video, audio, documents, archives)
- Cloud storage mental model, not a media library
- Cross-platform: web, iOS, tvOS, Android, Android TV — what works on one must translate
- One frontend engineer (Altay) + AI coding agents — see [Platform Strategy](platform-strategy.md)
- Open source direction — SDKs and potentially apps
- Current stack: React (web), Swift (iOS/tvOS), Kotlin (Android) — see [Design System](design-system.md) for codebase analysis
- Design tokens need to work cross-platform — see shared contracts in [TV App Spec](specs/tv-app.md#shared-contracts)

---

## 9. Scope

Scope has evolved into a full platform strategy. See [Platform Strategy](platform-strategy.md) for the architecture and implementation plan.

**Summary:** Spec-driven native apps. Agents implement specs across platforms in parallel. One human reviews. The spec is the product.

**Priority order:**
1. **tvOS + Android TV** — native rewrite with VLC-kit/libVLC (spec: [tv-app.md](specs/tv-app.md))
2. **iOS + Android** — native rewrite sharing SDK with TV apps
3. **Web** — evolve existing React app with new design system
4. **TV-web** (Tizen, LG, Vizio) — new lightweight web app
5. **Everything else** — deferred (Roku, Xbox, visionOS, watchOS)

---

## 10. Engagement Model

- Part-time / freelance (roughly 10h/week)
- Hourly, with a test run period before committing long-term
- Direct collaboration with engineering (Altay + team)
- Figma as the design tool
- Design decisions documented alongside code (design system lives in `putio-design` repo)

---

## 11. Ideal Design Partner

- Has taste. Opinionated. Not a Dribbble decorator.
- **Multi-platform experience is non-negotiable** — has designed for at least iOS + Android + TV. This is not a web redesign project. put.io lives on every screen
- Understands platform conventions deeply — knows when to follow Apple HIG vs Material vs Leanback vs Roku, and when to break them
- Understands engineering constraints — knows what's implementable by one person per platform
- Ideally a put.io user (understands the product intuitively)
- Can work async, doesn't need hand-holding
- Has shipped design systems or product design for developer/utility tools
- Portfolio shows personality, not just polish
- Strong typographic sense — cares about type at the foundry level, especially for 10-foot UI where type does all the work
- Comfortable with the legal grey zone — put.io exists in a space where design = trust
- Thinks in systems, not screens — a button on iOS, a focus state on tvOS, and a tile on Roku are the same component expressed three ways

---

## Appendix: Design Decisions

Key decisions made during design exploration. For TV-specific decisions, see [TV App Spec](specs/tv-app.md).

| Decision | Reasoning |
|----------|-----------|
| **SVG icons only (Phosphor)** | Emoji renders differently across platforms. SVGs give full control. Phosphor has the right warmth. |
| **TV = list browsing, not card grids** | No metadata/posters to depend on. Typography carries the experience. |
| **Ecosystem apps out of scope** | Separate product, separate design concerns. |
| **Yellow #FDCE45 sacred** | The one constant across all variants and platforms. |
| **Kaomoji ᕦ(ò_óˇ)ᕤ preserved** | Brand personality in empty states and footers. |
| **Icon disambiguation** | cloud+upload = save to put.io, device+arrow = download, play = stream. Three distinct metaphors. |
| **Transfer health dots** | Green/yellow/red replace torrent jargon. |
| **Filename parsing** | Raw torrent names → clean titles + quality badges. |
| **Storage dashboard** | New screen for Archivist persona — file type breakdown, insights, largest files. |
| **4 persona-based pricing tiers** | Trial / Casual / Plus / Power. No jargon. |

### Design Variants Explored

| Variant | Type stack | Reference | Persona fit |
|---------|-----------|-----------|-------------|
| Clean Modern | Inter | Linear, Raycast, Notion | Production-ready default |
| Monospace | JetBrains Mono | Terminal, iA Writer | Pipeline Builder |
| Brutalist | Inter Black + JetBrains Mono | Oxide Computer | Bold statement |
| Editorial | DM Serif Display + Inter | Letterboxd, Are.na | Warmth, soul |

376 HTML prototypes across 11 variants in `prototypes/`.
