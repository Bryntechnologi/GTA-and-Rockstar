# Changelog

Version-only release history for FIVE STAR WANTED.

## v1.3.0 — FIVE STAR WANTED and expanded lore

### Added

- Renamed the project to FIVE STAR WANTED across every page, manifest, metadata, document, cache key, and storage key.
- Expanded the lore archive from 20 to 42 entries across every era, including Classic GTA, Red Dead, Bully, and The Warriors.
- Added source licence and attribution fields for adapted lore entries.
- Added a Rockstar Beyond GTA section to the games hub and expanded Max Payne, Manhunt, Midnight Club, and L.A. Noire into full series dossiers with key-game lists.
- Added a text-sources and licensing section to the credits page.

### Changed

- Franchise entries now use an era-neutral scope and read as Franchise rather than GTA VI.
- Credits page is now Credits, sources and licences.
- Original-writing claims now distinguish original copy from CC BY-SA adaptations.
- Theme changes now use a whole-page crossfade with a slower palette transition instead of an abrupt snap.
- Rockstar Beyond GTA is now part of the main games hub rather than a separate afterthought.
- Follow trivia era now defaults on, including for existing saved settings.
- GitHub links and the local remote point at the renamed FiveStarWanted repository.

### Fixed

- Franchise entries no longer appear mislabelled under GTA VI.
- Old progress migrates through both previous project names.

## v1.2.0 — FIVE STAR WANTED rebrand

### Added

- Renamed the project and all public copy to FIVE STAR WANTED, with fivestarwanted.pages.dev as the assumed deployment URL.
- New GTA-style interface audio: menu blips, confirmations, hover ticks, and radio-static theme changes.
- Legacy progress migration so scores and preferences survive the storage-key rename.

### Changed

- Replaced game-signal and frequency language with game themes throughout the header, home card, trivia, timeline, and docs.
- Renamed the Daily Signal mode to Daily Run and the Channel Surf mode to Full Sweep.
- Renamed Tuned In to Era Tourist and Perfect Signal to Perfect Run.
- Radio remains a separate optional panel for real, licensed streams.

## v1.1.0 — Arcade SEO landing page

### Added

- Crawlable arcade landing page at arcade/ targeting GTA trivia quiz and Rockstar puzzle game searches.
- Crawlable GTA map atlas at atlas/ covering Leonida, Vice City, San Andreas, Los Santos, and Liberty City.
- Crawlable GTA vs real life page at real-vs-reel/ comparing fictional cities with Miami, New York, Los Angeles, and more.
- Arcade page schema, canonical, Open Graph, and Twitter metadata.
- GTA map and comparison schema, canonicals, Open Graph, and Twitter metadata.
- Arcade guide and daily-challenge copy on the interactive arcade view.
- Keyword-first titles and descriptions that drop the brand name from search snippets across every page.

### Changed

- Static-page navigation now links the Arcade entry to the dedicated arcade page.
- Game dossiers link to the arcade page instead of the in-page arcade view.
- Footer attribution now presents the Brynsites network as a visible banner instead of a small pill.
- Removed the decorative grid pattern from the footer background.
- Expanded every page title, description, keyword set, and social card, including Twitter card tags on all generated pages.
- Restructured the About page into project links, project and IP cards, build notes, local data, and a collapsible full disclaimer.

### Fixed

- Sitemap now includes the arcade URL.
- Lore filters and search now clear a selected entry that no longer matches, so stale entries such as Niko Bellic no longer stay open under a Vice City filter.
- The Lore nav item now shows its active state instead of highlighting Games.
- Lore entries now open with a back control, result count, clear-filters action, and a dedicated reading layout.
- The mobile hamburger menu now uses an even grid so every nav item lines up.
- The Brynsites network banner now spans the full footer width.
- About-page progress stats moved from the hero into the Local data card.

## v1.0.0 — Initial public build

### Added

- Lore-first home page with a dedicated home theme.
- Games hub with static, theme-per-game pages in release order.
- Rockstar Beyond GTA dossier for Max Payne, Manhunt, Midnight Club, and L.A. Noire.
- Lore archive with era/type filters, search, sources, and optional live Wikipedia and GTA Wiki summaries.
- In-universe story timeline carousel with era-following themes and spoiler controls.
- Static, scroll-driven story reading timeline and full-text archive.
- Interactive Leonida atlas with optional Leaflet mode and Geo-Guess.
- Real vs Reel page with MapLibre/OpenFreeMap and comparison cards.
- Trivia Arena modes: Classic, Blitz, Sudden Death, Mythbuster, Full Sweep, and Daily Run.
- Vault Cracker, Heat Grid, and Clue Dossier puzzles, plus a crew and heist splitter.
- Global search, fuzzy static-page search, and a keyboard command palette.
- Self-hosted open-licence fonts with per-era pairings.
- Local Wikimedia Commons imagery with visible credits and a dedicated credits page.
- Generated SVG character portraits.
- Themed scrollbars, footer atmosphere, and crossfading theme transitions.
- PWA manifest, maskable icons, app-shell service worker, and offline fallback.
- Universal header, footer, breadcrumbs, and a site-wide game theme picker on static pages.
- Related-entry links, source links, and outbound further-reading links.
- Static game, story, Elsewhere, archive, changelog, contact, credits, sitemap, robots, and llms.txt outputs.
- jsdom regression tests, Playwright fallback/transition tests, and header breakpoint snapshots.

### Changed

- Rebuilt the header as a single bar with a game-theme popover.
- Made game pages and local JSON the primary content sources, with fetch fallbacks.
- Simplified UI copy and removed decorative counters and slogan-style headings.
- Updated the game library to real release order.
- Moved the radio panel to the home page.
- Clarified that the theme picker changes both styling and game focus.
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
- First era themes and the game theme picker.
- Local JSON content for lore, story beats, trivia, atlas entries, and games.
- Self-hosted open fonts and generated SVG avatars.
- Initial static archive, story reading page, sitemap, robots file, and PWA shell.
- First jsdom and browser regression tests.

### Changed

- Started with a lore-first navigation model instead of an arcade-first one.
- Kept all content client-side and static-host friendly.
