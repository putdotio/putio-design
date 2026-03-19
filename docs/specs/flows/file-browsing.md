---
title: "Flow: File Browsing"
created: 2026-03-19
platforms: [tvOS, Android TV, Fire TV]
---

# File Browsing Flow

## Happy Path

```
Home Screen
  └─ "Your Files" → File Browser (root, id=0)
       ├─ Folder → File Browser (folder id)
       │    ├─ Subfolder → deeper...
       │    ├─ Video file → Playback Flow
       │    ├─ Audio file → Audio Player
       │    └─ Other file → File Info modal
       ├─ Long-press any item → Action Sheet
       │    ├─ Play (video/audio)
       │    ├─ Info (size, format, date)
       │    ├─ Add to Favorites / Remove
       │    └─ Delete (→ Trash)
       └─ Sort button → Sort Modal → reload list
```

## States

| State | Screen | Focus | Data |
|-------|--------|-------|------|
| `loading` | Activity indicator | None | Fetching first page |
| `loaded` | File list | First item (or last focused on return) | Files + cursor |
| `loading_more` | File list + bottom spinner | Current item | Fetching next page |
| `empty` | Empty state | Back button / parent nav | No files in folder |
| `error` | Error state | Retry button | API failure |

## Navigation Stack

```
Home → Files(0) → Files(123) → Files(456) → Player
  ↑       ↑           ↑            ↑
  back    back        back         back (exit player)
```

- Each folder push adds to the stack
- Back pops one level
- Breadcrumb shows: "Files > Movies > 2026"
- Back from root folder → Home screen

## Pagination

- First page loads on screen mount (50 items)
- Scroll near bottom (5 items from end) → fetch next page
- Append to list, don't replace
- Sort change → reset cursor, reload from page 1
- Pull-to-refresh: N/A on TV. Use "Refresh" button in file actions bar.

## Focus Behavior

- **Enter folder**: focus first item
- **Return to folder** (back from subfolder/player): focus the item user previously selected
- **After sort change**: focus first item
- **Empty folder**: focus back button / parent navigation
- **Long-press action sheet**: focus first action. Dismiss → return focus to item.

## File Type Handling

| File type | D-pad select | Long-press |
|-----------|-------------|------------|
| Folder | Navigate into | Action sheet (info, favorite, delete) |
| Video | → Playback Flow | Action sheet (play, info, favorite, delete) |
| Audio | → Audio Player | Action sheet (play, info, delete) |
| Image | → Full-screen preview | Action sheet (info, delete) |
| PDF/Text/Archive/Other | → File Info modal | Action sheet (info, delete) |

## Edge Cases

- **Token expires while browsing** — 401 → Auth flow. On re-auth, return to Home (don't try to restore deep nav stack).
- **File deleted by another client** — 404 on file access → show toast "File not found", stay in current folder, refresh list.
- **Folder with 10,000+ files** — pagination handles this. Virtualized list keeps memory bounded.
- **Network drop while loading page** — show error state with retry. Keep previously loaded items visible.
- **Filename parsing** — always attempt parse. If parse fails, show raw filename. Never show "Unknown" or blank.
