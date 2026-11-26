# CHANNEL SURF

**An unofficial Rockstar-universe arcade and portfolio piece.**
Tune the era. Play the city.

CHANNEL SURF is a 100% client-side, zero-backend web app built as a playable tribute to the
cities, crews, frontiers, and radio static of the Rockstar universe. The entire interface morphs
to match the selected era — from modern Leonida neon to 1979 New York grit — using CSS custom
properties, inline SVG ambience, and synthesized Web Audio sound effects.

> **Disclaimer:** This is an unofficial fan project and portfolio arcade. It is not affiliated
> with Rockstar Games or Take-Two Interactive. All game names, characters, and trademarks belong
> to their respective owners. This site uses original writing, code, CSS, and vector art only —
> no extracted game assets, audio, or ripped artwork.

---

## Features

### Era-morphing theme engine
Eight era presets, each with its own palette, typography, corner radius, card treatment, and
animated SVG backdrop:

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

Switch manually with the radio tuner, or enable **Auto-morph** so the whole site re-skins to the
era of each trivia question.

### Play modes
- **Trivia Arena** — Classic Run, 60-Second Blitz, Sudden Death, Mythbuster (spot the fake fact),
  and Channel Surf (mixed eras with live theme morphing).
- **Vault & Keypad Cracker** — a Mastermind-style 4-digit codebreaker with positional feedback.
- **Heat & Getaway Grid** — route a 5×5 block grid from start to safehouse while avoiding patrol
  and heat tiles.
- **Daily Signal** — a date-seeded run (UTC) so every visitor gets the same challenge that day.
- **Leonida Atlas** — an interactive custom SVG district map plus era-specific location cards.
- **Franchise Timeline** — a filterable era scrubber from the 1997 origins through GTA VI.
- **Crew & Heist Splitter** — a payout calculator with crew sizing, prep costs, presets, and
  visual split bars.

### Polish
- Synthesized Web Audio SFX (clicks, tumbler ticks, success chimes, error buzzes) with a mute
  toggle — no audio files.
- `localStorage` persistence for high scores, daily streaks, unlocked era badges, and settings.
- Eight unlockable badges.
- Toasts, result screens, and one-click result sharing.
- Keyboard controls (1–4 / A–D for trivia, arrow keys or WASD for the grid, Escape to exit).
- Skip link, ARIA labelling, visible focus states, and `prefers-reduced-motion` support.
- Hash-based routing (`#arcade`, `#trivia`, `#puzzles`, `#atlas`, `#timeline`, `#toolkit`,
  `#about`).

---

## Project structure

```text
.
├── index.html          # Header, tuner, nav, all seven views, footer, icon sprite
├── assets/
│   ├── favicon.svg
│   ├── styles.css      # Theme tokens, layouts, components, reduced-motion rules
│   └── js/
│       ├── data.js     # Eras, questions, fake facts, atlas, timeline, badges, chatter
│       └── app.js      # State, routing, themes, ambience, audio, games, sharing
└── README.md
```

No build step, no dependencies, and no server logic. `index.html` loads `data.js` and then
`app.js`; everything else is generated at runtime.

---

## Run locally

Because the app uses no modules or fetch calls, you can open `index.html` directly. To mirror a
real static host, serve the folder:

```bash
# Python
python -m http.server 4173

# or Node
npx serve .
```

Then visit <http://localhost:4173>.

### Validation

```bash
node --check assets/js/data.js
node --check assets/js/app.js
```

Deploy by uploading the folder as-is to GitHub Pages, Cloudflare Pages, Netlify, or Vercel.

---

## Editing content

All content lives in `assets/js/data.js` and is assembled into `window.CS_DATA`:

- `eras` / `eraOrder` — era keys, display names, stations, taglines, and accent colors. Era keys
  must match the `[data-era="..."]` blocks in `assets/styles.css`.
- `questions` — trivia items with `era`, `difficulty`, prompt, choices, answer index, and a lore
  note.
- `fakeFacts` — Mythbuster entries (three truths and one planted lie).
- `atlas` — Leonida map coordinates and district/location cards.
- `timeline` — franchise events, optionally tagged with a `theme` era to trigger a re-skin.
- `badges` — unlockable badge definitions.
- `chatter` — ticker/radio flavor lines.
- `site` — name, tagline, and disclaimer strings.

New eras require three coordinated edits: a key in `eraOrder`, tokens in `styles.css`, and any
era-specific art or content in `data.js`.

---

## Local storage keys

| Key | Contents |
| --- | --- |
| `channelsurf.settings.v1` | Era, sound, reduced motion, auto-morph |
| `channelsurf.stats.v1` | High scores, streaks, badges, eras seen, daily results |

The **About** view includes a **Wipe local data** button.

---

## Assets and attribution

All visuals are original CSS and inline SVG. All sound is generated at runtime with the Web Audio
API. No official artwork, audio, models, textures, or copied text is included. Game titles and
trademarks remain the property of their respective owners.
