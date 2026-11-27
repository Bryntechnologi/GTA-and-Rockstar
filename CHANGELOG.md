# Changelog

All notable changes to CHANNEL SURF are documented here.

## [1.0.0] - 2026-11-27

### Added

- Lore-first home page with a dedicated home theme.
- Games hub with static, theme-per-game pages in release order.
- Rockstar Elsewhere dossier for Max Payne, Manhunt, Midnight Club, and L.A. Noire.
- Lore archive with era/type filters, search, sources, and optional live Wikipedia summaries.
- In-universe story timeline carousel with era-following themes and spoiler controls.
- Static, scroll-driven `story.html` reading timeline.
- Static full-text `archive.html`.
- Interactive Leonida atlas with optional Leaflet mode and Geo-Guess.
- Real vs Reel page with MapLibre/OpenFreeMap and comparison cards.
- Trivia Arena modes: Classic, Blitz, Sudden Death, Mythbuster, Channel Surf, and Daily.
- Vault Cracker, Heat Grid, and Clue Dossier puzzles.
- Crew & Heist splitter and local stats.
- Global search and keyboard command palette.
- Self-hosted open-licence fonts with per-era pairings.
- Local Wikimedia Commons imagery with visible credit and source links.
- Generated SVG character portraits.
- Themed scrollbars, footer atmosphere, and crossfading theme transitions.
- PWA manifest, maskable icons, app-shell service worker, and offline fallback.
- Static game, story, Elsewhere, archive, sitemap, robots, and `llms.txt` outputs.
- jsdom regression tests, Playwright fallback/transition tests, and header breakpoint snapshots.

### Changed

- Rebuilt the header as a single bar with a game-signal popover.
- Made game pages and local JSON the primary content sources, with fetch fallbacks.
- Simplified UI copy and removed decorative counters and slogan-style headings.
- Updated the game library to real release order.
- Moved Signal Radio to the home page.
- Clarified that the signal selector changes both theme and game focus.

### Fixed

- Theme restoration when leaving lore, story, and trivia views.
- Manual theme selection overriding content previews.
- Duplicate/legacy font and image paths.
- Offline and blocked-network fallbacks for lore, maps, and radio.

### Notes

- No GTA screenshots, official artwork, audio, or proprietary fonts are included.
- All trivia, lore summaries, code, CSS, and vector art are original.
- Production domain and project umbrella naming are intentionally pending.
