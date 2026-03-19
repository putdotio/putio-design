---
title: "Flow: Search"
created: 2026-03-19
platforms: [tvOS, Android TV, Fire TV]
---

# Search Flow

## Happy Path

```
Home → Search
  └─ Search Screen
       ├─ Recent searches shown (last 10, stored locally)
       │    ├─ Select recent → execute search
       │    └─ Delete recent → remove from list (swipe tvOS, long-press Android)
       │
       ├─ Keyboard input
       │    ├─ tvOS: system keyboard + Siri dictation
       │    ├─ Android TV: system keyboard + voice button
       │    └─ Fire TV: system keyboard + Alexa voice
       │
       ├─ Submit query
       │    ├─ API: GET /files/search?query=...&per_page=50
       │    ├─ Loading: activity indicator replaces results area
       │    ├─ Results: file list (same component as File Browser)
       │    │    ├─ Select folder → File Browsing Flow
       │    │    ├─ Select video → Playback Flow
       │    │    ├─ Select audio → Audio Player
       │    │    └─ Pagination: cursor-based, load more on scroll
       │    ├─ No results: "No results for '[query]'"
       │    └─ Error: standard error state with retry
       │
       └─ Query saved to recent searches on submit
```

## States

| State | Screen | Focus |
|-------|--------|-------|
| `idle` | Recent searches list | First recent item (or keyboard if none) |
| `typing` | Keyboard active + live input | Keyboard |
| `loading` | Spinner replacing results | None (non-interactive during load) |
| `results` | File list | First result |
| `empty_results` | "No results" message | Back to keyboard |
| `error` | Error state | Retry button |

## Voice Search Integration

```
System voice search (Siri / Google Assistant / Alexa)
  └─ "Search put.io for [query]"
       ├─ App registered as search provider
       ├─ Receives intent with query string
       ├─ Opens app → Search screen → pre-filled query → auto-execute
       └─ Results shown immediately
```

## Focus Behavior

- Enter search: focus keyboard (if no recent searches) or first recent item
- Submit query: focus moves to first result
- No results: focus returns to keyboard input
- Back from result detail: focus the result item user selected
- Clear search: focus keyboard

## Edge Cases

- **Empty query submit** — ignore, stay on keyboard
- **Very long query** — truncate display at ~50 chars, send full to API
- **Special characters in query** — URL-encode, API handles
- **Search while previous search loading** — cancel previous request, start new
- **Offline** — show cached recent searches. On search submit, show network error.
