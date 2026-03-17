---
title: "put.io Design — Master Document"
created: 2026-03-18
updated: 2026-03-18
tags: [putio, design, system, brief, personas, interviews, tokens]
---

# put.io — Design Master Document

This is the single source of truth for put.io's design direction. Product context, real user research, personas, design principles, technical constraints, and eventually design tokens and component specs — all in one place.

Any designer, engineer, or agent working on put.io design starts here.

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
- **Chill Institute** (chill.institute) — torrent discovery and streaming companion app

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

**put.io has a discovery crisis.** The most consistent finding from user research: long-time paying users (5+ years) don't know half the product exists. ShowRSS, Chill Institute, YouTube-DL integration, family sharing, friend connections — all invisible.

A data engineer at Expedia, paying for 5 years, didn't know put.io could download YouTube videos. That's not a UX bug — that's a product communication failure.

The first design project shouldn't be a visual refresh. It should be an information architecture overhaul. The beauty problem is secondary to the "users can't find shit" problem.

---

## 3. User Personas

Built from real in-person interviews in London (39 users) and Berlin (22 users) — 61 total. These are not marketing fabrications.

### Persona 1: The Pipeline Builder

**Archetype:** Miha Erzen (Berlin), Kemal Bay (Berlin), Ergun Özyurt (London), Eyal Golan (Berlin)

- **Who:** Senior engineers, CTOs, devops. Technically sophisticated.
- **Setup:** NAS (Synology) → put.io downloads via WebDAV/API → Plex/Infuse/Kodi on Apple TV
- **Mental model:** put.io is infrastructure, not an app. It's a headless download API with a web UI they tolerate.
- **Cares about:** API reliability, WebDAV mount, RSS automation, bulk operations, file organization, speed
- **Doesn't need:** Posters, recommendations, hand-holding, social features
- **Pain points:**
  - Drag-and-drop file organization doesn't work well (Eyal: "No cloud storage feels like native OS filesystem, but Google Drive comes close")
  - Left nav is cluttered — wants it collapsible like YouTube
  - File actions list has too many items, most untouched
  - ShowRSS adds too many episodes, cleanup is tedious
- **UI need:** Power tools, keyboard shortcuts, batch operations, minimal chrome, dense information display
- **Revenue:** Typically 1TB yearly. Sticky — they've built infrastructure around put.io.
- **Quote:** *"I use it because German anti-piracy laws are harsh and a friend showed me his RSS setup"* — Eyal Golan

### Persona 2: The Casual Streamer

**Archetype:** Helen Stead (Berlin), Nabil Freeman (London), TK (London), Rutvik Deepak (London)

- **Who:** Non-technical or semi-technical. Designers, MBAs, analysts.
- **Setup:** Laptop + phone. Maybe Chromecast. No NAS, no Plex.
- **Mental model:** put.io is where I watch stuff. Like Netflix but with everything.
- **Cares about:** Just press play. Offline download for travel. Simple search. Not feeling like a criminal.
- **Doesn't need:** API access, RSS automation, WebDAV
- **Pain points:**
  - Chill Institute looks untrustworthy ("looked like a ready-made template" — Kemal Bay)
  - Too many buttons in Chill — just want "Download to put.io" (Jesse Box: "Just one button")
  - Seeder/peer counts are meaningless jargon — should be a health indicator
  - Don't know family sharing exists. Don't know Chill exists. Don't know YouTube download exists.
  - "I downloaded a few search results to see which one plays" because they can't tell quality from the listing 🥺
  - Download icon (⬇️) is ambiguous — local download or save to put.io?
- **UI need:** Media-forward, posters where possible, one-tap flows, hide torrent jargon, clear status indicators
- **Revenue:** 100GB monthly. High churn risk — many cancelled Netflix for this but could flip back.
- **This is the growth persona** — but the current UI actively repels them.
- **Quote:** *"I cancelled Netflix and Amazon Prime after getting used to put.io"* — Helen Stead

### Persona 3: The Archivist

**Archetype:** Tobias Slater (London), Andrew Sinn (Berlin), James Sparkes (London)

- **Who:** Eclectic collectors. Event promoters, font designers, creatives with hoarding tendencies.
- **Setup:** Large storage plans (1TB+). Put.io IS the library. May also use NAS as backup.
- **Mental model:** put.io is my curated collection. Storage is the product. The act of organizing is part of the experience.
- **Cares about:** Organization, folder structure, keeping things forever, browsing their own collection, sharing it with friends
- **Doesn't need:** Speed optimizations, automation, API
- **Pain points:**
  - No sense of what's worth keeping vs. what's taking space
  - Upgrade tiers jump too aggressively in price ("Bir üst seviye çok pahalı" — Tobias wants a middle option)
  - No metadata/posters for their collection. Just filenames in folders.
  - Collection sharing with family is clunky
- **UI need:** Better file management, smart folders, storage visualization, "what am I keeping?" dashboard
- **Revenue:** 1TB+ yearly. Emotionally attached. Very sticky but frustrated by pricing gaps.
- **Quote:** *"I pay because I enjoy curating my collection"* — Tobias Slater

### Persona 4: The Evangelist (growth lever, not a product persona)

