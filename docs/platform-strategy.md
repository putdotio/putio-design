---
title: "put.io — Platform Strategy"
created: 2026-03-19
status: draft
---

# put.io — Platform Strategy

Architecture, implementation approach, and engineering decisions for the put.io rewrite.

**Related docs:**
- [Design Brief](design-brief.md) — product context, personas, principles
- [TV App Spec](specs/tv-app.md) — complete spec for the first platform (tvOS + Android TV)
- [Design System](design-system.md) — current state audit

---

## Where We Are

- Altay leads all frontend + native apps **solo**
- No dedicated designer, no dedicated platform engineers
- **Code is cheap now.** AI coding agents (Codex, Claude Code) can implement specs across platforms in parallel
- Web app: React + theme-ui + Emotion, migrating to Tailwind/CVA
- iOS/tvOS: native Swift (iOS app built 2017, still works)
- Android/Android TV: native Kotlin (TV uses React Native via `tv-native`)
- Roku: exists but minimal
- Browser extensions: web
- SDK: TypeScript (Effect-based rewrite in progress — currently just OAuth2 + client)
- Design: 376 HTML prototypes across 11 design variants, 9 platforms — produced by AI, not yet validated
- **Going open source** — the SDKs and potentially the apps

## The Core Insight

The old constraint — "small team can't maintain native apps for every platform" — is dissolving. With:
1. **Well-written specs** as the source of truth
2. **AI agents** that can implement those specs across platforms
3. **Open source** community contributions
4. **Native SDKs** as the shared layer

...the economics of "native everywhere" change fundamentally. The bottleneck moves from "writing code" to "writing specs and reviewing code."

## The Core Question

~~How do we ship a cohesive design across every platform without drowning a tiny team?~~

How do we define put.io's UI so precisely that agents and contributors can implement it natively on any platform?

---

## The Strategy: Spec-Driven Native

This is a full rewrite. Not an evolution — a reshape. The current apps work but they're 7+ years old, designless, and siloed. We're going to do it right.

### Architecture

```
putio-design/        → tokens, component specs, flow specs, platform guides (THIS REPO)
putio-sdk-ts/        → TypeScript SDK (Effect-based, open source)
putio-sdk-swift/     → Swift SDK (open source)
putio-sdk-kotlin/    → Kotlin SDK (open source)
putio-ios/           → SwiftUI (iOS + tvOS + visionOS) — NEW, vlc-kit for full-res playback
putio-android/       → Compose (Android + Android TV) — NEW
putio-web/           → React/Next.js — NEW or major evolution
putio-tv-web/        → lightweight JS (Tizen, LG webOS, Vizio, Vidaa) — NEW
putio-extensions/    → browser extensions
putio-roku/          → BrightScript (if demand proves it)
putio-cli/           → terminal client
```

### Why This Works Now (And Didn't Before)

**"Every feature ships N times"** — Yes, but an agent takes a component spec and produces a Swift PR + Kotlin PR + web PR + TV PR in parallel. Review is the bottleneck, not implementation. One human reviews, agents implement.

**"Spec maintenance is a full-time job"** — Specs ARE the product. When you change a spec, agents propagate the change. The spec repo is the monorepo of intent. Make it open source and the community helps maintain it.

**"Need platform knowledge across 4+ stacks"** — Agents have it. You need one person who understands the platform well enough to review. That person is Altay.

**"SDK-first is deceptively hard"** — The TypeScript SDK rewrite is already in progress (Effect-based). Swift and Kotlin SDKs are well-understood patterns. Open-source them and the community helps.

**"You're rewriting working software"** — Yes, deliberately. The iOS app is from 2017. The Android TV app is RN projected onto a TV. The web app is a generic shadcn file manager. They all work, but put.io deserves to feel like put.io.

### The VLC-Kit Angle

Current tvOS player uses AVPlayer, which requires HLS transcoding for many formats. VLC-kit plays virtually anything natively — MKV, x265, DTS, you name it. This means:
- No server-side transcoding needed
- Full resolution playback of original files
- Massive reduction in server compute costs
- Better user experience (no "converting..." wait)

This alone justifies a native tvOS rewrite. And if it works on tvOS, it works on iOS too.

### What Open Source Enables

