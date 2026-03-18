---
title: "The Future of put.io UI — Platform Strategy & Design System"
created: 2026-03-19
status: draft — open for discussion
---

# The Future of put.io UI

A combined design + engineering strategy document. Not a decision — a discussion starter.

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

### Design Tokens (machine-readable)
```yaml
colors:
  brand-yellow: "#FDCE45"
  surface-primary: {dark: "#0A0A0A", light: "#FFFFFF"}
  surface-secondary: {dark: "#141414", light: "#F5F5F5"}
  text-primary: {dark: "#FFFFFF", light: "#0A0A0A"}
  health-good: "#22C55E"
  health-warning: "#EAB308"
  health-error: "#EF4444"

typography:
  heading-1: {family: "GT America", weight: 700, size: 28, lineHeight: 34}
  body: {family: "GT America", weight: 400, size: 14, lineHeight: 20}
  mono: {family: "GT America Mono", weight: 400, size: 13, lineHeight: 18}

spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32}

motion:
  duration-fast: 150ms
  duration-normal: 250ms
  easing-default: cubic-bezier(0.4, 0, 0.2, 1)
```

### Component Specs (human + machine readable)
```yaml
TransferCard:
  description: Shows a single transfer's status
  props:
    title: string          # parsed filename or raw
    progress: 0-100
    speed: string | null   # "2.4 MB/s"
    health: low | medium | high
    status: downloading | seeding | completed | error
  states:
    idle: shows progress bar, speed, health dot
    error: red health dot, error message, retry action
    completed: checkmark, "Ready to stream" or file size
  actions:
    tap: navigate to file
    long-press: context menu (pause, remove, retry)
  platform notes:
    ios: UICollectionViewCell, swipe actions for pause/remove
    android: Material 3 card, RecyclerView item
    tv-native: focusable row, D-pad select = navigate, long-press = options
    tv-web: focusable div, remote OK = navigate, back = exit menu
    web: table row (list view) or card (grid view) depending on viewport
```

### Flow Specs (state machines)
```yaml
Onboarding:
  steps:
    1. auth: login or signup
    2. plan_select: show tiers, allow skip for trial
    3. first_transfer: prompt magnet link or URL
    4. done: redirect to files
  rules:
    - returning user skips to files
    - plan_select is skippable (trial auto-assigned)
    - first_transfer shows example magnet link as placeholder
```

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
