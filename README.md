# CHANNEL SURF

**An unofficial Rockstar archive, arcade, and portfolio piece.**

CHANNEL SURF is a 100% client-side, zero-backend web app built as a playable tribute to the
cities, crews, frontiers, and radio static of the Rockstar universe. The entire interface morphs
to match the selected era — from modern Leonida neon to 1979 New York grit — using CSS custom
properties, inline SVG ambience, and synthesized Web Audio sound effects.

It is a **partial archive**, not a complete lore database, and it is updated when time allows. It is
also a [Brynsites](https://brynsites.com/) miscellany project, made for fun. Contact, corrections,
and permissions go through the [Brynsites contact page](https://brynsites.com/contact).

> **Disclaimer:** This is an independent, non-commercial fan project and portfolio piece. It is
> not affiliated with, endorsed by, sponsored by, or approved by Rockstar Games or Take-Two
> Interactive. I do not own or claim any rights to the games, characters, locations, logos, or
> trademarks referenced here; all such rights belong to their respective owners. The games and
> their lore are not my work and are not part of any project I own or claim. Quizzes, code, CSS,
> and vector art are original. No extracted game assets, audio, or copied dialogue are included.

---

## Features

### Lore-first structure
The site leads with the archive, not the arcade:

- **Home** — a signature home-only theme, featured lore, a story preview, a signal radio, the era rack, and clear atlas/arcade CTAs.
- **Games** - a hub of static, theme-per-game dossier pages in release order. Each page has its own metadata, canonical URL, era theme, characters, locations, lore, and story beats.
- **Rockstar Elsewhere** - a static dossier page covering Max Payne, Manhunt, Midnight Club, and L.A. Noire without adding new global theme eras.
- **Lore** - curated entries across locations, characters, factions, and franchise history, with era/type filters, search, sources, and optional live Wikipedia and GTA Wiki summaries. The archive is explicitly partial.
- **Story Timeline** - in-universe story beats from 1961 London to 2026 Leonida, presented as a horizontal, theme-morphing carousel. Full spoilers are available behind a persisted toggle. A static **reading mode** at `story.html` presents the same chronology as a scroll-driven, theme-shifting page.
- **Atlas** — the fictional map, Leaflet mode, and Geo-Guess, with Real vs Reel as a sub-tab.
- **Real vs Reel** — MapLibre + OpenFreeMap comparisons, now grouped under Atlas.
- **Arcade** — trivia, vault, heat grid, clue dossier, heist splitter, and badges.
- **Global search** — `Ctrl/Cmd + K` or the header search button. The SPA search covers lore, story beats, games, eras, and views; static pages get a fuzzy search overlay over the full site index.
- **Universal chrome** — the same header, footer, breadcrumbs, theme tuner, and mobile navigation on the SPA and every static page.
- **Project pages** — a version-only [changelog](changelog.html), [image credits](credits.html), and a [contact page](contact.html) that routes through Brynsites.
- **Share and reactions** — Web Share API with a copy-link fallback, plus positive-only localStorage reactions. Long pages show a reading-progress bar.
- **Contrast preference** — a high-contrast toggle that layers over every era theme and persists in localStorage.
- **Markdown and wiki links** — safe Markdown rendering for lore, story, and game copy, including `[[Topic]]` links that resolve to archive entries.
- **CSP audit** — `npm run audit:csp` checks the enforced policy against actual scripts, styles, external origins, streams, and map/API hosts.

### Theme behaviour
The era theme is stable by default and changes with the content you open. Lore filters and lore detail use that entry’s era; trivia uses the selected era filter; the story timeline follows the active beat; atlas chips switch the era. Exiting a content view restores the previous theme, and manual tuning wins. “Follow trivia era” only lets trivia questions change the signal, and Channel Surf still does it by design. Registered CSS custom properties crossfade the palette over ~0.55s, so theme changes are smooth rather than snapping. Static game pages bake their theme into the HTML, so there is no flicker or global theme drift.

### Era-morphing theme engine
Era presets, each with its own palette, typography, corner radius, card treatment, and
animated SVG backdrop. Each era also uses a distinct self-hosted open font pairing — no GTA font
files are included.

| Era | Signal | Vibe |
| --- | --- | --- |
| `gta6` | Leonida Wave 98.7 | Neon twilight, swaying palms |
| `vicecity` | Wave 103 | 1986 pastel noir |
| `sanandreas` | West Coast Classics | Golden-hour amber and grove green |
| `gta5` | Blaine County Radio | Sun-bleached Los Santos |
| `gta4` | Liberty Talk | Steel-gray dossier |
| `warriors` | 1979 Bopper FM | Subway tile, brick, hazard orange |
| `reddead` | Frontier Dispatch | Parchment, ink, woodcut trim |
| `bully` | Prep Radio | Collegiate navy and crest gold |

### Theme typography

All fonts are self-hosted open-licence alternatives — no proprietary GTA font files.

| Era | Display | Body |
| --- | --- | --- |
| Home | Bowlby One SC | Barlow |
| GTA VI | Syne | Barlow |
| Vice City | Yellowtail | Barlow Condensed |
| San Andreas | Pirata One / UnifrakturMaguntia | Barlow Condensed |
| GTA V | Bebas Neue | Montserrat |
| GTA IV | Oswald | Inter |
| The Warriors | Bangers / Permanent Marker | Comic Neue |
| Red Dead | Rye | Crimson Text |
| Bully | Graduate | Comic Neue |
| Classic GTA | Orbitron | Michroma |

Elsewhere cards also get their own display faces: Anton for Max Payne, Rubik Glitch for Manhunt, Russo One for Midnight Club, and Poiret One for L.A. Noire.

Switch manually with the radio tuner, or enable **Follow trivia era** so the whole site re-skins to the era of each trivia question.

### Arcade modes
- **Trivia Arena** — Classic Run, 60-Second Blitz, Sudden Death, Mythbuster (spot the fake fact),
  and Channel Surf (mixed eras with live theme morphing).
- **Vault & Keypad Cracker** — a Mastermind-style 4-digit codebreaker with positional feedback.
- **Heat & Getaway Grid** — route a 6×6 / 7×7 / 8×8 block grid from start to safehouse while avoiding
  patrol and heat tiles.
- **Clue Dossier** — three field notes from the era atlas, four districts, two tries. Deduce the
  location; a clean read unlocks the Profiler badge.
- **Daily Signal** — a date-seeded run (UTC) so every visitor gets the same challenge that day, with
  daily trivia, a daily vault, and a daily dossier.
- **Leonida Atlas** — a custom SVG district map, plus an optional lazy-loaded **Leaflet** mode
  with pan/zoom, clickable pins, and a **Geo-Guess** mini-game.
- **Real vs Reel** — an optional lazy-loaded **MapLibre + OpenFreeMap** tab comparing real cities
  with their fictional echoes. Falls back to comparison cards if tiles fail.
- **Wire Archive** — curated, original lore summaries per era, with an optional live Wikipedia
  summary (cached 24h, CC BY-SA attribution) and a source link.
- **Signal Radio** — optional, click-to-play CC/free streams with licence and station links, surfaced on the home page.
- **Signal / game tuner** — the header signal pill opens a game-world selector. Each signal changes the site theme and tunes the archive to that game.
- **Franchise Timeline** — a filterable era scrubber from the 1997 origins through GTA VI.
- **Crew & Heist Splitter** — a payout calculator with crew sizing, prep costs, presets, and
  visual split bars.

### Polish
- Synthesized Web Audio SFX (clicks, tumbler ticks, success chimes, error buzzes) with a mute
  toggle — no audio files. Each era shifts the pitch and gain of the sound palette.
- `localStorage` persistence for high scores, daily streaks, unlocked era badges, and settings.
- Unlockable badges.
- Toasts, result screens, clipboard sharing, and one-click PNG result cards for trivia and every
  puzzle (canvas-rendered, no image assets).
- Keyboard controls (1–4 / A–D for trivia, arrow keys or WASD for the grid, Escape to exit).
- Skip link, ARIA labelling, visible focus states, and `prefers-reduced-motion` support.
- Installable PWA: manifest, icons, and an app-shell service worker with offline fallback.
- Hash-based routing (`#home`, `#lore`, `#atlas`, `#story`, `#reel`, `#play`, `#about`, plus
  `#trivia`, `#puzzles`, `#timeline`, `#toolkit`).

---

## Project structure

```text
.
├── index.html              # Shell, views, disclaimer banner, footer, icon sprite, JSON-LD
├── archive.html            # Static, JavaScript-free full-text lore + story archive
├── story.html              # Static graphical story timeline (scroll-driven themes)
├── elsewhere.html          # Static dossier: Max Payne, Manhunt, Midnight Club, L.A. Noire
├── changelog.html          # Public, version-only changelog
├── contact.html            # Contact route through the Brynsites umbrella
├── credits.html            # Indexable image-credit gallery
├── CHANGELOG.md            # Generated changelog source
├── PROJECT_LOG.md          # Working project log
├── games/                  # Generated static game dossier pages
│   ├── gta-vi/
│   ├── vice-city/
│   └── ...
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # App-shell service worker
├── _headers                # Cloudflare Pages security headers
├── robots.txt              # Crawler policy + sitemap
├── sitemap.xml             # Root + archive + story + project + game page URLs
├── llms.txt                # AI-readable site and content summary
├── site.config.json        # Production SITE_URL, umbrella, and archive note
├── TESTING.md              # Smoke-test checklist
├── tests/                  # Node/jsdom + browser regression tests
├── CSP_AUDIT.md            # Generated CSP enforcement report
├── KIT_PLAN.md             # Plan for extracting the reusable static-site kit
├── scripts/
│   ├── build-static.mjs    # Regenerates static pages, changelog, search index, sitemap, llms.txt, _headers
│   ├── csp-audit.mjs       # Audits the enforced CSP and writes CSP_AUDIT.md
│   ├── dev-server.mjs      # Local preview server for `npm run dev`
│   └── site-chrome.mjs     # Shared header/footer/breadcrumb markup for static pages
├── assets/
│   ├── favicon.svg
│   ├── icons/              # 192 / 512 / maskable PNG icons
│   ├── images/             # 19 CC/PD real-world city photos with credits
│   ├── fonts/              # Self-hosted open fonts per era + fonts.css
│   ├── og-cover.png        # 1200x630 social preview
│   ├── styles.css          # Theme tokens, layouts, components
│   ├── vendor/
│   │   ├── leaflet/        # Self-hosted, lazy-loaded
│   │   └── maplibre/       # Self-hosted, lazy-loaded
│   └── js/
│       ├── services.js     # Cached fetch + Wikipedia + GTA Wiki + local JSON loaders
│       ├── data.js         # Core eras, questions, fake facts, atlas, timeline, badges
│       ├── app.js          # State, routing, themes, games, maps, radio, sharing
│       ├── markdown-core.js # Safe Markdown + [[wiki link]] renderer
│       ├── chrome.js       # Universal static-page header/footer, tuner, search
│       └── search-index.js # Generated static-page search index
├── data/
│   ├── lore.json           # Curated lore summaries + types + wiki titles + sources
│   ├── story-timeline.json # 35 in-universe GTA story beats
│   ├── games.json          # Game pages: slugs, themes, lore/story mappings
│   ├── image-credits.json  # Author/licence/source for every local photo
│   ├── changelog.json      # Version-only release data
│   ├── elsewhere.json      # Max Payne, Manhunt, Midnight Club, L.A. Noire dossiers
│   ├── real-world.json     # Real city ↔ fictional location pairs
│   └── streams.json        # Curated, licence-labelled streams
├── package.json
└── README.md
```

No required build step for local play; core content is synchronous in `data.js`. Optional content is
fetched as JSON with graceful fallbacks. Run `npm run build:static` after changing HTML or content so
the static pages, CSP hashes, sitemap, and search index stay in sync.

---

## Run locally

The reliable way to preview is the built-in dev server. It serves the folder over HTTP, adds the
security headers, and handles clean folder URLs:

```bash
npm install
npm run dev
```

Then open <http://127.0.0.1:4173/>.

Use a different port if needed:

```bash
PORT=5000 npm run dev
```

To test the generated CSP during preview:

```bash
CSP=1 npm run dev
```

In VS Code/VSCodium you can run **Terminal → Run Task → dev server** instead of typing the
command. The task is defined in `.vscode/tasks.json`.

Opening `index.html` directly with `file://` still works for the core arcade, but optional JSON,
maps, the service worker, and clean folder routes need HTTP. If you see “data failed to load” in a
preview, start `npm run dev` and use the URL it prints.

### Validation

```bash
node --check assets/js/services.js
node --check assets/js/data.js
node --check assets/js/app.js
node --check sw.js
npm install
npm test
```

`npm test` runs the jsdom regression suite in `tests/`:
- lore-first home rendering
- games hub and static game page links
- lore filters, search, and detail panel
- story timeline navigation, spoilers, and era following
- Real vs Reel cards and atlas subnav
- global search
- offline data fallbacks
- indexability files, sitemap URLs, all game pages, the Elsewhere dossier, and the story reading page
Browser-level fallback tests:

```bash
# serve the site first (python -m http.server 4173), then:
npm run test:browser
npm run test:transitions
npm run test:header
npm run test:static
npm run audit:csp
```

- `test:browser` verifies blocked Wikipedia, blocked map tiles, and the offline app shell.
- `test:transitions` verifies registered-token crossfades and content-era restoration in Chromium.
- `test:header` snapshots and asserts header layout at 360-1440px (images go to `tests/snapshots/`).
- `test:static` checks universal chrome, the version-only changelog, the contact and credits pages, and the static theme tuner.
- `audit:csp` verifies the enforced CSP against inline scripts/styles, external origins, media streams, and map/API hosts.

### Static archive / SEO regeneration

After editing `data/lore.json`, `data/story-timeline.json`, `data/games.json`, `data/changelog.json`, or `data/image-credits.json`, regenerate the static indexable files:

```bash
npm run build:static
# or with the real domain:
SITE_URL=https://your-subdomain.example/ npm run build:static
```

This updates `archive.html`, `elsewhere.html`, `games/<slug>/index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, and the canonical/OG URLs in `index.html`. Set the real domain in `site.config.json` (or pass `SITE_URL`). The checked-in default is `https://channelsurf.pages.dev/`.

### Indexability

- `index.html` has canonical, robots, Open Graph, Twitter, and JSON-LD metadata.
- Each game page is a static, theme-baked page with unique title, description, canonical, and JSON-LD.
- `elsewhere.html` is a static Rockstar Elsewhere dossier with its own metadata.
- `story.html` is a static, scroll-driven story timeline with its own metadata.
- `archive.html` is a static, JavaScript-free full-text archive of all lore entries and story beats.
- `robots.txt`, `sitemap.xml`, and `llms.txt` are included.
- The `<noscript>` block contains a real content summary and a link to the archive.

The interactive views are hash-routed, so the static archive is the strongest crawlable surface.
For maximum search visibility, keep the archive updated and link to it from the footer.

Deploy by uploading the folder as-is to Cloudflare Pages (recommended), GitHub Pages, Netlify, or
Vercel. On Cloudflare Pages the subdomain root works with the included relative `start_url` and
service-worker scope.

---

## Editing content

All content lives in `assets/js/data.js` and is assembled into `window.CS_DATA`:

- `eras` / `eraOrder` — era keys, display names, stations, taglines, and accent colors. Era keys
  must match the `[data-era="..."]` blocks in `assets/styles.css`.
- `questions` — trivia items with `era`, `difficulty`, prompt, choices, answer index, and a lore
  note.
- `fakeFacts` — Mythbuster entries (three truths and one planted lie).
- `atlas` — Leonida map coordinates and district/location cards; also drives the Clue Dossier
  puzzle (kind + note + era become the three clues).
- `timeline` — franchise events, optionally tagged with a `theme` era to trigger a re-skin.
- `badges` — unlockable badge definitions.
- `chatter` — ticker/radio flavor lines.
- `site` — name, tagline, and disclaimer strings.

New eras require three coordinated edits: a key in `eraOrder`, tokens in `styles.css`, and any
era-specific art or content in `data.js`.

### Optional JSON content

- `data/lore.json` — curated entries with a `type` (`location`, `character`, `faction`, `franchise`), each with a `wikiTitle` and source link.
- `data/story-timeline.json` — in-universe story beats. Each entry needs `id`, `sort`, `year`, `era`, `game`, `title`, `summary`, `detail`, `characters`, `locations`, `spoiler`, and `tags`.
- `data/real-world.json` — `coords` are `[lng, lat]`; used by the Real vs Reel map and cards.
- `data/streams.json` — each entry needs `id`, `era`, `name`, `url`, `homepage`, `license`, and
  `attribution`. **Verify that a station permits embedding before adding it.** The player never
  autoplays and never proxies audio.

Live Wikipedia summaries are fetched on demand from the REST API, cached for 24 hours, and always
credited as CC BY-SA with a source link. If the request fails, the curated local summary remains.

---

## Local storage keys

| Key | Contents |
| --- | --- |
| `channelsurf.settings.v1` | Era, sound, reduced motion, auto-morph |
| `channelsurf.stats.v1` | High scores, streaks, badges, eras seen, daily results |
| `channelsurf.disclaimer.v1` | Whether the first-visit disclaimer was dismissed |
| `channelsurf.cache.*` | Cached live wiki responses (24h TTL) |

The **About** view includes a **Wipe local data** button.

---

## Assets and attribution

All core visuals are original CSS and inline SVG. All synthesized sound is generated at runtime
with the Web Audio API.

- **Leaflet** — BSD-2-Clause, vendored in `assets/vendor/leaflet/`.
- **MapLibre GL JS** — BSD-3-Clause, vendored in `assets/vendor/maplibre/`.
- **OpenFreeMap / OpenStreetMap** — map data attribution is shown in the Real vs Reel view.
- **Wikipedia** — live summaries are CC BY-SA; the UI links to the source article.
- **Wikimedia Commons** — local real-world city photos under CC BY / CC BY-SA / public domain. Credit and source are stored in `data/image-credits.json` and shown in the UI.
- **Google Fonts** — self-hosted open-licence font files (SIL OFL) in `assets/fonts/`. No GTA font files are used.
- **Streams** — licences and station links are shown in the radio panel. Only add stations whose
  terms permit embedding; the included list is a starting point and should be re-verified before
  launch.

Game titles and trademarks remain the property of their respective owners. This project claims no
ownership over any game, character, location, or related intellectual property.

No official screenshots, artwork, or character likenesses are used. Character avatars are generated
from name-hashed geometric portraits in the browser. Game and era art is original inline SVG.

Real-world city photography comes from Wikimedia Commons under CC BY / CC BY-SA / public-domain
licences. Credits and source links are stored in `data/image-credits.json` and shown next to each
image. These are real-world inspiration photos, not GTA screenshots or official artwork.