- **SDKs** — community builds wrappers for platforms we don't cover (Python, Go, Rust)
- **Specs** — community proposes component improvements, catches edge cases
- **Apps** — community contributes platform-specific fixes (someone with a Roku will fix Roku bugs)
- **Credibility** — put.io becomes a reference implementation for spec-driven multi-platform development
- **Hiring signal** — "we build in public" attracts engineers who care about craft

---

## The Spec Layer

Inspired by OpenAI Symphony. The spec repo is the single source of truth.

Full spec with design tokens, i18n strings, SDK types, component specs, flow specs, and error maps: **[TV App Spec → Shared Contracts](specs/tv-app.md#shared-contracts)**

The pattern: define tokens/types/strings once in `putio-design`, generate platform-specific outputs (Swift enums, Kotlin objects, CSS vars, JSON). Each native app consumes generated artifacts, not shared code.

---

## Feature Matrix

The core features that every native app (iOS, tvOS, Android, Android TV) must implement. Each feature gets a spec.

| Feature | Description | Platforms | Notes |
|---------|-------------|-----------|-------|
| **Auth** | Login, signup, token-based device auth (TV) | All | TV uses code pairing, mobile uses OAuth |
| **Navigation** | File browser — folders, files, breadcrumbs | All | D-pad on TV, touch on mobile, click on web |
| **Search** | Full-text search across files | All | Search history, recent queries |
| **Conversion flow** | Status of file conversion (HLS generation) | Web, TV-web only | Native apps with VLC-kit skip this entirely |
| **Video playback** | Play video files with subtitle + audio track selection | All | VLC-kit (iOS/tvOS), libVLC (Android), Shaka/HLS.js (web/TV-web) |
| **Audio playback** | Play audio files, background playback on mobile | Mobile, web | Now Playing UI, lock screen controls |
| **History** | Recently played/accessed files | All | Synced via API |
| **Continue watching** | Resume playback from last position | All | Per-file timestamp stored server-side |
| **Settings** | Account, playback preferences, storage info | All | Platform-native settings patterns |

### Platform-specific features (not shared)

| Feature | Platform | Notes |
|---------|----------|-------|
| Offline downloads | iOS, Android | Download files for offline playback |
| Background audio | iOS, Android | Continue playing when app backgrounded |
| Widgets | iOS, Android | Quick access to recent files, transfer status |
| Share extension | iOS, Android | "Open in put.io" from other apps |
| Browser extension | Web | Magnet link interception |
| AirPlay / Chromecast | iOS, Android | Cast to external displays |
| HDMI audio passthrough | tvOS, Android TV | DTS-HD, TrueHD, DD+ via libVLC/VLC-kit |
| Siri / Shortcuts | iOS, tvOS | "Play my latest download on put.io" |
| Picture-in-Picture | iOS, tvOS, Android | System PiP for video |

### The VLC-kit difference

With VLC-kit/libVLC on native apps, the **conversion flow feature disappears entirely** for native platforms. Users never see "converting..." again. This is the single biggest UX improvement in the rewrite.

Web and TV-web still need HLS (server-generated), so the conversion flow remains there — but native app users get instant playback of any format.

---

## TV Platform Strategy

### Tier 1: Native
- **tvOS** — SwiftUI + VLC-kit. Full-res playback without transcoding. This is the flagship TV experience.
- **Android TV / Fire TV** — Compose. Covers the cheap streaming stick market.

### Tier 2: Web-Based TV (single codebase)
- **Samsung Tizen** — largest smart TV market share, Chromium webview
- **LG webOS** — Chromium webview
- **Vizio SmartCast** — Chromium webview
- **Hisense Vidaa** — Chromium webview

All Tier 2 platforms are embedded browsers. One lightweight web app covers all.

**Framework options:**

| Framework | Renderer | Performance | Team fit | Pick if... |
|-----------|----------|-------------|----------|------------|
| React + Norigin Spatial Nav | DOM | Good | High (React team) | Ship fast, good enough perf |
| Lightning 3 | WebGL | Best | Medium (new paradigm) | Need 60fps on weak chips |
| Vanilla JS/TS | DOM | Great | High | Want zero deps, full control |

Start with React + Norigin (lowest risk). Evaluate Lightning if performance isn't good enough.

### Tier 3: Deferred
- **Roku** — BrightScript, separate stack. Only if user demand proves it. Community could build this if specs + SDK exist.
- **Xbox** — React Native Windows is an option. Or browser app via Edge. Defer.
- **PS5** — Browser only, no app platform.
- **visionOS** — SwiftUI, shares with iOS. Cool but tiny market. The spatial player prototype exists. Revisit 2027.

---

## What We Have Already

The design exploration produced:
- 376 HTML prototypes across 11 visual directions
- 4 core design variants (Clean Modern, Monospace, Brutalist, Editorial) + 7 additional explorations
- Component inventory across web, iOS, Android, TV, watchOS, visionOS
- Design decisions documented (`docs/decisions.md`)
- 4 personas from 61 real user interviews (Pipeline Builder, Casual Streamer, Archivist, Evangelist)
- 24 user needs distilled from interviews
- Full UI audit of current product
- Linear issues mapped to personas

**What's missing:**
- Validated design direction (which variant? hybrid?)
- Design tokens as a consumable package
- Component specs (the Symphony-style contracts)
- Flow specs (state machines for every user journey)
- SDK: TypeScript is in progress, Swift and Kotlin don't exist yet
- TV-web prototype tested on real hardware
- VLC-kit proof of concept on tvOS

---

## The Agent Workflow

This is how a feature ships in this new world:

```
1. Write/update component spec in putio-design
2. Agent reads spec → generates implementation PRs for each platform
3. Agent runs tests, lints, builds
4. Human reviews PRs (one person, multiple platforms)
5. Merge → CI/CD → ship
```

For a new screen like "Storage Dashboard":
1. Write the spec: what it shows, what actions it has, what data it needs
2. Agent produces: SwiftUI view, Compose screen, React component, TV-web page
3. Each PR references the spec. Each implementation follows platform conventions.
4. One review pass. Ship everywhere.

The spec is the feature. The code is the artifact.

---

## Infrastructure: Feature Flags & Remote Config

Current TV app uses a homegrown remote config. For the rewrite, adopt a proper feature flag service.

**Recommendation: Statsig**
- Feature flags + experiments + analytics in one
- Ties flags to metrics natively — flip VLC-kit on for 10% of users, automatically see if crash rate changes
- SDKs for Swift, Kotlin, JS, React — covers all platforms
- Free tier is generous for put.io's scale

**Alternatives:**
- PostHog — open source, self-hostable, flags + analytics + session replay
- LaunchDarkly — industry standard, expensive
- Unleash — open source, just flags, simple

**Use cases:**
- Phased VLC-kit rollout (percentage-based, per-platform)
- A/B test home screen layouts
- Kill switch for features during incidents
- Per-user overrides for beta testing
- Tunnel route recommendations by region

---

## Risks & Open Questions

### Real Risks
- **Agent code quality** — agents produce code fast but it needs review. Without good review, you ship mediocre software 4x as fast.
- **Spec-to-implementation gap** — specs can't capture everything. Platform-specific edge cases still need human judgment.
- **VLC-kit on tvOS** — needs a proof of concept. Licensing (LGPL) implications for App Store distribution.
- **Open source maintenance** — community contributions need review capacity. More repos = more surface area.
- **Design direction** — 376 prototypes is exploration, not a decision. Need to converge before building.

### Open Questions
- [ ] Which design variant wins? Or is it a hybrid?
- [ ] VLC-kit PoC: does it work on tvOS? App Store LGPL compliance?
- [ ] TypeScript SDK: how far along is the Effect rewrite? Timeline to v1?
- [ ] What's the actual user demand for Tizen/LG/Vizio?
- [ ] Should the apps be open source too, or just the SDKs and specs?
- [ ] Roku: skip entirely or let community build it from specs?
- [ ] How to handle platform-specific features that don't map to a shared spec? (e.g., iOS Shortcuts, Android widgets, TV voice search)

---

## Proposed Next Steps

1. **Converge on design direction** — pick a variant or hybrid from the 376 prototypes
2. **Extract design tokens** — machine-readable, consumable by all platforms
3. **Write 5 core component specs** — FileRow, TransferCard, Player, Sidebar, StorageDashboard
4. **VLC-kit PoC on tvOS** — can it play MKV/x265/DTS natively? App Store implications?
5. **TypeScript SDK v1** — finish the Effect-based rewrite, open source it
6. **TV-web PoC** — React + Norigin, file browser + player, test on Tizen emulator
7. **Present to team** — this doc + prototypes + direction as RFC
8. **Start building** — specs first, agents implement, human reviews

---

*This is a reshape, not a refactor. put.io is 15 years old and has never had a design voice. It's time.*
