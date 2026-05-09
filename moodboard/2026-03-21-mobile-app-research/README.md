# Mobile App Research — 2026-03-21

Research session comparing native mobile app design approaches across Linear, Telegram, GitHub, and Mobbin. iOS and Android side-by-side for each app.

## Key Takeaways

- **Linear**: Native apps on both platforms. iOS 26 glass menus. Neutral UI that gets out of the way — "sen ve content arasında olan biten."
- **Telegram**: Built like it follows Apple/Google developer docs directly. No React Native overhead → stable, fast, small. Floating tabbar is nice.
- **GitHub**: Web is great, mobile design system feels inconsistent. Worth studying [Primer](https://primer.style/) design system.
- **Mobbin**: Reference for browsing mobile design patterns.

## Design Principle

> Arayüzü o kadar nötr yapmışlar ki aradan çekiliyor — sen ve content arasında olan biten.

The UI should be so neutral it disappears. What remains is you and the content.

## Files

### Videos (screen recordings)

| App | iOS | Android |
|-----|-----|---------|
| Mobbin | `videos/mobbin-ios.mp4` | `videos/mobbin-android.mp4` |
| Linear | `videos/linear-ios.mp4` | `videos/linear-android.mp4` |
| Linear (glass menus) | `videos/linear-ios-glass-menus.mp4` | `videos/linear-android-2.mp4` |
| Telegram | `videos/telegram-ios.mp4` | `videos/telegram-android.mp4` |
| GitHub | `videos/github-ios.mp4` | `videos/github-android.mp4` |

### Screenshots (extracted frames)

Each video has 4 key frames extracted: `01s`, `quarter`, `mid`, `3quarter`.

Plus: `screenshots/linear-macos-screenshot.jpg` — Linear macOS app screenshot.

## Notes

- iOS 26 native glass menus are already in Linear and our latest TestFlight.
- Floating tabbar pattern worth considering. If too complex on Android, a fixed bottom bar is fine.
- Telegram approach: follow platform conventions closely with native-feeling UI choices.
- GitHub mobile hierarchy matches web but the UI quality drops significantly.
