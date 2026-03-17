# Claude Prompt — put.io Design System

Copy-paste this into Claude with Figma MCP connected.

---

You are a senior product designer tasked with creating a complete design system for put.io — a cloud storage and transfer service that runs on every platform: web, iOS, Android, Apple TV, Android TV, Fire TV, Roku, watchOS, and visionOS.

## Your first task — DO THIS BEFORE ANYTHING ELSE

Read the ENTIRE file `docs/design.md` in this repo. Use your file reading tools to read it fully — it's 1150+ lines and you need ALL of it. Do not skim. Do not summarize. Read every line. This document contains:

- Product context and team (6 people, no designer in 15 years)
- 4 user personas built from 61 real in-person interviews
- 24 specific design needs organized into 10 areas (A through J)
- Platform-specific requirements for every device put.io ships on
- Current UI audit with screenshots in `docs/assets/`
- Current codebase analysis (color system, typography, components, tech stack)
- Design principles, vibe references, behavioral patterns
- Full raw interview notes from London (39 users) and Berlin (22 users)

After reading design.md in full, read `docs/plans/claude-design-execution.md` — it breaks the work into 9 phases.

Also look at every screenshot in `docs/assets/`, `docs/assets/tv-android-screenshots/`, and `docs/assets/android-screenshots/`. These are the current state — your "before" pictures.

Only after reading ALL of the above should you start designing.

## Context you must internalize

**put.io's core problem is discovery, not aesthetics.** 5-year paying users don't know half the product exists. The design system must solve information architecture before making things pretty.

**This is not a web redesign.** put.io lives on every screen. Design for touch (iOS/Android), focus/remote (tvOS/Android TV/Fire TV/Roku), pointer (web), glanceable (watchOS), and spatial (visionOS) simultaneously.

**Brand identity:**
- Primary color: yellow #FDCE45 — sacred, don't change it
- Typography: GT America Standard + Mono (Grilli Type)
- Voice: nerdy, warm, self-aware. Discount codes are named HEISENBERGHAT and SOMOSBANDIDOS. The about page has personality. The app doesn't — fix that gap
- Dark mode is the default. Light mode exists
- Kaomoji in the UI (ᕦ(ò_óˇ)ᕤ), space invader avatars, rainbow iOS icon — these are brand signatures

**The "before" state:**
- Web app: functional shadcn/Radix file manager. Clean but soulless. You could swap the logo and it's any SaaS
- TV app: web projected onto TV. Not TV-native
- Current color system: Radix-based, 12-step semantic scale, 4 namespaces (gray, green, red, yellow)
- Current components: basic (button with 5 variants, input, form, tooltip). Nothing distinctive
- Two styling systems coexist: theme-ui/Emotion (legacy) and Tailwind/CVA (new)

**What users actually said:**
- "It just works!" — but they can't find features
- "Chill looked like a ready-made template, didn't feel secure" — design = trust
- "Just one button: Download to put.io" — simplify ruthlessly
- "The ⬇️ icon made me think it'd download to my computer" — icons lie
- "I thought you were a British company with 100 people" — perception gap is huge
- Multiple users cancelled Netflix for put.io — this is their primary entertainment. Take it seriously

## What to build

Follow the 9-phase execution plan at `docs/plans/claude-design-execution.md`. Each phase has detailed deliverables.

Create a Figma file with these pages:
1. 🎨 Tokens — colors, typography, spacing, icons, elevation
2. 🧩 Components — organized by interaction model (touch, focus, pointer, glanceable, spatial)
3. 📱 Web — 12 screens, light + dark
4. 📱 iOS — 8 screens + widgets + Dynamic Island
5. 📺 tvOS — 6 screens + Top Shelf
6. 📱 Android — 5 screens + notifications
7. 📺 Android TV — 4 screens
8. 📺 Roku / ⌚ watchOS / 🥽 visionOS — 3-4 screens each
9. 🔄 Flows — cross-platform user journeys

## Execution strategy

This is a one-shot run. You should be able to execute the full plan autonomously without human input.

**Work in a loop:**
1. Pick the next phase/chunk
2. Implement it in Figma
3. Review what you just created — does it match the design doc? Does it follow platform conventions? Does it have personality?
4. Fix any issues
5. Verify the result is solid
6. Move to the next chunk

**Spawn subagents when it makes sense.** If you can parallelize work (e.g., iOS screens and Android screens can be designed simultaneously), do it. Each subagent should:
- Read the same design doc for context
- Work on a specific platform or phase
- Follow the same design tokens and principles

**Chunk the work intelligently:**
- Phase 1 (tokens) must complete first — everything depends on it
- Phase 2 (components) must complete before screens
- Phases 3-8 (platform screens) can run in parallel
- Phase 9 (cross-platform flows) comes last, referencing completed screens

**Self-review checklist after each phase:**
- [ ] Light + dark mode for every screen?
- [ ] Consistent token usage (no hardcoded colors/sizes)?
- [ ] Platform conventions followed (HIG/Material/Leanback)?
- [ ] Brand personality present (not corporate, not sterile)?
- [ ] Filenames parsed into readable metadata where applicable?
- [ ] Icons unambiguous (save-to-cloud ≠ download-to-device ≠ play)?
- [ ] Yellow #FDCE45 used correctly as primary accent?
- [ ] Components named cleanly for developer handoff?

**If something is unclear, make a decision and document it.** Don't stop to ask. The design doc has enough context for you to make informed choices. Note your decisions in a "Design Decisions" section at the end of each Figma page.

## Design principles to follow

1. **Utility is beautiful** — file operations should feel premium. Transfer progress, storage, every state change is an opportunity
2. **Respect the power user, welcome the newcomer** — default to simplicity, unlock density
3. **Clarity over cleverness** — every icon, button, label has exactly one meaning
4. **Show, don't document** — features discovered through use, not tooltips
5. **Trust through craft** — premium design = implicit trust. Critical for put.io's legal grey zone
6. **Typography carries the weight** — in a content-agnostic product without posters, type IS the design

## Rules

- Every screen needs light + dark mode
- Name layers and components cleanly for code export
- Follow platform conventions (Apple HIG, Material 3, Leanback) — don't fight the platform
- Reference the existing screenshots in `docs/assets/` as the "before"
- Design tokens should use Style Dictionary-compatible naming
- The yellow (#FDCE45) is sacred. Everything else can evolve
- put.io has personality — the design should too. Not corporate. Not sterile. Warm, nerdy, confident

Go.
