---
title: "The Future of put.io UI — Platform Strategy & Design System"
created: 2026-03-19
status: draft — open for discussion
---

# The Future of put.io UI

A combined design + engineering strategy document. Not a decision — a discussion starter.

---

## Where We Are

- ~6 people, Altay leads all frontend + native apps solo
- No dedicated designer, no dedicated platform engineers
- Web app: React + theme-ui + Emotion, migrating to Tailwind/CVA
- iOS/tvOS: native Swift
- Android/Android TV: native Kotlin (TV uses React Native via `tv-native`)
- Roku: exists but minimal
- Browser extensions: web
- SDK: TypeScript (Effect-based rewrite in progress)
- Design: 376 HTML prototypes across 11 design variants, 9 platforms — produced by AI, not yet validated

## The Core Question

How do we ship a cohesive design across every platform without drowning a tiny team?

---

## Option A: Spec-Driven Native (The Ideal)

Each platform gets a native app built to a shared spec.

```
putio-design/        → tokens, component specs, flow specs, platform guides
putio-ios/           → Swift/SwiftUI (iOS + tvOS)
putio-android/       → Kotlin/Compose (Android + Android TV)
putio-tv-web/        → lightweight JS (Tizen, LG webOS, Vizio, Vidaa)
putio-web/           → React (existing, evolved)
putio-roku/          → BrightScript (if worth it)
```

**What you get:**
- Platform-native UX everywhere. SwiftUI on iOS feels like iOS. Compose on Android feels like Android.
- Performance. No framework abstraction layer on TV.
- Clean SDK extraction. Native SDKs (Swift, Kotlin, JS) become the shared layer; apps are thin UI shells.
- Symphony-style specs mean any engineer (or AI agent) can implement a screen from a contract.
- Future-proof: new platforms (visionOS, CarPlay, Xbox) just need a new thin UI layer on the SDK.

**What it costs:**
- Every feature ships N times. "Add subtitle picker" = Swift PR + Kotlin PR + web PR + spec update.
- Spec maintenance is a real job. Specs drift immediately without enforcement. Who owns this?
- Need platform knowledge across Swift, Kotlin, web, and maybe BrightScript. For a 6-person team, that's brutal.
- You're rewriting working software. The current apps aren't great, but they work. Multi-year commitment.
- SDK-first is deceptively hard. Bad SDK under time pressure = bad apps on top.

**Honest risk:** This is how Spotify and Netflix do it. They also have 50-200x your headcount. The architecture is right but the execution requires either hiring or extreme discipline.

---

## Option B: React Native Hybrid

Shared RN codebase for mobile + TV, web stays React.

```
putio-mobile/        → RN (iOS + Android)
putio-tv/            → RN (tvOS + Android TV) + RN Web (Tizen, LG, etc.) + RN Windows (Xbox)
putio-web/           → React (existing)
putio-roku/          → BrightScript
```

**What you get:**
- Code sharing across mobile + TV.
- One component library, one design system implementation.
- Smaller team can move faster on features.

**What it costs:**
- RN on TV is pain. Callstack's showcase: 10.9s TTI on Tizen. put.io's audience would riot.
- "Write once" becomes "debug everywhere." Platform quirks leak through constantly.
- TV UX paradigms (D-pad, 10-foot UI, focus management) are fundamentally different from mobile touch. Sharing components across these is a lie.
- You lose native platform feel. RN apps feel like RN apps, not iOS/Android apps.
- Throwing away working native Swift and Kotlin code.

**Honest risk:** You save on initial dev but pay in maintenance, performance debugging, and user experience. For a product whose users are technical and opinionated, "kinda works on every platform" might be worse than "great on fewer platforms."

---

## Option C: Pragmatic Native + Web TV (The Recommendation)

Keep native where it matters, add a lightweight web app for the long tail of TV platforms.

```
putio-design/        → tokens, component specs, flow specs (source of truth)
putio-ios/           → Swift/SwiftUI (iOS + tvOS) — evolve existing
putio-android/       → Kotlin/Compose (Android + Android TV) — evolve existing
putio-tv-web/        → lightweight web (Tizen, LG, Vizio, Vidaa) — NEW
putio-web/           → React (existing, evolved with new design system)
putio-extensions/    → browser extensions (existing)
```

Skip: Roku (US-centric, BrightScript hell, tiny put.io overlap), Xbox (browser app sufficient), Windows desktop (web app), visionOS (wait for market).

**Why this works for put.io specifically:**
- You already have native iOS and Android. Don't throw them away. Evolve them.
- The web app is your primary interface. It gets the most design investment.
- TV web app is new but simple — file browser + player, D-pad nav. React + Norigin Spatial Navigation or Lightning JS. Ship in weeks.
- ~6 people can realistically maintain 4 codebases (iOS, Android, web, TV-web) if the specs are clear.
- SDKs emerge naturally from the native apps — extract common API/model layers over time.

