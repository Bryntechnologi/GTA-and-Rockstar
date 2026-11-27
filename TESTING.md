# CHANNEL SURF �" smoke-test checklist

Run with a local server (not `file://`):

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>.

## Core

1. Console has zero uncaught errors on load and on every view change.
2. All views render; hash routing works (`#home`, `#lore`, `#atlas`, `#story`, `#reel`, `#play`, `#about`, plus `#trivia`, `#puzzles`, `#timeline`, `#toolkit`).
3. The first-visit disclaimer banner appears; “I understand” hides it; `channelsurf.disclaimer.v1` is stored; the footer “Full disclaimer” reopens the About notice.
4. All eight era themes switch; Auto-morph re-skins per trivia question.
5. Home shows 4 featured lore cards and 5 story preview cards.
6. Lore hub shows 20 entries; era/type filters and search work; a card opens the detail panel; “Live summary” loads Wikipedia with attribution.
7. Story Timeline shows 35 cards; prev/next, progress dots, arrow keys, and scroll-snap work; the detail panel updates and the era follows the active beat.
8. Spoiler toggle persists and reveals full detail; “Follow era” toggle persists and restores the previous era on exit.
9. Global search opens with the header button or `Ctrl/Cmd + K`; results navigate to views, eras, lore, and story beats.
10. Trivia: Classic, Blitz, Sudden Death, Mythbuster, Channel Surf, Daily. Timer pauses on lore, streaks score, ranks show.
11. Daily trivia seed is identical across reloads on the same UTC day.
12. Vault: 6 tries, unique digits, daily seed, feedback, PNG card download.
13. Heat Grid: 6�"6 / 7�"7 / 8�"8, guaranteed path, par, keyboard/WASD, PNG card download.
14. Clue Dossier: two tries, clean-read Profiler badge, daily seed, PNG card download.
15. Heist splitter: crew sizes, presets, normalization, copy summary.
16. Timeline filters and era tuning.
17. localStorage persistence and “Wipe local data”.

## Atlas and lore

18. Static Leonida SVG works, era chips switch atlases.
19. “Interactive map” lazy-loads Leaflet; pan/zoom and pins work; “Static map” restores SVG.
20. Geo-Guess starts, accepts a map click, scores distance, and shows the answer.
21. Wire Archive shows a curated summary; “Live summary” loads Wikipedia, shows attribution + source, and caches for 24h.
22. Block network or open offline: curated summary still shows; live summary fails gracefully.
23. “Real vs Reel” lazy-loads MapLibre/OpenFreeMap, shows markers and comparison cards; attribution is visible.
24. Block `tiles.openfreemap.org`: comparison cards still render and the status explains the fallback.

## Radio

25. Station list loads; the current-era station sorts first.
26. No audio plays until a station is clicked.
27. Station licence and source link render.
28. “Stop” clears playback.
29. A broken/blocked stream shows an error and leaves the synthesized ambience available.

## PWA

30. `manifest.webmanifest` loads; icons resolve; Lighthouse reports installability.
31. Service worker registers on HTTPS/localhost and not on `file://`.
32. After one online visit, offline reload serves the app shell.
33. Vendored Leaflet/MapLibre files load offline.
34. External features (wiki, tiles, streams) show fallbacks offline.
35. Bump the cache version in `sw.js` and confirm old caches are deleted on activate.

## Accessibility and responsive

36. Keyboard: trivia 1�"4/Enter, grid arrows/WASD, Escape exits.
37. Visible focus states and skip link.
38. `prefers-reduced-motion` disables ambient/ticker motion.
39. Mobile widths 360 / 390 / 768: nav, tuner, atlas, maps, radio, and result cards fit.
40. Color contrast holds in all eight era themes.

## Content and IP

41. Disclaimer is visible in the banner, About page, and footer.
42. No extracted game assets, audio, screenshots, or copied dialogue are present.
43. Every live wiki card shows CC BY-SA attribution and a source link.
44. Every stream entry has `license`, `attribution`, and `homepage`; re-verify embedding terms before launch.

## Automated regression + browser validation

- `npm test` passes (jsdom: routes, lore, story, search, fallbacks, SEO files).
- Playwright/Edge smoke pass: no console errors; 4 home lore cards, 5 story previews, 20 lore cards, 35 story cards, 7 arcade cards, 9 badges, search returns results.
- Blocked-network pass: Wikipedia fallback message appears; map tile failure keeps 10 comparison cards; no page errors.
- Offline pass: after one online visit, reload with the network offline still renders the home heading, lore cards, and theme CSS.
- Lighthouse (local, mobile emulation): Accessibility 100, Best Practices 100, SEO 100. Performance is lower locally because the dev server does not compress assets; Cloudflare Pages compression should improve it. Re-run Lighthouse after deploy.