**Archetype:** Amir Friedman (Berlin), Matteo Koczorek (Berlin), Jesse Box (Berlin)

- **Who:** Users who actively recruit friends.
- **Behavior:** Gets genuinely excited about voucher cards. Immediately knows who to give them to. The physical handoff moment triggers more enthusiasm than any feature demo.
- **Blocker:** "I tried to tell my friends but they don't know what a torrent is." The conversation dies without a visual demo.
- **What they need:** Shareable magic — a link, a demo, a 30-second "this is put.io" experience that works for non-technical friends
- **Design implication:** The referral flow and onboarding for non-users needs its own design attention. Chill could be this, but currently fails at it aesthetically.
- **Quote:** *"Voucher'ları verdiğim an hemen kimlere dağıtacağı geldi aklına"* — about Amir Friedman

---

## 4. Design Needs (specific deliverables, distilled from 61 interviews)

### A. Navigation & Information Architecture

**Problem:** 7 sidebar items, most users touch 2-3. Features like ShowRSS, YouTube-DL, browser extension, family sharing are invisible to 5+ year paying users.

**Design needs:**
- **Redesign the sidebar** — collapsible (YouTube-style, requested by multiple users), with smart grouping. Measure click counts per nav item and hide the bottom 50% behind a "More" menu (Jesse Box's suggestion)
- **Progressive disclosure system** — surface the right feature at the right moment. Example: when a user watches episode 3 of a series, suggest ShowRSS ("Want new episodes automatically?"). When they search for content, hint at the browser extension
- **Contextual feature discovery cards** — in-app announcements that aren't tooltips or docs. "Did you know?" moments that feel native, not like onboarding patronization
- **Redesign History page** — currently a raw log of hundreds of entries. Needs: filtering by type (watched/downloaded/converted), grouping by date, "continue watching" section, visual hierarchy. Transform from debugging log to "what was I doing?" dashboard

### B. File Browser & Organization

**Problem:** The core screen looks like any SaaS file manager. Yellow folders are the only distinctive element. No metadata, no thumbnails, no smart organization.

**Design needs:**
- **Dual-mode file browser** — list view (current, for Pipeline Builders who want density) AND grid/card view with thumbnails where possible (for Casual Streamers and Archivists). User toggles between modes
- **Drag-and-drop file organization** — Google Drive is the reference bar. Eyal Golan: "No cloud storage feels like native OS filesystem but Google Drive comes close." Current experience causes "pain"
- **Favorites system** (SUP-34) — star/pin files and folders. Accessible from sidebar. Archivists need this for curation
- **Smart folders / views** — "Recently added," "Last watched," "Largest files," "Shared with me." Not actual folders, but filtered views
- **File info on long-press (mobile)** — Matteo tilts his phone sideways to read truncated filenames. Long-press should show full filename, size, date, type, duration
- **Storage dashboard** — not just "11TB of 50TB" progress bar. Show: what types of files, what's oldest, what's never been opened. Help Archivists understand their collection. For 100GB users under constant storage pressure, help them decide what to delete

### C. Video Player & Playback

**Problem:** Right sidebar has 10+ actions of wildly different importance. Three ways to get the same content (Download, Stream link, VLC playlist) with no visual hierarchy. "Suggest playing next media" is buried in Settings, not in the player.

**Design needs:**
- **Simplify player actions** — primary: Play, Download, Chromecast. Secondary (collapsed): Stream link, VLC playlist, media info, hash. Current flat list treats everything equally
- **Autoplay / next episode in the player UI** — not in settings. When a video ends, show the next file in the folder with a countdown. Multiple users asked for this independently
- **Unambiguous icons** — ⬇️ currently means "save to put.io" but users read it as "download to my computer" (Andrew Sinn used the wrong button for months). Design distinct icons: cloud+arrow for "save to put.io," device+arrow for "download to device," play triangle for "stream"
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
- **Middle tier** — 250-500GB plan at ~$14.99. David Nicolson and Tobias Slater both independently asked for this
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
- **Long-press file info** — full filename, size, duration, type, download/stream/share actions in a context menu (Matteo's request)
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
- **Serkan Mutlu uses LG webOS** — real user on this platform, gave UI feedback

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
- Chill Institute (torrent discovery + streaming)
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

Users are guessing. One user (Andrew Sinn, Berlin) used the wrong button for months. The icon system needs to eliminate ambiguity completely.

---

## 6. Design Principles (proposed)

### Utility is beautiful
The product's soul comes from making file operations feel premium. Not decoration — the interactions themselves should feel good. Transfer progress, file operations, storage usage — every state change is an opportunity.

### Respect the power user, welcome the newcomer
Default to simplicity. Power features exist but don't clutter the default view. The Pipeline Builder should be able to unlock density; the Casual Streamer should never feel overwhelmed.

### Clarity over cleverness
Every icon, every button, every label should have exactly one meaning. If a user has to guess, the design failed. Especially important given the download/save/stream ambiguity.

### Show, don't document
Features should be discovered through use, not through help pages or tooltips. If ShowRSS exists, the UI should naturally lead users to it when they're watching a series. If Chill exists, the main app should hint at it when users search.

### Trust through craft
Users associate design quality with legitimacy. Chill looks sketchy → users feel sketchy using it. Premium design = implicit trust. This matters more for put.io than most products because of the legal grey zone.

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
- Cross-platform: web, iOS, tvOS, Android, Android TV, Roku — what works on one must translate
- Small engineering team — the design system must be implementable by one frontend dev
- Open source direction — the design will be public
- Current stack: React (web), Swift (iOS/tvOS), Kotlin (Android)
- Design tokens need to work cross-platform (DTCG spec → Style Dictionary)

---

## 9. Scope

### Phase 1: Foundation — Design System & Identity
- Visual identity refresh (colors, typography, iconography, motion language)
- Design tokens in DTCG spec → Style Dictionary pipeline for ALL platforms
- Core component patterns per platform family:
  - **Touch** (iOS, Android) — buttons, lists, navigation bars, sheets, context menus
  - **Focus/Remote** (tvOS, Android TV, Fire TV, Roku) — focus states, grids, player controls
  - **Pointer** (Web, macOS) — sidebar, tables, dropdowns, tooltips, keyboard shortcuts
  - **Glanceable** (watchOS) — complications, notifications
  - **Spatial** (visionOS) — windows, volumes, immersive player
- Information architecture audit across ALL platforms — not just web. Map every screen on every app, identify inconsistencies
- User journey mapping for each persona on each platform they use
- Icon system that works everywhere — SVG source, exported per platform

### Phase 2: Platform-by-Platform Implementation
Not a single "reference implementation" — design for every platform simultaneously. Priority order based on user base:
1. **Web** — most users, most features, most design debt
2. **iOS / tvOS** — Apple ecosystem is the dominant put.io user base (Apple TV mentioned in nearly every interview)
3. **Android / Android TV / Fire TV** — quality gap is the biggest pain point
4. **Roku** — constrained but has users
5. **watchOS** — small surface, high value (glanceable transfer status)
6. **visionOS** — future-facing, spatial video is a natural fit

Each platform gets:
- Native component library following platform conventions
- Shared design tokens (colors, type, spacing) but platform-native implementation
- Platform-specific patterns documented (not just "adapt from web")

### Phase 3: Living System
- Onboarding redesign across all platforms
- Referral/sharing flow (cross-platform — share from phone, watch on TV)
- Ongoing iteration as new features ship
- Design system documentation site (Storybook for web, equivalent references for native)

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

## Appendix 0: Current UI Audit (from screenshots, March 2026)

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

## Appendix A: Raw Interview Notes (London)

### James Sparkes
Designer. $499 yearly, 10TB. Uses WebDAV + Infuse — Netflix-like poster browsing. Family account for girlfriend and friend. Found put.io through unknown source. "Find people like me on Reddit."

### Kaan Ertürk
Devops at a bank. OG user since early days. Has Synology NAS, downloads via links. Complained about mp4 file selection bug (fixed on the spot).

### Nabil Freeman
Entrepreneur (lesalon.com). Long-time $4.99 user, downloads and deletes. Lived in China, used put.io through Hong Kong tunnel. Tries to tell friends but "they don't know what a torrent is." Uses ShowRSS, doesn't use Chill.

### Luc van Helfteren
Systems architect at William Hill. Lives on a river boat in a canal. Generates own electricity. Internet via multiple Vinnn devices bonded together. Found put.io through YCombinator. "It just works!" Suggested branding: "Instant Torrents."

### Ergün Özyurt
Lead dev at Plum Guide. User since pilli days (ID ~300). Downloads 4K originals to NAS, watches via Kodi. Has Plex, sometimes flexes his library to colleagues at the office.

### Ross O'Leary
3D artist. Most budget-conscious user imaginable — lives as a guardian in an empty Fitzrovia building. No TV, watches on computer. Internet via Vinnn. Same story: tried to tell friends, they don't know what torrents are.

### Daniel Robert Prieto
Product and brand designer (thisisgrey.com). Works on daisie.com with Maisie Williams (Arya Stark). Spent the interview pitching his own project — follow-up email sent. His project: aggregating creator monetization channels.

### George Rayner Law
(No notes captured)

### Kyriakos Sideris
Data engineer at Expedia. Found through a friend. Loved the $1 EFF donation. Uses browser + Chromecast. Shared login with friends. 5-year user who didn't know about ShowRSS, Chill, or YouTube downloads. "This is a huge lesson — we need to teach people these features exist."

### Olivier Legris
Growth strategist. Found through friend. NAS → Apple TV → Plex. Recently started using Watchio + 1TB and downloading less. Most knowledgeable user interviewed — knows Chill, ShowRSS, everything. Offered to help with growth for free.

### Rutvik Deepak
MBA student. Sister's account originally. Watches on laptop, Chromecast when TV available. Didn't know about Chill or ShowRSS. Also offered to help with strategy (politely declined).

### Tommaso Lanza
Designer at Somerset House (residency). 30GB plan, doesn't need more. Barely watches anything but pays out of love for the product. Successfully sold put.io to studio interns on the spot. Insight: student pricing with .edu verification.

### Tobias Slater
Event promoter (spiritual/ayahuasca events). 1TB account, archivist mindset. Pays to curate a collection. Frustrated that next tier up is too expensive — wants incremental storage addon. Chill-only user. "Torrent is impossible to explain to someone who doesn't know." Wants posters for discovery.

### Mustafa Kösker
(No notes captured)

### TK (Tom)
Analyst. Bangkok-born, gay, TV junkie. Learned English from TV shows. 100GB account, laptop viewer. No TV ever. Didn't know ShowRSS or Chill. No notable design insights.

### İnan Hıra
Old friend of put.io (pilli network era). Laptop user. Knows Chill, doesn't know ShowRSS.

### Anthony (Zboralski)
No-show. Resurfaced wanting to meet during quarantine.

### Tunca Bergmen
Works at Financial Times. OG user since the beginning. Extremely happy, no change requests. No actionable design insights.

### Nate Lanxon
Tech journalist at Bloomberg, podcast creator (Tech's Message). Content creator himself — philosophically conflicted about piracy but can't justify iTunes pricing (£22/season for Simpsons, £15/season for Friends). Downloads 80s documentaries from TVChaosUK private tracker. Interesting perspective: even people who create content pirate when pricing is unreasonable.

### Melis
No-show. Would have been the first female user interviewed.

### Bulut Korkmaz
Frontend dev at Just Eat. Apple TV user, knows Chill. Happy with everything — no actionable feedback.

### Arnaud Ceccaldi
Developer at Deliveroo. French, moved to London recently. Private tracker user, amateur photographer. Pitched idea: "GitHub for photo editing" — a cloud where edits are stored as data, originals preserved, API-driven. Apple TV + Chill user. Recruited at least 3 French friends. Found put.io searching "safe torrenting" because of France's Hadopi law.

### Tunca Ulubilge
Developer at The Times. Didn't even know about pilli or sosyomat (put.io's parent company history). No insights.

### Jonathan Fusellier
Paris visitor. Works at Adobe (marketing solutions). Extreme quantified-self geek.

### Elliott Kajdan
3D artist. Game of Thrones screening parties, Magic Leap interest. Projector setup.

### Oliver Bennett
Designer (interaction, installation). Username: ausername.

### Hazzam
Works at Whole Foods. Football streaming via AceStream.

### Valerio Francescangeli, Oğuzcan Köse, Kaan Ata, Paul Scandariato, İhsan Dışkan, Ryan Pither, Dan Meyer, Inconmon, Onur Özen, Ken Adams
Contact details collected, minimal interview notes. Scheduled for follow-up or brief encounters.

### Coolsideofthepillow
37, works in medicine. Found put.io searching for VPS/seedbox alternatives. Uses RSS → Chromecast or Cyberduck → Plex server. Sources: magnetdl, chill, limetorrents, torrentz2, eztv.

**Detailed feature requests (rare — most users just said "it works"):**
1. Netflix-style skin/GUI with Plex-like sorting (sees put.io as cheaper Plex VPS alternative)
2. Official Android app (existing third-party apps can't handle subtitles; VPN breaks Chromecast from browser)
3. Modernized webpage — "some tasks take a lot of clicks, it gets tedious"
4. More storage at same price point

This user sees put.io as a potential Plex+seedbox replacement if the UI caught up.

## Appendix B: Raw Interview Notes (Berlin)

### Miha Erzen
Freelance software engineer. 1TB monthly. Friend's recommendation. Main pain: no sync tool for poor internet (download at office, watch at home). Uses Web, iOS, Apple TV. Loves posters/metadata via Plex/Watchio. Cancelled Netflix when House of Cards rights moved to SKY in Germany. ShowRSS known but unused (too many episodes, cleanup annoying). Chill feedback: good for known searches, but yts.am is better for discovery because of posters/metadata. Suggested abstracting seeder/size into a "health" indicator.

### Eyal Golan
Software engineer at Thoughtworks. Java since '99. Israel → Berlin. Uses put.io because some content is legally unavailable even when paying (Big Bang Theory only German subs on Prime). Intermittent subscriber — pays for a month, binge-downloads, leaves. Wants drag-and-drop file organization like Google Drive. Watches on web only. Recently divorced, downloads stuff for his son on Fire TV. Loved Chill, bookmarked it immediately.

### Helen Stead
Web designer at Contentful. UK → Berlin. Started via Tolga's recommendation + Chill. Cancelled Netflix and Prime. MacBook + OnePlus 6. Downloads to computer, transfers via USB for flights. Android user who does offline the hard way. Thinks put.io is cute and simple. Conversion/instant download feels "magical."

### Kemal Bay
Technical lead at nu3. Beta user who left when it went paid, came back 3 years ago when Berlin's anti-piracy laws scared him. MacBook, iPhone, old Apple TV via AirPlay. ShowRSS known but unused. **"Chill looked like a ready-made template, didn't feel secure."** Didn't know put.io built it. Wants collapsible sidebar, more icon-driven UI. Suggested marketing put.io through a different angle or bundling with legal content.

### Amir Friedman
CTO at logistics company. 6 years in Berlin. Previously ran own VPS for torrents, switched to put.io on a Turkish friend's recommendation. 100GB monthly. Netflix + Prime alongside. Web, iOS, Mac mini → 55" TV. iOS offline download is favorite feature. Uses ThePirateBay. Wife loves the magnet-link-auto-opens-in-putio flow. **Didn't know about ShowRSS or Chill despite checking the Favorite Tools page once.** Chill requiring login felt wrong. Voucher handoff was the most excited user reaction in all interviews.

### Matteo Koczorek
Software engineer (iOS) at Zalando. 4 years Berlin. Friend's recommendation. 100GB monthly. MacBook, iPhone, iPad, HDMI to TV. Also downloads ePubs. Netflix shared account, barely uses it. Didn't know Chill, ShowRSS, YouTube-DL. **Loved Chill instantly** — "Google cache'inden TPB kullanmak bıktırıyor." iOS filename truncation pain — tilts phone to read. Suggested long-press file info popup. "Word of mouth from a friend at lunch was more impactful than any online ad could be." Thought put.io was British with 100 employees.

### Andrej Guran
CTO at Gebraucht.de. No-show — emergency Hamburg trip. Rescheduling.

### Andrew Sinn
Maker/designer. Most eclectic user. Unemployed, living on benefits, makes games (FixPix, Abductor Pro). **Has designed fonts.** Watches RuPaul's Drag Race with friends — that's how he found put.io. 100GB monthly. MacBook, iPhone, iPad, AirPlay to 3rd gen Apple TV. Has 4K Sony Android TV but refuses to use it because "Android is disgusting." Apple Music subscriber. **Loves the rainbow iOS icon.** Chill user, has specific feedback: ⬇️ icon confused him (thought = local download), repetitive strings in search results should be cleaned up to focus on season/episode. Suggested sponsoring drag screening events for marketing. Real story: a screening's streaming source crashed mid-event — put.io would have saved it.

### Jesse Box
UI designer at EyeEm. Australia → Berlin. Friend evangelism chain. 100GB yearly. Shares with girlfriend. MacBook only, no other devices. Friends wanted put.io to find torrents for them → Chill was the answer. **"Just one button: Download to put.io. Remove the other three."** Chill streaming made him feel like doing something illegal. Suggested measuring click counts on nav/action items and hiding the bottom 50%. Noted: VLC playlist trick for avoiding conversion wait should be surfaced by the product, not discovered by accident.

### Vijaya Prakash Kandel
Senior iOS engineer at Zalando. Nepal → Berlin. Matteo's colleague, heard about put.io from him. 100GB monthly one-time. Most technically aware user of how the product works. MacBook, iPhone, iPad, new Apple TV. Uses 1337x for torrents. Downloads audio, PDF, ePub too — wants "open in other apps" on mobile even if native viewing isn't supported. Suggested dev meetup sponsorship with cards + weekly voucher allocations.

### Tuna Vargı
Turkish software engineer, sick and couldn't meet properly. Family account user. No interview data.

### Fred Porciúncula
Android engineer at Blinkist. Brazil → Berlin. Discovered put.io as an exchange student in the US. 100GB yearly one-time. Downloads to MacBook, HDMI to TV. Uses ThePirateBay and rarbg. Didn't know Chill or ShowRSS. Friends mentioned a competitor: real-debrid.com. Brought voucher back next meeting. "I wish my company did user meetings like this." Strong meetup/contact-based acquisition advocacy.

### Eric Webster
Linux admin, ex-Research Gate. US → Berlin. Burnout, traveling. 100GB monthly subscription. Had advanced Kodi + own VPS setup in US, simplified to put.io in Berlin. Mac mini connected to TV. Downloads locally for quality, wants sync tool. Uses Magno for torrents. Joked about cops at a put.io meetup. LinkedIn connected, vouchers given.

### Gaiar Baimuratov
Lead Technical PM at AppLift. Russia → Berlin. Found put.io searching for seedbox alternatives. NAS + Plex setup, doesn't use put.io's own apps much. Has experience building TV streaming apps (Tizen, webOS, Apple TV) — technically relevant background. Suggested Dropbox-style referral system (invite friends → earn storage). Had simit and tea, praised local Turkish markets.

### Sergiu Adrian Ghitea
Backend developer at HelloFresh. Romania/Italy → Berlin. Friend recommendation. 100GB monthly subscription. Daily user. XPS laptop + HDMI + Steven's Android app (thought put.io made it). Uses private tracker. Firefox Quantum broke drag-and-drop torrent upload — was uploading .torrent files manually for a long time instead of using browser extension. Didn't know about ANY features (ShowRSS, Chill, YouTube-DL, browser extension). "Share with Mom" fan. Voucher handoff moment was powerful — immediately knew who to give them to.

### Abdullah Joseph
Mobile security team lead at Adjust.com. Syria → Malaysia → Berlin. 100GB monthly subscription. At least 5 put.io users at his office. Wife is Turkish, they both love put.io. MacBook + HDMI to TV. Doesn't install mobile apps — responsive web on Android Chrome is "good enough." Had built his own YouTube-DL tool on a VPS. Suggested tech meetup talks about interesting engineering problems behind put.io's simple interface.

### David Nicolson
Software engineer at ImmobilienScout24. Australia → Berlin. HackerNews discovery. Subscriber since 2015 (monthly), 2017 (yearly). No Netflix. **100GB sometimes not enough, 1TB too much — wants a middle tier.** Uses Infuse on Apple TV, Fetch on mobile. Knows both ShowRSS and Chill — first Berlin user who knew both. Suggested promoting open-source projects around put.io on HackerNews.

### Andrea Franke
Agile team lead at N26. German. Jesse's colleague Eric (EyeEm, whose tweet is on landing page) also joined. Shared account. **Loves put.io's humor and copy** — quotes "Did we take your money in vain?" to friends. Stalked the About page. Once considered applying to work at put.io and moving to Istanbul. Started using Chill after Jesse mentioned it. Noted that RSS automation and favorite tools page descriptions aren't clear enough. Asked about longer trial period. Asked deep questions about the company's future.

### Thomas Kollbach
Managing Director at evenly (mobile dev agency). 100GB monthly subscription since 2013. Biggest client: Berlin Philharmonic Orchestra — builds their iOS/tvOS apps. Uses Chill, iPhone, Apple TV. "You cover everything I need functionally." Had enthusiastic technical discussions about iOS/tvOS ecosystem — people at the next table left because of the noise. Invited to WWDC watch party at their office.

### Vitalii Zurian
Maker, ex-Ukraine. Builds JIRA plugins full-time. 100GB yearly one-time. Found put.io by comparing seedbox services — best storage/price ratio. Favorite features: instant download, generous seeding for private trackers. Lives outside Berlin with better internet (200 Mbit), downloads originals and watches via VLC. Wants sync tool. Suggested targeted campaigns for less technical users with custom landing pages. Also suggested referral rewards for both referrer and referee.

### Steffen Baumgarten
Entrepreneur, native Berliner. Dating app infrastructure company. Discovered put.io 5+ years ago while researching adult content streaming (Spotify-like model). Uses ThePirateBay. Tried looking at Favorite Tools page but "too much content, hard to choose" — suggested App Store-style showcasing with detailed reviews. Trial idea: free tier with 10-minute streaming limit, then paywall. Offered to help with affiliate program design. Suggested advertising on warez/adult sites.

### Serkan Mutlu
Product designer at Zalando. Turkish. **User ID 177** — one of the first 50 users. Former journalist (Galatasaray University), worked at verkac.com (pilli's old football site), wrote for Bant Mag. Uses 1337x. Saw Chill but didn't trust it until explained. Web, Android (responsive), Android TV, LG webOS. Many UI suggestions. Suggested more aggressive landing page copy and campaign-specific landing pages. **Offered to do some design work in spare time** — potential quarter-time design partner candidate.

---

## Appendix C: Behavioral Patterns

| Pattern | Description | Design Implication |
|---|---|---|
| Stash and forget | Users save things they might never watch. Storage is emotional. | Storage shouldn't feel like a meter running out. Show value, not pressure. |
| Binge trigger | Download on metro, watch at home. The gap between "want" and "ready" is the product. | Transfer progress should feel satisfying, not anxious. |
| Physical evangelism | Voucher handoff triggers more excitement than any feature. Word of mouth is physical. | Design the referral moment. Make sharing feel premium. |
| Legal anxiety | Even technical users feel uneasy. Chill looking sketchy compounds this. | Premium design = implicit trust. Craft communicates legitimacy. |
| Netflix replacement | Many cancelled streaming services. put.io is primary entertainment source. | Take the responsibility seriously. This isn't a side tool. |
| Feature archaeology | Users discover features by accident after years. | Progressive disclosure over documentation. Right feature, right moment. |
| The torrent wall | "I tried to explain but they don't know what a torrent is." Growth dies here. | Chill (or equivalent) must abstract torrents completely for newcomers. |
| Platform stacking | Power users chain put.io → NAS → Plex/Infuse → TV. | Don't fight this. Make the handoff smooth. WebDAV/API reliability matters more than in-app player for this segment. |

---

## Appendix D: Product Context from Notion

### Quick Wins (internal backlog, design-relevant)
- **"Siyah search bar'ın dominasyonu"** — search bar takes too much visual weight. Search is barely used but dominates the UI. Swap prominence with "new transfer" (the most common action). Internal note: "Eski Quake oyunlarında tilde'ya basınca açılan console gibi" — the search bar evokes that feel. Worth exploring.
- **Folder-level sorting** — users want per-folder sort preferences
- **"Sharing with everybody" not clear** — users don't understand the sharing UI
- **iOS login form UX** — embarrassingly bad compared to web. Needs label-above-input pattern. 1Password integration can be removed (OS-level autofill handles it now)
- **"Get rid of Friendships and Sharing"** — old social features that never took off (average user has 0.05 friends). Twitter poll was unanimous: "Kill it." Friendships removed Oct 2019, "Share with someone special" kept
- **Sync tool / executable** — requested by users with poor internet (download at work, watch at home)
- **Browser extension opportunity** — "Visit a page and see everything put.io can download from it." Underexplored growth vector
- **rclone integration** — PR to add put.io API to rclone, replacing WebDAV dependency. Enables easier mounting + Plex

### Sharing Vision (from Notion — Hasan's thinking)

"Sharing bizim gizli silahımız." Three types identified:

1. **Folder following** — invite someone to follow your folder. You maintain it, they consume. Currently exists but users forget others are following them ("abi şu filmi niye sildin ya"). Design needs: notifications when followers engage, emoji reactions for dopamine loops

2. **Collaborative folders** — multiple maintainers building a collection together. Potential hidden gem: season-by-season curated libraries that people subscribe to. Storage challenge: split storage cost among maintainers as incentive to invite friends

3. **Casual one-time sharing** — "Share with someone special" but better. Time-limited, put.io hosts the data so sharer can delete their copy. Size limit ~10-14GB (one season of a show). Time limit ~48-72 hours — enough to download, not to leisurely stream. Non-users get a slightly degraded experience to drive signup: "Üye olsan bunları anında kendi diskine kopyalayabilirsin"

**Actual storage transparency idea**: Show users their real storage usage (deduplicated) instead of sum of file sizes. "Since the beginning, our dream was unlimited storage. This isn't that announcement, but a step in that direction." Transparent and classy vs. marketing-y "unlimited" claims.

### Trust & Security (design-relevant)
Compromised accounts are a real problem. Hackers access leaked credentials, upgrade to 10TB plans, create family accounts for themselves. Worst case: users discover this via bank statements. Some leave forever.

The PWNED problem is documented thoroughly:
- Users reuse passwords from breached services
- Hackers find active subscriptions, upgrade to 10TB ($499), create 9 family accounts
- Worst UX: discovering via bank statement
- Previous mitigation: one-time HIBP scan + email (years ago)
- Currently warning on registration for known-leaked passwords
- No periodic scan of existing passwords

Solutions being considered (all design-relevant):
- **Email confirmation for plan changes** — friction, but necessary
- **Lock destructive actions for suspicious sessions** — "confirm session" link in login emails
- **Re-enter payment for upgrades** — prevents hackers from spending victim's card
- **2FA** — in progress but opt-in
- Rate limiting: IP-based, OAuth token, username, download (unique IP per user), all documented

Design implications:
- Plan change flow needs visible friction (confirmation step, re-enter payment)
- Session management needs to be visible and easy
- "Suspicious activity" warnings need to be prominent, not buried in email
- Security features (2FA, session confirmation) currently opt-in — design should encourage adoption without forcing

### Product Specs (partially fleshed out)
- **Perfect Share with Mom** — sharing videos with non-users via simple links. Metrics: stranger→signup, links created per user, consumers per link, source of shared video. Out of scope: non-video files
- **Privacy Tweaks** — folder-level passwords/privacy. Risk: makes account sharing with strangers too easy. Out of scope: 3rd party integrations, sole users
- **New Plans & Pricing** — restructuring to align plans with user types. Moving to Paddle Billing. Mockup exists: https://v0-vercel-pricing-page.vercel.app/
- **Pricing motivation**: "Planlarımızı kullanıcı türlerine göre yeniden konumlandırmak istiyoruz" (reposition plans by user type) — directly connects to personas

### Tone of Voice (from existing copy)

The 10th birthday email is the best example of put.io's voice:
> "Hey there sport! 🥃 How you doin? 🥃 Here is a moment that needs to be taken and not squandered. It's been 10 years since you signed up to put.io. Can you frakking believe this? 10 gorram years…"

Characteristics:
- Casual, warm, nerdy (Battlestar Galactica references: "frakking", "gorram")
- Whiskey emoji as punctuation
- Generous (free year of 1TB as loyalty gift, $199 value)
- Transparent about money and value
- Self-deprecating humor
- Heart emoji as sign-off

The winback email to churned free-trial users:
> "It seems that you wanted to give put.io a try, created an account but noped out of here (veya said 'Hell No!' veya 'Hard pass!') when you realised it was a paid-only service."

This voice should inform the design system's microcopy patterns.

### Discount & Retention Copy (design-relevant)

Discount codes reveal brand personality and pricing psychology:
- **HEISENBERGHAT** (15%) — loyalty discount for returning users
- **SOMOSBANDIDOS** (25%) — for 1+ year users on 1TB/10TB plans ("We are bandits" in Spanish)
- **NEOLACAKBUDOLARINHALI** (35%) — Turkey-specific, auto-triggered by Turkish IP ("What's going to happen to these dollars" — a Turkish economic joke)
- **10TBABY** ($100 off) — first-time 10TB yearly upgrade

The naming convention alone tells you about the brand: playful, multilingual, self-aware about the legal grey zone. This voice should carry into the design system's microcopy.

### Referral Program (Bring Your Friends)

"Doesn't it make you crazy when your friends say 'Isn't torrenting free? Why should I ever pay?' after you just told them how awesome put.io is?"

Model: Give friends 1 free month, get $9.99 credit for each who stay. Requires credit card upfront. Metrics tracked: % giving vouchers, % converting to accounts, % staying as subscribers, total cost. References: Monzo, Calm referral programs.

### Winback Copy (churned free-trial users)

15 days added to accounts that signed up but left when they saw it was paid-only. Email includes custom illustrations showing the user's username.

### Good Copy/Design References (internal moodboard)
- Dead Happy Life Insurance — [image in Notion]
- Rogue Amoeba — "Strange name. Great software." (https://rogueamoeba.com/company/)
- Twitter testimonial collections: https://twitter.com/putdotio/timelines/546273235483242496 (homepage), https://twitter.com/putdotio/timelines/969500554400534528 (pricing)

### Repository Strategy
Design tokens will live in `putdotio/putio-design`:
- Source: DTCG spec JSON tokens (colors, spacing, radius, typography)
- Tool: Style Dictionary (same approach as Jellyfin)
- Outputs: CSS/SCSS (web), Swift (iOS), Compose/XML (Android)
- Existing `@putdotio/colors` has semantic Radix-based system (light + dark) to extract from
- Also includes fonts (GT America, Flaticons)
- Reference: github.com/jellyfin/jellyfin-design

---

## Appendix E: Quotes Worth Keeping

| Quote | Who | Context |
|---|---|---|
| "It just works!" | Luc van Helfteren | Systems architect, lives on a river boat |
| "Instant Torrents" | Luc van Helfteren | Suggested brand positioning |
| "I thought you were a British company with 100 people" | Matteo Koczorek | iOS engineer at Zalando, Berlin |
| "Chill looked like a ready-made template, didn't feel secure" | Kemal Bay | Technical lead, Berlin |
| "The ⬇️ icon made me think it'd download to my computer" | Andrew Sinn | Maker/designer, Berlin |
| "Just one button: Download to put.io" | Jesse Box | UI Designer at EyeEm, Berlin |
| "Safe, because Turks thought of the legal details" | Kemal Bay | Implicit trust in the team |
| "I cancelled Netflix and Amazon Prime" | Helen Stead | Web designer, Berlin |
| "Word of mouth from a friend at lunch was more impactful than any online ad" | Matteo Koczorek | Berlin |
| "We changed 3 buttons' colors in 4 weeks" | Matteo Koczorek | What he imagined put.io's pace was |
| "Google cache'inden TPB kullanmak bıktırıyor" | Matteo Koczorek | On discovering Chill |
| "I pay because I enjoy curating my collection" | Tobias Slater | Archivist persona, London |
| "Android is disgusting" | Andrew Sinn | Refuses to use his Sony Android TV |
| "3 ayı bedavaya getirdik!" | Kemal Bay | On receiving voucher cards |

---

## Appendix F: Linear Issues (design-relevant)

### Frontend (UI) — Active/Backlog

**SDK Overhaul (current priority):**
- UI-1530: Design the new put.io TypeScript SDK
- UI-1531: Build the endpoint matrix for first SDK namespaces
- UI-1532: Classify backend API surface into public, internal, needs-triage
- UI-1533: Evaluate oRPC vs typed HTTP + schema approach
- UI-1534: Design base client contract for new SDK
- UI-1535: Design namespace layout and conditional type strategy
- UI-1536–1541: Harvest contracts + implement Effect namespaces (auth, files, transfers)

**Platform bugs & improvements:**
- UI-731: iOS — folder size doesn't update immediately after removing files
- UI-1529: iOS — disappearing chevron
- UI-1528: FireTV — back button should dismiss playback menu before exiting
- UI-1527: Investigate video can't be cast as HLS
- UI-889: Upgrade to react-native-video@6
- UI-378: iOS — update copyFiles endpoint
- UI-454/455: iOS — task center (UI + logic)

### Customer Success (SUP) — Feature Requests from Users

**File management:**
- SUP-34: Favorite files/folders
- SUP-56: Extract .iso files
- SUP-195: Extract 7-zip files
- SUP-186: Get original URL from transfers
- SUP-187: SHA256 checksum
- SUP-196: Delete all shared files at once
- SUP-194: Split downloads

**Player & media:**
- SUP-52: iOS — autoplay & next episode suggestion
- SUP-191: Android — double tap fast forward/backward
- SUP-200: Android web app — fast forward/backward easily
- SUP-199: iOS — multi-audio for downloads
- SUP-192: iOS — playback speed for audio
- SUP-193: Web — explore alternative audio player placements
- SUP-182: Graphic visualization for music playback

**Sharing & integration:**
- SUP-127: iOS Files integration (assigned to Altay)
- SUP-189: Batch download shared files
- SUP-83: Password-protected folders (To Be Discussed)
- SUP-188: Put-Sync custom folder location (To Be Discussed)
- SUP-198: Support direct download URLs with cookies
- SUP-197: Show bandwidth usage per app/client

### Design Relevance

Many SUP issues directly validate interview findings:
- **SUP-34 (favorites)** ↔ Archivist persona — needs better organization tools
- **SUP-52 (autoplay/next episode)** ↔ Casual Streamer persona — "just press play" expectation
- **SUP-127 (iOS Files)** ↔ Platform stacking pattern — users want put.io in their native file system
- **SUP-83 (password folders)** ↔ Privacy Tweaks spec in Notion — folder-level security
- **SUP-197 (bandwidth per client)** ↔ Pipeline Builder persona — wants power-user visibility
- **SUP-193 (audio player)** ↔ Feature invisibility challenge — audio is an afterthought in the UI

---

_This document is a living reference. Update as new research, decisions, and design iterations happen._