**What changes from today:**
1. `putio-design` becomes the canonical spec repo (it's already started)
2. Design tokens ship as packages consumable by all platforms
3. Component specs are written before implementation — "what does TransferCard show and do?"
4. New TV-web app covers Tizen/LG/Vizio with a single lightweight codebase
5. Existing native apps evolve with new design language, not rewritten

**What stays the same:**
- Swift for iOS/tvOS
- Kotlin for Android/Android TV
- React for web
- The team

---

## The Spec Layer (Applies to Any Option)

Regardless of implementation strategy, the spec layer is the unlock. Inspired by OpenAI Symphony.

### Design Tokens (machine-readable)
```
colors:
  brand-yellow: "#FDCE45"
  surface-primary: {dark: "#0A0A0A", light: "#FFFFFF"}
  ...
typography:
  heading-1: {family: "GT America", weight: 700, size: 28, lineHeight: 34}
  ...
spacing:
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32
motion:
  duration-fast: 150ms
  easing-default: cubic-bezier(0.4, 0, 0.2, 1)
```

### Component Specs (human + machine readable)
```yaml
TransferCard:
  description: Shows a single transfer's status
  props:
    title: string          # parsed filename or raw
    progress: 0-100        # percentage
    speed: string          # "2.4 MB/s" or null
    health: low|medium|high
    status: downloading|seeding|completed|error
  states:
    - idle: shows progress bar, speed, health dot
    - error: red health dot, error message, retry action
    - completed: checkmark, "Ready to stream" or file size
  actions:
    - tap/click: navigate to file
    - long-press/right-click: context menu (pause, remove, retry)
  platform notes:
    - iOS: UICollectionViewCell, swipe actions
    - Android: RecyclerView item, Material 3 card
    - TV: focusable row item, D-pad select = navigate
    - Web: table row or card depending on viewport
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

## TV Platform Deep Dive

### Tier 1: Native (already owned)
- **tvOS** — Swift, existing app, evolve with new design
- **Android TV / Fire TV** — Kotlin, existing app, evolve with new design

### Tier 2: Web-based TV (new)
- **Samsung Tizen** — Chromium webview, largest smart TV market share
- **LG webOS** — Chromium webview
- **Vizio SmartCast** — Chromium webview
- **Hisense Vidaa** — Chromium webview

All Tier 2 platforms are just embedded browsers. One web app covers all of them.

**Framework options for TV-web:**

| Framework | Renderer | Performance | Learning curve | Community |
|-----------|----------|-------------|---------------|-----------|
| React + Norigin | DOM | Good | Low (team knows React) | Active |
| Lightning 3 | WebGL | Best | Medium (new paradigm) | Niche but backed by Comcast |
| Vanilla JS | DOM | Great | Low | N/A |

**Recommendation:** Start with React + Norigin (lowest risk, team already knows React). If performance isn't good enough on low-end Tizen, evaluate Lightning 3.

### Tier 3: Skip or defer
- **Roku** — BrightScript, completely separate stack, US-centric market. ROI questionable.
- **Xbox** — Browser app via Edge is good enough. Native UWP only if user demand proves it.
- **PS5** — No app platform. Browser only.
- **visionOS** — Cool but market is tiny. Revisit in 2027.

---

## What We Have Already

The design exploration produced:
- 376 HTML prototypes across 11 visual directions
- 4 core variants (Clean, Mono, Brutalist, Editorial)
- Component inventory across web, iOS, Android, TV, watchOS, visionOS
- Design decisions documented
- Personas and needs from 61 real user interviews

**What's missing:**
- Validated design direction (which variant? probably a hybrid)
- Design tokens as a package (not just in HTML files)
- Component specs (the Symphony-style contracts)
- Flow specs
- Figma components (Claude created frames but they need human review)
- TV-web prototype on real hardware

---

## Next Steps (Proposed)

1. **Pick a design direction** — review prototypes, converge on one variant (or hybrid)
2. **Extract design tokens** — from chosen direction into `putio-design/tokens/`
3. **Write 5 core component specs** — TransferCard, FileRow, Player, Sidebar, StorageDashboard
4. **Build TV-web proof of concept** — React + Norigin, file browser + player, test on Tizen emulator
5. **Present to team** — this doc + prototypes + direction as "Future of put.io UI" RFC
6. **Iterate** — get buy-in, refine, start implementation

---

## Open Questions

- [ ] Which design variant wins? Clean Modern is safest, Editorial has the most soul. Hybrid?
- [ ] Is the team willing to maintain component specs long-term?
- [ ] What's the actual Tizen/LG/Vizio user demand? Worth the investment?
- [ ] Should SDKs be extracted now or later?
- [ ] How much of the existing native code is worth keeping vs rewriting with new design?
- [ ] Roku: skip entirely or minimal BrightScript effort?

---

*This document is a discussion starter, not a decision. The goal is to align on direction before writing code.*