## Indexability

- `index.html` canonical, robots, OG/Twitter, and JSON-LD are present.
- `archive.html` contains 20 lore articles and 35 story articles without JavaScript.
- `robots.txt`, `sitemap.xml`, and `llms.txt` resolve.
- Change `SITE_URL` in `scripts/build-static.mjs` and the absolute canonical/OG URLs in `index.html` to the real subdomain before launch.

## Games hub and static pages

- Games hub lists 9 dossiers with links to `games/<slug>/`.
- Each game page loads its own `data-era` theme with no flicker.
- Each game page has a unique canonical, description, and JSON-LD.
- Sitemap contains 13 URLs: home, archive, Elsewhere, Story reading mode, and 9 game pages.
- `llms.txt` lists all 9 game pages.
- Theme chip reads `Theme: locked` by default, `following trivia` during trivia, and `following story` on the timeline when enabled.
- Daily trivia no longer forces theme morphing.
- Exiting trivia restores the previous era.

## Browser fallback test

```bash
python -m http.server 4173
npm run test:browser
```

- Wikipedia blocked -> curated fallback message.
- OpenFreeMap blocked -> map fallback + 10 comparison cards.
- Offline reload -> app shell, CSS, and lore cards.

## Rockstar Elsewhere

- `elsewhere.html` renders 4 dossiers: Max Payne, Manhunt, Midnight Club, L.A. Noire.
- It has canonical, description, JSON-LD, and a theme.
- `llms.txt` links to the Elsewhere page.

## Content-driven theme + transitions

- Lore era filter switches the theme to that era; "All eras" restores the base.
- Opening a lore detail uses that entry's era; closing/leaving restores the base.
- Trivia with an era filter starts in that era and restores on exit.
- Manual era tuning clears content preview and persists.
- Story timeline follows the active beat and restores on exit.
- Theme changes crossfade over ~0.55s via registered CSS custom properties.
- Header breakpoints: full nav above 1080px; menu below; mobile header has no overlap at 360-480px.

## Story reading mode

- `story.html` renders 35 static story cards.
- Scrolling changes the page theme to the active event era.
- Cards reveal on scroll; reduced-motion disables the reveal.
- Linked from the interactive story controls and footer.

## Transition + header automation

- `npm run test:transitions` verifies the CSS token crossfade and content-era restoration.
- `npm run test:header` asserts no overlap/overflow at 360-1440px and saves header snapshots.

## Home theme, games order, radio

- Home uses its own `home` theme, distinct from all game eras.
- Leaving home restores the saved game era; returning home restores the home theme.
- Games hub is ordered by real release year: 1997, 2002, 2004, 2005, 2006, 2008, 2013, 2018, 2026.
- Signal radio is surfaced on the home page and remains click-to-play.
- Character avatars are unique generated SVG portraits, not initials; no official likenesses are used.

## Imagery and attribution

- Home photo strip loads 3 Wikimedia Commons images with visible credits.
- Real vs Reel cards show real-world photos with artist/licence/source.
- Game pages show a real-world inspiration photo with credit.
- Character avatars are unique generated SVG portraits, not initials.
- `data/image-credits.json` matches every image used.

## Fonts and expanded imagery

- `assets/fonts/fonts.css` loads self-hosted open fonts.
- Each era uses a distinct display/body/mono font pairing.
- Home uses Bowlby One SC; GTA VI uses Syne; Vice City uses Yellowtail; San Andreas uses Pirata One / UnifrakturMaguntia; GTA V uses Bebas Neue + Montserrat; GTA IV uses Oswald + Inter; Warriors uses Bangers + Permanent Marker with Comic Neue copy; Red Dead uses Rye + Crimson Text; Bully uses Graduate + Comic Neue; Classic GTA uses Orbitron + Michroma.
- Elsewhere card fonts: Anton, Rubik Glitch, Russo One, Poiret One.
- 19 CC/PD Wikimedia photos are present in `assets/images/`.
- Every image has artist, licence, source, and alt text in `data/image-credits.json`.
- Era rack tiles, home photo strip, Real vs Reel, game pages, and Elsewhere use photos.

## Universal chrome and project pages

- `npm run test:static` checks that the changelog, contact, credits, and game pages render the universal header/footer.
- Static pages expose the full era tuner and keep their content theme on first load.
- Static search finds lore entries through `assets/js/search-index.js`.
- The changelog is version-only; both `v1.0.0` and `v0.1.0` are present and no month names appear.
- Contact links to `https://brynsites.com/contact`; no email is published on the subdomain.
- Credits page renders the image gallery and links every original file.
- Related links and “Further reading” links appear in the archive, story page, game pages, and lore detail.
- Static pages and the SPA footer expose share/copy tools, positive-only reactions stored in localStorage, and a reading-progress bar on long pages.
