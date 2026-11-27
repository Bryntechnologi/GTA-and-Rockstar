# Changelog

Version-only release history for CHANNEL SURF.

## v1.0.0 — Initial public build

### Added

- Lore-first home page with a dedicated home theme.
- Games hub with static, theme-per-game pages in release order.
- Rockstar Elsewhere dossier for Max Payne, Manhunt, Midnight Club, and L.A. Noire.
- Lore archive with era/type filters, search, sources, and optional live Wikipedia and GTA Wiki summaries.
- In-universe story timeline carousel with era-following themes and spoiler controls.
- Static, scroll-driven story reading timeline and full-text archive.
- Interactive Leonida atlas with optional Leaflet mode and Geo-Guess.
- Real vs Reel page with MapLibre/OpenFreeMap and comparison cards.
- Trivia Arena modes: Classic, Blitz, Sudden Death, Mythbuster, Channel Surf, and Daily.
- Vault Cracker, Heat Grid, and Clue Dossier puzzles, plus a crew and heist splitter.
- Global search, fuzzy static-page search, and a keyboard command palette.
- Self-hosted open-licence fonts with per-era pairings.
- Local Wikimedia Commons imagery with visible credits and a dedicated credits page.
- Generated SVG character portraits.
- Themed scrollbars, footer atmosphere, and crossfading theme transitions.
- PWA manifest, maskable icons, app-shell service worker, and offline fallback.
- Universal header, footer, breadcrumbs, and a site-wide theme tuner on static pages.
- Related-entry links, source links, and outbound further-reading links.
- Static game, story, Elsewhere, archive, changelog, contact, credits, sitemap, robots, and llms.txt outputs.
- jsdom regression tests, Playwright fallback/transition tests, and header breakpoint snapshots.

### Changed

- Rebuilt the header as a single bar with a game-signal popover.
- Made game pages and local JSON the primary content sources, with fetch fallbacks.
- Simplified UI copy and removed decorative counters and slogan-style headings.
- Updated the game library to real release order.
- Moved Signal Radio to the home page.
- Clarified that the signal selector changes both theme and game focus.
- Moved the changelog to a version-only format.
- Marked the archive as partial and linked the project to Brynsites.

### Fixed

- Theme restoration when leaving lore, story, and trivia views.
- Manual theme selection overriding content previews.
- Duplicate and legacy font and image paths.
- Offline and blocked-network fallbacks for lore, maps, and radio.

### Notes

- No GTA screenshots, official artwork, audio, or proprietary fonts are included.
- All trivia, lore summaries, code, CSS, and vector art are original.
- Production domain and project umbrella naming are intentionally pending.

## v0.1.0 — Prototype

### Added

- Initial SPA shell with home, games, lore, story, atlas, Real vs Reel, arcade, and about views.
- First era themes and the game-signal tuner.
- Local JSON content for lore, story beats, trivia, atlas entries, and games.
- Self-hosted open fonts and generated SVG avatars.
- Initial static archive, story reading page, sitemap, robots file, and PWA shell.
- First jsdom and browser regression tests.

### Changed

- Started with a lore-first navigation model instead of an arcade-first one.
- Kept all content client-side and static-host friendly.
