import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { decoratePage } from "./site-chrome.mjs";

const require = createRequire(import.meta.url);
const { renderMarkdown } = require("../assets/js/markdown-core.js");

const root = process.cwd();
const configPath = path.join(root, "site.config.json");
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
const siteUrl = (process.env.SITE_URL || config.siteUrl || "https://fivestarwanted.pages.dev/").replace(/\/?$/, "/");
const site = {
  siteUrl,
  umbrella: config.umbrella || { name: "Brynsites", url: "https://brynsites.com/", contactUrl: "https://brynsites.com/contact" },
  archiveNote: config.archiveNote || "A partial, fan-made archive. Not exhaustive, and may lag behind new releases.",
  updatedNote: config.updatedNote || "Updated when time allows."
};
const lore = JSON.parse(fs.readFileSync(path.join(root, "data/lore.json"), "utf8"));
const story = JSON.parse(fs.readFileSync(path.join(root, "data/story-timeline.json"), "utf8"));
const games = JSON.parse(fs.readFileSync(path.join(root, "data/games.json"), "utf8"));
const elsewhere = JSON.parse(fs.readFileSync(path.join(root, "data/elsewhere.json"), "utf8"));
const imageCredits = JSON.parse(fs.readFileSync(path.join(root, "data/image-credits.json"), "utf8"));
const changelog = JSON.parse(fs.readFileSync(path.join(root, "data/changelog.json"), "utf8"));
const realWorld = JSON.parse(fs.readFileSync(path.join(root, "data/real-world.json"), "utf8"));
const dataSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/data.js"), "utf8"), dataSandbox);
const atlas = dataSandbox.window.CS_DATA.atlas || {};
const loreById = new Map(lore.map((item) => [item.id, item]));
const storyById = new Map(story.map((item) => [item.id, item]));
const gameByEra = new Map(games.map((game) => [game.era, game]));
const gameByTheme = new Map(games.map((game) => [game.theme, game]));

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const fandomUrl = (title) => `https://gta.fandom.com/wiki/${encodeURIComponent(String(title || "").trim().replace(/\s+/g, "_"))}`;
const wikiUrl = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(String(title || "").trim().replace(/\s+/g, "_"))}`;

function gameForItem(item) {
  if (item.scope === "franchise") return null;
  return gameByEra.get(item.era) || gameByTheme.get(item.era) || null;
}

function loreRelated(item, limit = 4) {
  const tags = new Set((item.tags || []).map((tag) => tag.toLowerCase()));
  return lore
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => {
      const shared = (candidate.tags || []).filter((tag) => tags.has(tag.toLowerCase())).length;
      return { item: candidate, score: (candidate.era === item.era ? 3 : 0) + shared * 2 + (candidate.type === item.type ? 1 : 0) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

function storyRelated(event, limit = 3) {
  const names = new Set([...(event.characters || []), ...(event.locations || []), ...(event.tags || [])].map((name) => name.toLowerCase()));
  const matches = lore
    .map((item) => {
      const haystack = `${item.title} ${(item.tags || []).join(" ")}`.toLowerCase();
      const score = [...names].filter((name) => name.length > 2 && haystack.includes(name)).length + (item.era === event.era ? 1 : 0);
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
  return matches;
}

function relatedMarkup(item) {
  const related = loreRelated(item);
  const game = gameForItem(item);
  const links = related.map((entry) => `<a href="archive.html#lore-${esc(entry.id)}">${esc(entry.title)}</a>`);
  if (game) links.unshift(`<a href="games/${esc(game.slug)}/">${esc(game.name)} dossier</a>`);
  const sources = [
    item.wikiTitle ? `<a href="${esc(wikiUrl(item.wikiTitle))}" rel="noopener noreferrer" target="_blank">Wikipedia</a>` : "",
    `<a href="${esc(fandomUrl(item.fandomTitle || item.wikiTitle || item.title))}" rel="noopener noreferrer" target="_blank">GTA Wiki</a>`
  ].filter(Boolean);
  return `<div class="related-links">
    ${links.length ? `<p><strong>Related:</strong> ${links.join(" · ")}</p>` : ""}
    <p class="source-links"><strong>Further reading:</strong> ${sources.join(" · ")}</p>
  </div>`;
}

function wikiResolver(prefix = "") {
  return (name) => {
    const needle = String(name || "").trim().toLowerCase();
    const hit = lore.find((item) =>
      item.title.toLowerCase() === needle ||
      (item.tags || []).some((tag) => tag.toLowerCase() === needle) ||
      item.title.toLowerCase().includes(needle)
    );
    if (!hit) return null;
    return {
      href: `${prefix}archive.html#lore-${hit.id}`,
      label: hit.title,
      dataLoreId: hit.id
    };
  };
}

function md(text, prefix = "") {
  return renderMarkdown(text, { resolveWiki: wikiResolver(prefix) });
}


const eraNames = {
  gta6: "GTA VI / Leonida",
  vicecity: "Vice City",
  sanandreas: "San Andreas",
  gta5: "GTA V / Los Santos",
  gta4: "GTA IV / Liberty City",
  warriors: "The Warriors",
  reddead: "Red Dead",
  bully: "Bully",
  classic: "Classic GTA"
};
const eraAccents = {
  gta6: "#ff5d7e",
  vicecity: "#ff4fa3",
  sanandreas: "#f5a623",
  gta5: "#ff9f1c",
  gta4: "#eab308",
  warriors: "#d23b2f",
  reddead: "#8f2f21",
  bully: "#d4af37"
};

const gameSeo = {
  "gta-classic": {
    title: "Classic GTA (1997–2001): Story, Characters & Maps",
    description: "From top-down origins to the 3D debut: Classic GTA's London expansions, Anywhere City, characters, and maps explained in one fan-made guide with sources."
  },
  "vice-city": {
    title: "GTA: Vice City (1986): Story, Characters & Map Guide",
    description: "Tommy Vercetti, the Vercetti gang, and 1986 Vice City: story beats, characters, locations, and map explained in one fan-made guide with sources."
  },
  "san-andreas": {
    title: "GTA: San Andreas (1992): Story, Characters & Map Guide",
    description: "CJ, Grove Street, and three cities across San Andreas: story, characters, locations, and map explained in one fan-made guide with sources."
  },
  "the-warriors": {
    title: "The Warriors (1979): Story, Characters & New York Map",
    description: "The Warriors' long night across 1979 New York: gangs, story beats, characters, locations, and map explained in one fan-made guide with sources."
  },
  "bully": {
    title: "Bully (2006): Story, Characters & Bullworth Map",
    description: "Jimmy Hopkins, Bullworth Academy, and its cliques: story, characters, locations, and map explained in one fan-made guide with sources."
  },
  "gta-iv": {
    title: "GTA IV (2008): Story, Characters & Liberty City Map",
    description: "Niko Bellic, Liberty City, and the GTA IV story: characters, locations, map, and story beats explained in one fan-made guide with sources."
  },
  "gta-v": {
    title: "GTA V (2013): Story, Characters & Los Santos Map",
    description: "Michael, Franklin, Trevor, and Los Santos: GTA V's story, characters, locations, and map explained in one fan-made guide with sources."
  },
  "red-dead": {
    title: "Red Dead Redemption 2: Story, Characters & Map Guide",
    description: "Arthur Morgan, the Van der Linde gang, and the frontier: Red Dead Redemption 2's story, characters, locations, and map explained with sources."
  },
  "gta-vi": {
    title: "GTA VI (2026): Story, Characters & Leonida Map",
    description: "Jason, Lucia, and the state of Leonida: GTA VI's confirmed story, characters, locations, and map explained in one fan-made guide with sources."
  }
};

const loreByType = ["location", "character", "faction", "franchise"];
const loreSections = loreByType.map((type) => {
  const items = lore.filter((item) => (item.type || "location") === type);
  if (!items.length) return "";
  return `<section id="lore-${type}">
    <h2>${esc(type.charAt(0).toUpperCase() + type.slice(1))} entries</h2>
    ${items.map((item) => `<article id="lore-${esc(item.id)}">
      <h3>${esc(item.title)}</h3>
      <p class="meta">${esc(item.scope === "franchise" ? "All games" : (eraNames[item.era] || item.era))} · ${esc(item.type || "lore")}</p>
      <div class="md">${md(item.summary)}</div>
      ${item.tags ? `<p class="tags">${item.tags.map(esc).join(" · ")}</p>` : ""}
      ${item.sourceLicense ? `<p class="license-note">${esc(item.attribution || "Adapted from an external source")} · ${esc(item.sourceLicense)} · changes may have been made.</p>` : ""}
      ${relatedMarkup(item)}
    </article>`).join("")}
  </section>`;
}).join("");

const storySections = story.map((event) => `<article id="story-${esc(event.id)}">
  <h3><span class="year">${esc(event.year)}</span> ${esc(event.title)}</h3>
  <p class="meta">${esc(event.game)} · ${esc(eraNames[event.era] || event.era)}</p>
  <div class="md">${md(event.summary)}${md(event.detail)}</div>
  <p class="tags">${[...(event.characters || []), ...(event.locations || [])].map(esc).join(" · ")}</p>
  ${(() => { const g = gameByEra.get(event.era); const related = storyRelated(event); const links = related.map((item) => `<a href="archive.html#lore-${esc(item.id)}">${esc(item.title)}</a>`); if (g) links.unshift(`<a href="games/${esc(g.slug)}/">${esc(g.name)} dossier</a>`); return links.length ? `<div class="related-links"><p><strong>Related:</strong> ${links.join(" · ")}</p></div>` : ""; })()}
</article>`).join("");

function gamePage(game) {
  const gameLore = (game.loreIds || []).map((id) => loreById.get(id)).filter(Boolean);
  const gameStory = (game.storyIds || []).map((id) => storyById.get(id)).filter(Boolean);
  const relative = "../../";
  const canonical = `${siteUrl}games/${game.slug}/`;
  const seo = gameSeo[game.slug] || {
    title: `${game.name}: Story, Characters & Map`,
    description: `${game.blurb} Explore ${game.name} characters, locations, story, and map in one fan-made guide.`
  };
  const credit = imageCredits[game.image];
  const photo = credit ? `<figure class="game-photo"><img src="${relative}${esc(credit.file)}" alt="${esc(credit.alt)}" loading="lazy"><figcaption>Real-world inspiration, not game artwork. Photo: ${esc(credit.artist)} (${esc(credit.license)}) · <a href="${esc(credit.source)}" rel="noopener noreferrer">source</a></figcaption></figure>` : "";
  const loreBlocks = gameLore.map((item) => `<article class="game-entry">    <p class="meta">${esc(item.type || "lore")}</p>
    <h3>${esc(item.title)}</h3>
    <div class="md">${md(item.summary, relative)}</div>
    ${item.sourceLicense ? `<p class="license-note">${esc(item.attribution || "Adapted from an external source")} · ${esc(item.sourceLicense)} · changes may have been made.</p>` : ""}
    <p class="source-links">${item.wikiTitle ? `<a href="${esc(wikiUrl(item.wikiTitle))}" rel="noopener noreferrer" target="_blank">Wikipedia</a> · ` : ""}<a href="${esc(fandomUrl(item.fandomTitle || item.wikiTitle || item.title))}" rel="noopener noreferrer" target="_blank">GTA Wiki</a></p>
  </article>`).join("");
  const storyBlocks = gameStory.map((event) => `<article class="game-entry">
    <h3><span class="year">${esc(event.year)}</span> ${esc(event.title)}</h3>
    <p class="meta">${esc(event.game)}</p>
    <div class="md">${md(event.summary, relative)}${md(event.detail, relative)}</div>
  </article>`).join("");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="${esc(game.theme)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(seo.title)}</title>
  <meta name="description" content="${esc(seo.description)}">
  <meta name="keywords" content="${esc(`${game.name} story, ${game.name} characters, ${game.name} map, ${game.name} locations, GTA lore`)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(seo.title)}">
  <meta property="og:description" content="${esc(seo.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="${relative}assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="${relative}manifest.webmanifest">
  <link rel="stylesheet" href="${relative}assets/fonts/fonts.css">
  <link rel="stylesheet" href="${relative}assets/styles.css">
  <style>
    .game-page { max-width: 960px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .game-hero { padding: 1.5rem 0 2rem; border-bottom: 2px solid var(--accent); }
    .game-hero h1 { font-size: clamp(2rem, 6vw, 3.8rem); line-height: 1.05; margin: 0.4rem 0 0.8rem; }
    .game-hero .lede { font-size: 1.15rem; color: var(--muted); max-width: 70ch; }
    .game-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; }
    .game-page section { margin-top: 2.4rem; }
    .game-page h2 { padding-bottom: 0.4rem; border-bottom: 1px solid var(--line); }
    .game-entry { padding: 0.9rem 0; border-bottom: 1px solid var(--line); }
    .game-entry .meta, .game-entry .year { color: var(--muted); font-family: var(--font-mono); font-size: 0.78rem; }
    .game-entry .year { color: var(--accent); margin-right: 0.4rem; }
    .game-links { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1.2rem; }
    .game-page a { color: var(--accent-2); }
    .game-page .license-note { color: var(--muted); font-family: var(--font-mono); font-size: 0.64rem; line-height: 1.55; }
    .game-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .game-disclaimer { margin-top: 2rem; padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${esc(seo.title)}",
    "url": "${canonical}",
    "description": "${esc(seo.description)}",
    "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" },
    "about": { "@type": "VideoGame", "name": "${esc(game.name)}", "description": "${esc(game.description)}" },
    "inLanguage": "en"
  }
  </script>
</head>
<body>
  <main class="game-page">
    <nav class="game-breadcrumb" aria-label="Breadcrumb">
      <a href="${relative}">Home</a> / <a href="${relative}#games">Games</a> / ${esc(game.shortName)}
    </nav>
    <header class="game-hero">
      <p class="game-breadcrumb">FIVE STAR WANTED // GAME DOSSIER</p>
      <h1>${esc(game.name)}</h1>
      <p class="lede">${md(game.description, relative)}</p>
      <div class="game-meta">
        <span class="tag">${esc(game.year)}</span>
        <span class="tag">${esc(eraNames[game.era] || game.era)}</span>
        ${(game.characters || []).map((name) => `<span class="tag">${esc(name)}</span>`).join("")}
      </div>
      <div class="game-links">
        <a class="btn btn-ghost btn-sm" href="${relative}#story">Open the story timeline</a>
        <a class="btn btn-ghost btn-sm" href="${relative}#atlas">Open the GTA map</a>
        <a class="btn btn-quiet btn-sm" href="${relative}arcade/">Play the arcade</a>
        <a class="btn btn-quiet btn-sm" href="${relative}archive.html">Full-text archive</a>
      </div>
    </header>
    ${photo}

    <section id="lore">
      <h2>Lore files</h2>
      ${loreBlocks || '<p class="small muted">No dedicated lore entries yet.</p>'}
    </section>

    <section id="story">
      <h2>Story beats</h2>
      ${storyBlocks || '<p class="small muted">This game sits outside the GTA story timeline covered on this page.</p>'}
    </section>

    <section id="places">
      <h2>Places</h2>
      <p>${(game.locations || []).map(esc).join(" · ")}</p>
      <p class="source-links"><strong>Further reading:</strong> <a href="${esc(wikiUrl(game.wikiTitle || game.name))}" rel="noopener noreferrer" target="_blank">Wikipedia</a> · <a href="${esc(fandomUrl(game.wikiTitle || game.name))}" rel="noopener noreferrer" target="_blank">GTA Wiki</a></p>
    </section>

    <p class="game-disclaimer">A partial, fan-made dossier. Not every game, character, or location is covered. Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. All game names, characters, locations, and trademarks belong to their respective owners. Summaries are original or adapted from CC BY-SA sources; see each entry's attribution and source links.</p>
  </main>
</body>
</html>`, { prefix: relative, active: "games", lockEra: true, site });
}

function elsewherePage() {
  const canonical = `${siteUrl}elsewhere.html`;
  const cards = elsewhere.map((item) => {
    const credit = imageCredits[item.image];
    return `<article class="elsewhere-card" id="${esc(item.slug)}" style="--elsewhere-accent:${esc(item.accent)};--card-display:'${esc(item.font || "Oswald")}'">
    ${credit ? `<img class="elsewhere-photo" src="${esc(credit.file)}" alt="${esc(credit.alt)}" loading="lazy">` : ""}
    <div class="elsewhere-head">
      <h2>${esc(item.name)}</h2>
      <span class="elsewhere-year">${esc(item.year)}</span>
    </div>
    <p class="elsewhere-genre">${esc(item.genre)}</p>
    <div class="md">${md(item.description)}</div>
    ${item.keyGames ? `<p class="elsewhere-games"><strong>Key games:</strong> ${item.keyGames.map(esc).join(" · ")}</p>` : ""}
    <p class="elsewhere-tags">${item.themes.map(esc).join(" · ")}</p>
    ${credit ? `<p class="elsewhere-credit">Photo: ${esc(credit.artist)} (${esc(credit.license)}) · <a href="${esc(credit.source)}" rel="noopener noreferrer">source</a></p>` : ""}
    <a href="${esc(item.source)}" rel="noopener noreferrer">Source</a>
  </article>`;
  }).join("");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="gta4">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rockstar Beyond GTA: Max Payne, Manhunt, Midnight Club &amp; L.A. Noire</title>
  <meta name="description" content="Explore Rockstar games beyond GTA: Max Payne's noir, Manhunt's stealth horror, Midnight Club street racing, and L.A. Noire's detective work, with sources and context.">
  <meta name="keywords" content="Max Payne, Manhunt, Midnight Club, L.A. Noire, Rockstar games, Rockstar beyond GTA">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="Rockstar Beyond GTA: Max Payne, Manhunt, Midnight Club &amp; L.A. Noire">
  <meta property="og:description" content="Four Rockstar series outside GTA: Max Payne, Manhunt, Midnight Club, and L.A. Noire.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  <link rel="stylesheet" href="assets/styles.css">
  <style>
    .elsewhere-main { max-width: 1000px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .elsewhere-main h1 { font-size: clamp(2rem, 6vw, 3.6rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .elsewhere-main .lede { color: var(--muted); font-size: 1.08rem; max-width: 72ch; }
    .elsewhere-grid { display: grid; gap: 1rem; margin-top: 2rem; }
    .elsewhere-card { padding: 1.2rem; border: 1px solid var(--line); border-left: 4px solid var(--elsewhere-accent, var(--accent)); border-radius: calc(var(--radius) * 0.8); background: color-mix(in srgb, var(--surface-solid) 82%, transparent); }
    .elsewhere-photo { display: block; width: calc(100% + 2.4rem); max-width: none; height: 170px; margin: -1.2rem -1.2rem 1rem; object-fit: cover; filter: saturate(0.8); }
    .elsewhere-credit { color: var(--muted); font-family: var(--font-mono); font-size: 0.66rem; }
    .elsewhere-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
    .elsewhere-card h2 { margin: 0; font-size: clamp(1.3rem, 3vw, 1.8rem); font-family: var(--card-display, var(--font-display)); }
    .elsewhere-year, .elsewhere-genre, .elsewhere-tags, .elsewhere-games { color: var(--muted); font-family: var(--font-mono); font-size: 0.78rem; }
    .elsewhere-games { margin: 0.7rem 0 0.4rem; line-height: 1.6; }
    .elsewhere-card p { line-height: 1.65; }
    .elsewhere-card a { color: var(--accent-2); }
    .elsewhere-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .elsewhere-main .disclaimer { margin-top: 2rem; padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Rockstar Beyond GTA - Max Payne, Manhunt, Midnight Club, and L.A. Noire",
    "url": "${canonical}",
    "description": "A dossier covering four Rockstar series beyond GTA.",
    "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" },
    "inLanguage": "en",
    "about": ["Max Payne", "Manhunt", "Midnight Club", "L.A. Noire", "Rockstar Games"]
  }
  </script>
</head>
<body>
  <main class="elsewhere-main">
    <nav class="elsewhere-breadcrumb" aria-label="Breadcrumb">
      <a href="./">Home</a> / <a href="./#games">Games</a> / Rockstar Beyond GTA
    </nav>
    <p class="elsewhere-breadcrumb" style="margin-top:1.2rem">FIVE STAR WANTED // ROCKSTAR BEYOND GTA</p>
    <h1>Beyond the GTA city limits.</h1>
    <p class="lede">Four Rockstar series that sit outside the GTA story timeline, treated as part of the catalogue rather than a footnote: Max Payne, Manhunt, Midnight Club, and L.A. Noire. Each entry covers the games, the mood, and where to start.</p>
    <div class="elsewhere-grid">${cards}</div>
    <p class="disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. All game names, characters, locations, and trademarks belong to their respective owners. Summaries are original or adapted from CC BY-SA sources; see each entry's attribution and source links.</p>
    <p class="elsewhere-breadcrumb"><a href="./">Return to the interactive archive</a> · <a href="archive.html">Full-text archive</a></p>
  </main>
</body>
</html>`, { prefix: "", active: "games", site });
}

function storyPage() {
  const canonical = `${siteUrl}story.html`;
  const cards = story.map((event) => `<article class="reading-card" data-era="${esc(event.era)}" style="--event-accent:${eraAccents[event.era] || "#ff5d7e"}">
    <div class="reading-year">${esc(event.year)}</div>
    <div class="reading-body">
      <p class="reading-kicker">${esc(event.game)}</p>
      <h2>${esc(event.title)}</h2>
      <div class="md">${md(event.summary)}${md(event.detail)}</div>
      <p class="reading-tags">${[...(event.characters || []), ...(event.locations || [])].map(esc).join(" · ")}</p>
      ${(() => { const g = gameByEra.get(event.era); const related = storyRelated(event); const links = related.map((item) => `<a href="archive.html#lore-${esc(item.id)}">${esc(item.title)}</a>`); if (g) links.unshift(`<a href="games/${esc(g.slug)}/">${esc(g.name)} dossier</a>`); return links.length ? `<p class="reading-related"><strong>Related:</strong> ${links.join(" · ")}</p>` : ""; })()}
    </div>
  </article>`).join("");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GTA Story Timeline: Every Game in Order (1961–2026)</title>
  <meta name="description" content="A complete chronological GTA story timeline from 1961 London to 2026 Leonida, covering Vice City, San Andreas, Liberty City, and Los Santos. Full spoilers.">
  <meta name="keywords" content="GTA story timeline, GTA games in order, GTA lore, Vice City story, San Andreas story, GTA IV story, GTA V story, GTA VI Leonida">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="GTA Story Timeline: Every Game in Order (1961–2026)">
  <meta property="og:description" content="Every major GTA story era in order, from 1961 London to 2026 Leonida, with full spoilers.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  <link rel="stylesheet" href="assets/styles.css">
  <style>
    .reading-main { max-width: 980px; margin: 0 auto; padding: 2rem 1.25rem 5rem; }
    .reading-hero { padding: 1.5rem 0 2.5rem; border-bottom: 2px solid var(--accent); }
    .reading-hero h1 { font-size: clamp(2.2rem, 7vw, 4.4rem); line-height: 1.02; margin: 0.4rem 0 1rem; }
    .reading-hero .lede { max-width: 70ch; color: var(--muted); font-size: 1.1rem; }
    .reading-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
    .reading-timeline { position: relative; margin-top: 2.5rem; }
    .reading-timeline::before { content: ""; position: absolute; left: 58px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--accent), var(--accent-2), var(--accent-3)); opacity: 0.45; }
    .reading-card { position: relative; display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 1.4rem; padding: 1.2rem 0 1.8rem; opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
    .reading-card.is-visible { opacity: 1; transform: translateY(0); }
    .reading-year { position: relative; z-index: 1; width: 58px; height: 58px; display: grid; place-items: center; justify-self: center; background: color-mix(in srgb, var(--bg) 82%, var(--event-accent)); border: 2px solid var(--event-accent); border-radius: 50%; color: var(--ink); font-family: var(--font-mono); font-size: 0.72rem; box-shadow: 0 0 24px -8px var(--event-accent); }
    .reading-body { padding: 1.1rem 1.2rem; border: 1px solid var(--line); border-left: 4px solid var(--event-accent); border-radius: calc(var(--radius) * 0.8); background: color-mix(in srgb, var(--surface-solid) 82%, transparent); }
    .reading-kicker { margin: 0; color: var(--event-accent); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; }
    .reading-body h2 { margin: 0.3rem 0 0.7rem; font-size: clamp(1.25rem, 3vw, 1.7rem); }
    .reading-body p { line-height: 1.7; }
    .reading-summary { color: var(--ink); }
    .reading-tags { color: var(--muted); font-family: var(--font-mono); font-size: 0.74rem; }
    .reading-bar { position: sticky; top: 0; z-index: 5; display: flex; justify-content: space-between; gap: 1rem; padding: 0.6rem 1rem; margin: 0 -1.25rem 1.5rem; background: color-mix(in srgb, var(--bg) 88%, transparent); border-bottom: 1px solid var(--line); backdrop-filter: blur(12px); font-family: var(--font-mono); font-size: 0.7rem; color: var(--muted); }
    .reading-bar b { color: var(--accent); }
    .reading-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1.4rem; }
    .reading-disclaimer { margin-top: 2.5rem; padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
    @media (max-width: 640px) { .reading-card { grid-template-columns: 46px minmax(0, 1fr); gap: 0.8rem; } .reading-year { width: 42px; height: 42px; font-size: 0.6rem; } .reading-timeline::before { left: 22px; } }
    @media (prefers-reduced-motion: reduce) { .reading-card { opacity: 1; transform: none; transition: none; } }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "GTA Story Timeline - FIVE STAR WANTED",
    "url": "${canonical}",
    "description": "In-universe Grand Theft Auto story beats in chronological order.",
    "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" },
    "inLanguage": "en",
    "about": ["Grand Theft Auto", "Rockstar Games", "story timeline"]
  }
  </script>
</head>
<body>
  <main class="reading-main">
    <div class="reading-bar"><span>FIVE STAR WANTED // STORY TIMELINE</span><span>Era: <b id="readingEra">GTA VI</b></span></div>
    <p class="reading-kicker">READING MODE</p>
    <header class="reading-hero">
      <h1>The story, from 1961 to 2026.</h1>
      <p class="lede">Major in-universe GTA story beats, in chronological order. This is a partial archive, not a complete history. The page theme shifts as each chapter enters view. Full story details follow.</p>
      <div class="reading-meta"><span class="tag">${story.length} story beats</span><span class="tag">Full spoilers</span><span class="tag">Original summaries</span></div>
      <div class="reading-actions"><a class="btn btn-primary btn-sm" href="./#story">Open interactive timeline</a><a class="btn btn-ghost btn-sm" href="archive.html">Full-text archive</a><a class="btn btn-quiet btn-sm" href="./">Back to the site</a></div>
    </header>
    <div class="reading-timeline">${cards}</div>
    <p class="reading-disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. Summaries are original or adapted from CC BY-SA sources; see each entry's attribution and source links.</p>
  </main>
  <script>
    (function () {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".reading-card"));
      var era = document.getElementById("readingEra");
      function apply(card) {
        if (!card) return;
        document.documentElement.dataset.era = card.dataset.era;
        if (era) era.textContent = card.querySelector(".reading-kicker").textContent;
      }
      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add("is-visible");
          });
          var active = cards.filter(function (card) { return card.getBoundingClientRect().top < window.innerHeight * 0.55; }).pop();
          apply(active || cards[0]);
        }, { rootMargin: "-10% 0px -35% 0px", threshold: 0.15 });
        cards.forEach(function (card) { observer.observe(card); });
        cards.slice(0, 2).forEach(function (card) { card.classList.add("is-visible"); });
      } else {
        cards.forEach(function (card) { card.classList.add("is-visible"); });
      }
      apply(cards[0]);
    })();
  </script>
</body>
</html>`, { prefix: "", active: "story", lockEra: true, site });
}

function changelogPage() {
  const canonical = `${siteUrl}changelog.html`;
  const sections = changelog.map((release) => {
    const id = `v${release.version.replaceAll(".", "-")}`;
    const block = (title, items) => items && items.length
      ? `<h3>${title}</h3><ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
      : "";
    const parts = [
      block("Added", release.added),
      block("Changed", release.changed),
      block("Fixed", release.fixed),
      block("Notes", release.notes)
    ].filter(Boolean).join("");
    return `<section class="changelog-release" id="${esc(id)}">
      <h2>v${esc(release.version)} <span>${esc(release.label || "")}</span></h2>
      ${parts}
    </section>`;
  }).join("");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="home">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Site Changelog: GTA Lore, Maps, Trivia &amp; Puzzle Updates</title>
  <meta name="description" content="Version-only release history for the GTA lore archive, map atlas, trivia quiz, and Rockstar puzzle games, with every change documented.">
  <meta name="keywords" content="GTA fan site changelog, site updates, GTA lore archive updates">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="Site Changelog: GTA Lore, Maps, Trivia &amp; Puzzle Updates">
  <meta property="og:description" content="Release history for the GTA lore archive, map atlas, trivia quiz, and Rockstar puzzle games.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  <link rel="stylesheet" href="assets/styles.css">
  <style>
    .changelog-main { max-width: 860px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .changelog-main h1 { font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .changelog-main .lede { color: var(--muted); font-size: 1.05rem; max-width: 68ch; }
    .changelog-release { margin-top: 2.4rem; padding-top: 1.6rem; border-top: 1px solid var(--line); }
    .changelog-release h2 { font-size: clamp(1.3rem, 3vw, 1.8rem); margin: 0 0 0.3rem; }
    .changelog-release h2 span { color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; }
    .changelog-release h3 { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-2); margin: 1.5rem 0 0.6rem; }
    .changelog-release ul { padding-left: 1.1rem; line-height: 1.75; }
    .changelog-release li { margin-bottom: 0.35rem; }
    .changelog-main a { color: var(--accent-2); }
    .changelog-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
  </style>
</head>
<body>
  <main class="changelog-main">
    <nav class="changelog-breadcrumb" aria-label="Breadcrumb"><a href="./">Home</a> / Changelog</nav>
    <h1>Changelog</h1>
    <p class="lede">Version-only release history for FIVE STAR WANTED. The machine-readable source also lives in <a href="CHANGELOG.md">CHANGELOG.md</a>.</p>
    ${sections}
  </main>
</body>
</html>`, { prefix: "", active: "changelog", site });
}

function contactPage() {
  const canonical = `${siteUrl}contact.html`;
  const contact = site.umbrella.contactUrl;
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="home">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Contact the GTA Fan Archive: Corrections &amp; Takedowns</title>
  <meta name="description" content="Contact the GTA fan archive about corrections, permissions, or takedown requests through the Brynsites umbrella site. No email is published here.">
  <meta name="keywords" content="GTA fan archive contact, corrections, takedown request, Brynsites contact">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="Contact the GTA Fan Archive: Corrections &amp; Takedowns">
  <meta property="og:description" content="Corrections, permissions, and takedowns for the GTA fan archive are handled through the Brynsites umbrella site.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  <link rel="stylesheet" href="assets/styles.css">
  <style>
    .contact-main { max-width: 760px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .contact-main h1 { font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .contact-main p { line-height: 1.7; }
    .contact-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .contact-card { margin-top: 2rem; padding: 1.3rem; border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: calc(var(--radius) * 0.8); background: color-mix(in srgb, var(--surface-solid) 82%, transparent); }
  </style>
</head>
<body>
  <main class="contact-main">
    <nav class="contact-breadcrumb" aria-label="Breadcrumb"><a href="./">Home</a> / Contact</nav>
    <h1>Contact</h1>
    <p>FIVE STAR WANTED is a personal fan project, not a company. Contact is handled through the ${esc(site.umbrella.name)} umbrella site so the details stay in one place.</p>
    <div class="contact-card">
      <h2>Corrections, permissions, and takedowns</h2>
      <p>If something here is wrong, misattributed, or needs to be removed, use the ${esc(site.umbrella.name)} contact page. Please include the page URL and the specific issue.</p>
      <p><a class="btn btn-primary" href="${esc(contact)}" rel="noopener">Open the ${esc(site.umbrella.name)} contact page</a></p>
    </div>
    <p class="small muted">No email address is published on this subdomain. The umbrella contact page is the current source of truth.</p>
  </main>
</body>
</html>`, { prefix: "", active: "contact", site });
}

function creditsPage() {
  const canonical = `${siteUrl}credits.html`;
  const cards = Object.entries(imageCredits).map(([key, credit]) => `<figure class="credit-card">
    <img src="${esc(credit.file)}" alt="${esc(credit.alt)}" loading="lazy">
    <figcaption>
      <h2>${esc(credit.title || key)}</h2>
      <p>${esc(credit.artist)} · ${esc(credit.license)}</p>
      <p class="source-links"><a href="${esc(credit.source)}" rel="noopener noreferrer" target="_blank">Original file</a></p>
    </figcaption>
  </figure>`).join("");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Credits, Sources &amp; Licences</title>
  <meta name="description" content="Image credits plus text-source and licence details for the GTA lore archive: Wikimedia Commons photos, Wikipedia CC BY-SA 4.0, and GTA Wiki CC BY-SA 3.0.">
  <meta name="keywords" content="GTA fan archive credits, image licences, Wikipedia CC BY-SA, GTA Wiki CC BY-SA, content sources">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="Credits, Sources &amp; Licences">
  <meta property="og:description" content="Image credits plus text-source and licence details for the GTA lore archive.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  <link rel="stylesheet" href="assets/styles.css">
  <style>
    .credits-main { max-width: 1080px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .credits-main h1 { font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .credits-main .lede { color: var(--muted); max-width: 72ch; }
    .credit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; margin-top: 2rem; }
    .credit-card { margin: 0; border: 1px solid var(--line); border-radius: calc(var(--radius) * 0.8); overflow: hidden; background: color-mix(in srgb, var(--surface-solid) 82%, transparent); }
    .credit-card img { display: block; width: 100%; height: 160px; object-fit: cover; }
    .credit-card figcaption { padding: 0.8rem; }
    .credit-card h2 { margin: 0 0 0.3rem; font-size: 1rem; }
    .credit-card p { margin: 0.2rem 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; }
    .credit-card a { color: var(--accent-2); }
    .credits-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .credits-sources { max-width: 860px; margin-top: 2rem; }
    .credits-sources h2 { margin-top: 0; }
    .credits-sources a { color: var(--accent-2); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "FIVE STAR WANTED credits and licences",
    "url": "${canonical}",
    "description": "Image credits and text-source licences for FIVE STAR WANTED.",
    "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" }
  }
  </script>
</head>
<body>
  <main class="credits-main">
    <nav class="credits-breadcrumb" aria-label="Breadcrumb"><a href="./">Home</a> / Credits &amp; licences</nav>
    <h1>Credits, sources &amp; licences</h1>
    <p class="lede">These are real-world photos used as mood and place references, plus the text sources behind adapted lore entries. Images are not GTA screenshots, official artwork, or game assets.</p>
    <div class="credit-grid">${cards}</div>
    <section class="panel prose credits-sources" aria-labelledby="text-sources-title">
      <h2 id="text-sources-title">Text sources and licences</h2>
      <p>Lore entries are a mix of original editorial writing and adaptations from community references. Entries marked CC BY-SA carry an attribution and source link on the entry itself. Changes may have been made for length, clarity, and house style.</p>
      <ul>
        <li><strong>Wikipedia</strong> — adapted text is <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener noreferrer" target="_blank">CC BY-SA 4.0</a>, with a link to the source article.</li>
        <li><strong>GTA Wiki / Fandom</strong> — adapted text is <a href="https://creativecommons.org/licenses/by-sa/3.0/" rel="noopener noreferrer" target="_blank">CC BY-SA 3.0</a>, with a link to the source page.</li>
        <li><strong>Original code, CSS, SVG, and story notes</strong> — created for this project and not copied from the games.</li>
        <li><strong>Game titles, characters, and locations</strong> — trademarks of their respective owners; used here for commentary and reference.</li>
      </ul>
      <p>If you reuse adapted lore text from this site, keep the source attribution and the same CC BY-SA licence. For corrections or takedowns, use the <a href="contact.html">contact page</a>.</p>
    </section>
  </main>
</body>
</html>`, { prefix: "", active: "credits", site });
}

function arcadePage() {
  const canonical = `${siteUrl}arcade/`;
  const gameLinks = games.map((game) => `<a href="../games/${esc(game.slug)}/">${esc(game.name)}</a>`).join(" · ");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Play Free GTA Trivia Quiz &amp; Rockstar Puzzle Games Online</title>
  <meta name="description" content="Play free GTA trivia quizzes and Rockstar puzzle games. Test your knowledge across every era, crack vaults, plot heat-grid routes, and solve clue dossiers.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <meta name="keywords" content="GTA trivia quiz, GTA trivia questions and answers, Rockstar trivia, Rockstar puzzle games, GTA puzzle games, free online trivia, GTA quiz game">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="Play Free GTA Trivia Quiz &amp; Rockstar Puzzle Games Online">
  <meta property="og:description" content="Play free GTA trivia quizzes and Rockstar puzzle games: daily trivia, vault cracking, heat-grid routes, and clue dossiers. No account needed.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="stylesheet" href="../assets/fonts/fonts.css">
  <link rel="stylesheet" href="../assets/styles.css">
  <style>
    .arcade-main { max-width: 1040px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .arcade-main h1 { font-size: clamp(2.1rem, 6vw, 3.8rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .arcade-main .lede { color: var(--muted); font-size: 1.1rem; max-width: 72ch; line-height: 1.7; }
    .arcade-main h2 { margin: 2.6rem 0 0.9rem; padding-bottom: 0.4rem; border-bottom: 2px solid var(--accent); }
    .arcade-main h3 { margin: 0.2rem 0 0.6rem; font-size: clamp(1.25rem, 3vw, 1.6rem); }
    .arcade-main p, .arcade-main li { line-height: 1.7; }
    .arcade-main a { color: var(--accent-2); }
    .arcade-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .arcade-actions { display: flex; gap: 0.7rem; flex-wrap: wrap; margin-top: 1.5rem; }
    .arcade-grid { display: grid; gap: 1rem; margin-top: 1.2rem; }
    @media (min-width: 760px) { .arcade-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .arcade-card { padding: 1.3rem; border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: calc(var(--radius) * 0.8); background: color-mix(in srgb, var(--surface-solid) 82%, transparent); }
    .arcade-card ul { padding-left: 1.1rem; margin: 0.6rem 0 1rem; }
    .arcade-card li { margin-bottom: 0.3rem; }
    .arcade-card .eyebrow { color: var(--accent); }
    .arcade-note { padding: 1rem; border-left: 3px solid var(--accent-2); background: color-mix(in srgb, var(--accent-2) 8%, transparent); }
    .arcade-disclaimer { margin-top: 2.4rem; padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
    .arcade-steps { padding-left: 1.2rem; }
    .arcade-steps li { margin-bottom: 0.4rem; }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "${canonical}#webpage",
        "url": "${canonical}",
        "name": "Play Free GTA Trivia Quiz & Rockstar Puzzle Games",
        "description": "A free browser arcade with a GTA trivia quiz across every Rockstar era and three Rockstar puzzle games: Vault Cracker, Heat Grid, and Clue Dossier.",
        "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" },
        "inLanguage": "en"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "${siteUrl}" },
          { "@type": "ListItem", "position": 2, "name": "Arcade", "item": "${canonical}" }
        ]
      },
      {
        "@type": "ItemList",
        "name": "FIVE STAR WANTED arcade games",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Quiz",
              "name": "GTA Trivia Quiz",
              "url": "${canonical}#gta-trivia-quiz",
              "description": "A free GTA trivia quiz covering Vice City, San Andreas, Liberty City, Los Santos, and Leonida, with daily and era-filtered formats.",
              "about": ["Grand Theft Auto", "Rockstar Games", "video game trivia"],
              "educationalLevel": "Beginner to expert"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Game",
              "name": "Rockstar Puzzle Games",
              "url": "${canonical}#rockstar-puzzles",
              "description": "Vault Cracker, Heat Grid, and Clue Dossier: three generated Rockstar puzzle games with daily variants.",
              "genre": "Puzzle",
              "gamePlatform": "Web browser"
            }
          }
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <main class="arcade-main">
    <nav class="arcade-breadcrumb" aria-label="Breadcrumb"><a href="../">Home</a> / Arcade</nav>
    <p class="arcade-breadcrumb" style="margin-top:1.2rem">FIVE STAR WANTED // ARCADE</p>
    <h1>Play free GTA trivia and Rockstar puzzle games.</h1>
    <p class="lede">FIVE STAR WANTED is a fan-made Rockstar lore archive with a free browser arcade. Test your GTA trivia knowledge across Vice City, San Andreas, Liberty City, Los Santos, and Leonida, or switch to Rockstar puzzle games and crack a vault, plot a patrol route, or deduce a district from field notes. No account and no download.</p>
    <div class="arcade-actions">
      <a class="btn btn-primary" href="../#trivia">Play the GTA trivia quiz</a>
      <a class="btn btn-ghost" href="../#puzzles">Play the puzzle games</a>
    </div>

    <section aria-labelledby="arcade-modes">
      <h2 id="arcade-modes">Two ways to play</h2>
      <div class="arcade-grid">
        <article class="arcade-card" id="gta-trivia-quiz">
          <p class="eyebrow">Quiz</p>
          <h3>GTA Trivia Quiz</h3>
          <p>A free GTA trivia quiz written from public franchise knowledge, with a source note after each answer. Filter by era or play the daily run that refreshes at 00:00 UTC.</p>
          <ul>
            <li>Era filters: Vice City, San Andreas, GTA IV, GTA V, GTA VI, and classic GTA.</li>
            <li>Multiple formats, including fast runs, streak runs, and Five Star Wanted mode.</li>
            <li>Keyboard-friendly, mobile-friendly, and replayable with local best scores.</li>
          </ul>
          <a class="btn btn-primary btn-sm" href="../#trivia">Start a trivia run</a>
        </article>
        <article class="arcade-card" id="rockstar-puzzles" style="--accent:var(--accent-2)">
          <p class="eyebrow">Puzzles</p>
          <h3>Rockstar Puzzle Games</h3>
          <p>Three generated puzzle loops built for the theme. Every board is replayable, and daily variants use the same UTC seed for everyone.</p>
          <ul>
            <li><strong>Vault Cracker</strong> — deduce a safe code from feedback clues.</li>
            <li><strong>Heat Grid</strong> — plot a route through patrols without getting caught.</li>
            <li><strong>Clue Dossier</strong> — identify a district from field notes and map hints.</li>
          </ul>
          <a class="btn btn-primary btn-sm" href="../#puzzles">Open the puzzles</a>
        </article>
      </div>
    </section>

    <section aria-labelledby="arcade-daily">
      <h2 id="arcade-daily">Daily trivia and daily puzzles</h2>
      <p>Both daily challenges use the UTC date as their seed, so everyone gets the same run for that day. A local streak tracks how many days in a row you have played. Progress, badges, and preferences are stored in your browser with <code>localStorage</code> — there is no sign-up and no server-side profile.</p>
      <p class="arcade-note">The arcade is part of a non-commercial fan project. It is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive.</p>
    </section>

    <section aria-labelledby="arcade-how">
      <h2 id="arcade-how">How to play</h2>
      <ol class="arcade-steps">
        <li>Open the <a href="../#trivia">GTA trivia quiz</a> or the <a href="../#puzzles">Rockstar puzzle games</a>.</li>
        <li>Pick an era or a daily challenge, then choose a format or puzzle type.</li>
        <li>Play in the browser. Scores, streaks, and badges save locally on your device.</li>
        <li>Want the lore behind an answer? Follow the source note or browse the <a href="../archive.html">full-text lore archive</a>.</li>
      </ol>
    </section>

    <section aria-labelledby="arcade-more">
      <h2 id="arcade-more">Before or after you play</h2>
      <p>The arcade sits alongside a partial Rockstar lore archive. Read the <a href="../story.html">GTA story timeline</a>, browse <a href="../archive.html">characters, locations, factions, and story beats</a>, or open a per-game dossier: ${gameLinks}.</p>
      <p>Start at the <a href="../">interactive archive home</a>, compare the fiction with the real world in <a href="../#reel">Real vs Reel</a>, or check the <a href="../credits.html">image credits</a> for the real-world photos used across the site.</p>
    </section>

    <p class="arcade-disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. All game names, characters, locations, and trademarks belong to their respective owners. Trivia, puzzle logic, and all original copy on this page were written for this project.</p>
  </main>
</body>
</html>`, { prefix: "", active: "play", site });
}

function atlasPage() {
  const canonical = `${siteUrl}atlas/`;
  const maps = Object.entries(atlas).map(([era, entry]) => {
    const game = gameByEra.get(era);
    const locations = (entry.locations || []).map((spot) => `<li><strong>${esc(spot.name)}</strong> — ${esc(spot.kind)}. ${esc(spot.note)}</li>`).join("");
    const image = entry.map && entry.map.src
      ? `<figure class="map-shot"><img src="../${esc(entry.map.src)}" alt="${esc(entry.title)} map with fan-annotated districts and landmarks" loading="lazy" decoding="async"><figcaption>${esc(entry.map.credit)} · <a href="${esc(entry.map.source)}" rel="noopener noreferrer" target="_blank">map source</a></figcaption></figure>`
      : `<p class="arcade-note">No official world map for this entry - a fan-made theme postcard and district dossier instead.</p>`;
    return `<article class="map-card" id="map-${esc(era)}">
      ${image}
      <div class="map-copy">
        <p class="eyebrow">${esc(eraNames[era] || era)}</p>
        <h2>${esc(entry.title)}</h2>
        <p>${esc(entry.subtitle)}</p>
        <ul>${locations}</ul>
        <p class="map-links">
          <a class="btn btn-ghost btn-sm" href="../#atlas">Open this map interactively</a>
          ${game ? `<a class="btn btn-quiet btn-sm" href="../games/${esc(game.slug)}/">${esc(game.name)} dossier</a>` : ""}
        </p>
      </div>
    </article>`;
  }).join("");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GTA Maps: Leonida, Vice City, San Andreas &amp; Los Santos</title>
  <meta name="description" content="Browse GTA maps for Leonida, Vice City, San Andreas, Los Santos, and Liberty City with fan-annotated districts, landmarks, and links to their real-world cities.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <meta name="keywords" content="GTA map, GTA maps, GTA VI Leonida map, Vice City map, San Andreas map, Los Santos map, Liberty City map, GTA locations, GTA atlas">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="GTA Maps: Leonida, Vice City, San Andreas &amp; Los Santos">
  <meta property="og:description" content="Fan-annotated GTA maps for every game, from Leonida and Vice City to San Andreas, Los Santos, and Liberty City.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="stylesheet" href="../assets/fonts/fonts.css">
  <link rel="stylesheet" href="../assets/styles.css">
  <style>
    .maps-main { max-width: 1080px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .maps-main h1 { font-size: clamp(2.1rem, 6vw, 3.8rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .maps-main .lede { color: var(--muted); font-size: 1.1rem; max-width: 72ch; line-height: 1.7; }
    .maps-main h2 { font-size: clamp(1.4rem, 3vw, 2rem); margin: 0.2rem 0 0.4rem; }
    .maps-main p, .maps-main li { line-height: 1.7; }
    .maps-main a { color: var(--accent-2); }
    .maps-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .maps-list { display: grid; gap: 1.4rem; margin-top: 2rem; }
    .map-card { display: grid; gap: 1.2rem; padding: 1.2rem; border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: calc(var(--radius) * 0.8); background: color-mix(in srgb, var(--surface-solid) 82%, transparent); }
    @media (min-width: 820px) { .map-card { grid-template-columns: 300px minmax(0, 1fr); } }
    .map-shot { margin: 0; }
    .map-shot img { display: block; width: 100%; height: auto; border-radius: calc(var(--radius) * 0.6); }
    .map-shot figcaption { margin-top: 0.4rem; color: var(--muted); font-family: var(--font-mono); font-size: 0.68rem; }
    .map-copy ul { padding-left: 1.1rem; margin: 0.8rem 0 1rem; }
    .map-copy li { margin-bottom: 0.35rem; }
    .map-links { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .maps-note { padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "${canonical}#webpage",
        "url": "${canonical}",
        "name": "GTA Maps: Leonida, Vice City, San Andreas, Los Santos & Liberty City",
        "description": "Fan-annotated maps for every GTA era, with districts, landmarks, and links to the real-world cities that inspired them.",
        "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" },
        "inLanguage": "en"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "${siteUrl}" },
          { "@type": "ListItem", "position": 2, "name": "GTA maps", "item": "${canonical}" }
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <main class="maps-main">
    <nav class="maps-breadcrumb" aria-label="Breadcrumb"><a href="../">Home</a> / GTA maps</nav>
    <p class="maps-breadcrumb" style="margin-top:1.2rem">GTA MAP ATLAS</p>
    <h1>GTA maps, district by district.</h1>
    <p class="lede">Every major GTA map in one place: Leonida and Vice City, San Andreas and Los Santos, Liberty City, the Red Dead frontier, Bullworth, and The Warriors' New York. Each entry lists fan-annotated districts and landmarks, with a link to the interactive version and the game dossier. None of the annotations are official cartography.</p>
    <p><a class="btn btn-primary btn-sm" href="../#atlas">Open the interactive GTA map</a> <a class="btn btn-ghost btn-sm" href="../real-vs-reel/">Compare GTA cities with real life</a></p>
    <div class="maps-list">${maps}</div>
    <h2 style="margin-top:2.6rem">Which real city is each GTA map based on?</h2>
    <p>Vice City and Leonida echo Miami and Florida, Liberty City echoes New York, Los Santos echoes Los Angeles, San Fierro echoes San Francisco, Las Venturas echoes Las Vegas, and Saint Denis echoes New Orleans. The <a href="../real-vs-reel/">GTA vs real life comparison</a> puts each pair side by side.</p>
    <p class="maps-note">Unofficial fan project. Map artwork belongs to Rockstar Games and is credited with each image. Annotations are fan-made and not official cartography. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive.</p>
  </main>
</body>
</html>`, { prefix: "", active: "atlas", site });
}

function realWorldPage() {
  const canonical = `${siteUrl}real-vs-reel/`;
  const cards = realWorld.map((place) => {
    const game = gameByEra.get(place.era);
    const credit = imageCredits[place.image];
    return `<article class="place-card" id="${esc(place.id)}">
      ${credit ? `<img src="../${esc(credit.file)}" alt="${esc(credit.alt)}" loading="lazy" decoding="async">` : ""}
      <div class="place-copy">
        <p class="eyebrow">${esc(place.realName)}</p>
        <h2>${esc(place.fictionalName)}</h2>
        <p>${esc(place.note)}</p>
        ${credit ? `<p class="place-credit">Photo: ${esc(credit.artist)} (${esc(credit.license)}) · <a href="${esc(credit.source)}" rel="noopener noreferrer" target="_blank">source</a></p>` : ""}
        <p class="place-links"><a href="../atlas/#map-${esc(place.era)}">See the ${esc(place.fictionalName)} map</a>${game ? ` · <a href="../games/${esc(game.slug)}/">${esc(game.name)} story and characters</a>` : ""}</p>
      </div>
    </article>`;
  }).join("");
  return decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GTA vs Real Life: Miami, New York &amp; LA Behind the Games</title>
  <meta name="description" content="See the real cities behind Vice City, Liberty City, and Los Santos: Miami, New York, Los Angeles, New Orleans, and more compared with the fiction.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <meta name="keywords" content="GTA vs real life, Vice City Miami, Liberty City New York, Los Santos Los Angeles, GTA real world locations, GTA map comparisons">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="GTA vs Real Life: Miami, New York &amp; LA Behind the Games">
  <meta property="og:description" content="Miami, New York, Los Angeles, San Francisco, Las Vegas, New Orleans, and London compared with their GTA counterparts.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="stylesheet" href="../assets/fonts/fonts.css">
  <link rel="stylesheet" href="../assets/styles.css">
  <style>
    .places-main { max-width: 1080px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .places-main h1 { font-size: clamp(2.1rem, 6vw, 3.8rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .places-main .lede { color: var(--muted); font-size: 1.1rem; max-width: 72ch; line-height: 1.7; }
    .places-main h2 { font-size: clamp(1.4rem, 3vw, 1.9rem); margin: 0.2rem 0 0.4rem; }
    .places-main p { line-height: 1.7; }
    .places-main a { color: var(--accent-2); }
    .places-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .places-grid { display: grid; gap: 1rem; margin-top: 2rem; }
    @media (min-width: 760px) { .places-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .place-card { overflow: hidden; border: 1px solid var(--line); border-radius: calc(var(--radius) * 0.8); background: color-mix(in srgb, var(--surface-solid) 82%, transparent); }
    .place-card img { display: block; width: 100%; height: 190px; object-fit: cover; filter: saturate(0.85); }
    .place-copy { padding: 1rem 1.1rem 1.2rem; }
    .place-credit { color: var(--muted); font-family: var(--font-mono); font-size: 0.68rem; }
    .place-links { margin-bottom: 0; }
    .places-note { margin-top: 2.2rem; padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "${canonical}#webpage",
        "url": "${canonical}",
        "name": "GTA vs Real Life: the cities behind Vice City, Liberty City, and Los Santos",
        "description": "A side-by-side comparison of real cities and their GTA counterparts, with photos, notes, and map links.",
        "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" },
        "inLanguage": "en"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "${siteUrl}" },
          { "@type": "ListItem", "position": 2, "name": "GTA vs real life", "item": "${canonical}" }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Real cities behind GTA locations",
        "itemListElement": [${realWorld.map((place, index) => `
          { "@type": "ListItem", "position": ${index + 1}, "name": ${JSON.stringify(`${place.realName} / ${place.fictionalName}`)}, "url": "${canonical}#${esc(place.id)}" }`).join(",")}
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <main class="places-main">
    <nav class="places-breadcrumb" aria-label="Breadcrumb"><a href="../">Home</a> / GTA vs real life</nav>
    <p class="places-breadcrumb" style="margin-top:1.2rem">REAL WORLD / REEL WORLD</p>
    <h1>GTA vs real life: the cities behind the games.</h1>
    <p class="lede">Vice City is Miami. Liberty City is New York. Los Santos is Los Angeles. This page pairs each fictional GTA location with the real city that inspired it, with photos, notes, and links to the matching map. These are real-world photographs, not game artwork.</p>
    <p><a class="btn btn-primary btn-sm" href="../atlas/">Browse the GTA map atlas</a> <a class="btn btn-ghost btn-sm" href="../#reel">Open the interactive comparison map</a></p>
    <div class="places-grid">${cards}</div>
    <p class="places-note">Fan-made comparisons for commentary and context. Photos are credited to their photographers and licences. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive.</p>
  </main>
</body>
</html>`, { prefix: "", active: "reel", site });
}

const archive = decoratePage(`<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GTA Lore Archive: Characters, Locations &amp; Story (1961–2026)</title>
  <meta name="description" content="Full-text GTA lore archive: characters, locations, factions, and story beats from 1961 London to 2026 Leonida, plus links to the trivia quiz and puzzles.">
  <meta name="keywords" content="GTA lore, GTA characters, GTA locations, GTA factions, GTA story, GTA archive, Rockstar lore">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${siteUrl}archive.html">
  <meta property="og:title" content="GTA Lore Archive: Characters, Locations &amp; Story (1961–2026)">
  <meta property="og:description" content="All GTA lore entries, characters, locations, and the full story timeline in one static, readable archive.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${siteUrl}archive.html">
  <meta property="og:image" content="${siteUrl}assets/og-cover.png">
  <meta name="theme-color" content="#050914">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  <link rel="stylesheet" href="assets/styles.css">
  <style>
    body { background: var(--bg); color: var(--ink); }
    .archive-main { max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .archive-main h1 { font-size: clamp(2rem, 6vw, 3.6rem); line-height: 1.05; margin: 0.4rem 0 1rem; }
    .archive-main h2 { margin: 2.5rem 0 0.8rem; padding-bottom: 0.4rem; border-bottom: 2px solid var(--accent); }
    .archive-main h3 { margin: 1.6rem 0 0.3rem; }
    .archive-main article { padding: 0.8rem 0; border-bottom: 1px solid var(--line); }
    .archive-main p { line-height: 1.65; }
    .archive-main .meta, .archive-main .tags { color: var(--muted); font-family: var(--font-mono); font-size: 0.78rem; }
    .archive-main .year { color: var(--accent); font-family: var(--font-mono); margin-right: 0.5rem; }
    .archive-main .disclaimer { padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
    .archive-main a { color: var(--accent-2); }
    .license-note { color: var(--muted); font-family: var(--font-mono); font-size: 0.64rem; line-height: 1.55; }
    .archive-nav { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0 2rem; }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "FIVE STAR WANTED - Full Text Archive",
    "url": "${siteUrl}archive.html",
    "description": "All curated lore entries and the full in-universe GTA story timeline from FIVE STAR WANTED.",
    "isPartOf": { "@type": "WebSite", "name": "FIVE STAR WANTED", "url": "${siteUrl}" },
    "inLanguage": "en",
    "about": ["Grand Theft Auto", "Rockstar Games", "video game lore"]
  }
  </script>
</head>
<body>
  <main class="archive-main">
    <p class="meta">FIVE STAR WANTED // FULL TEXT ARCHIVE</p>
    <h1>The story, in plain text.</h1>
    <p>This page is a static, JavaScript-free archive of the lore entries and story beats currently on the site. It is a partial archive, not a complete lore database. It exists so the content can be read, linked, indexed, and summarised without running the app.</p>
    <p class="disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. All game names, characters, locations, and trademarks belong to their respective owners. Summaries below are original or adapted from CC BY-SA sources; see each entry's attribution and source links.</p>
    <p class="meta">This archive contains full story details. Treat it as a spoiler zone.</p>
    <nav class="archive-nav">
      <a href="./">Interactive site</a>
      <a href="./#games">Games</a>
      <a href="#lore">Lore entries</a>
      <a href="#story">Story timeline</a>
      <a href="llms.txt">llms.txt</a>
    </nav>

    <section id="lore">
      <h2>Lore archive</h2>
      ${loreSections}
    </section>

    <section id="story">
      <h2>GTA story timeline</h2>
      ${storySections}
    </section>
  </main>
</body>
</html>`, { prefix: "", active: "lore", site });


const sitemapUrls = [
  { loc: siteUrl, priority: "1.0" },  { loc: `${siteUrl}arcade/`, priority: "0.9" },
  { loc: `${siteUrl}atlas/`, priority: "0.9" },
  { loc: `${siteUrl}real-vs-reel/`, priority: "0.7" },
  { loc: `${siteUrl}archive.html`, priority: "0.9" },
  { loc: `${siteUrl}elsewhere.html`, priority: "0.7" },
  { loc: `${siteUrl}story.html`, priority: "0.8" },
  { loc: `${siteUrl}changelog.html`, priority: "0.4" },
  { loc: `${siteUrl}credits.html`, priority: "0.5" },
  { loc: `${siteUrl}contact.html`, priority: "0.3" },
  ...games.map((game) => ({ loc: `${siteUrl}games/${game.slug}/`, priority: "0.8" }))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((item) => `  <url>
    <loc>${item.loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow:

Sitemap: ${siteUrl}sitemap.xml
`;

const llms = `# FIVE STAR WANTED

> FIVE STAR WANTED is an independent, non-commercial fan archive and browser arcade for the Rockstar universe. It is a partial archive, not a complete lore database. It contains curated lore entries and in-universe Grand Theft Auto story beats from 1961 London to 2026 Leonida, a GTA map atlas of Leonida, Vice City, San Andreas, Los Santos, and Liberty City, GTA vs real life city comparisons, a free GTA trivia quiz, and Rockstar puzzle games. It is a Brynsites miscellany project and is not affiliated with Rockstar Games or Take-Two Interactive.

Canonical site: ${siteUrl}
GTA map atlas: ${siteUrl}atlas/
GTA vs real life: ${siteUrl}real-vs-reel/
Arcade (GTA trivia quiz and puzzle games): ${siteUrl}arcade/
Full text archive: ${siteUrl}archive.html

## What is here

- [Lore archive](${siteUrl}archive.html#lore): locations, characters, factions, and franchise history, with sources.
- [Story timeline](${siteUrl}archive.html#story): chronological GTA story beats, including full spoiler details.
- [Story reading mode](${siteUrl}story.html): a graphical scroll-driven timeline page.
- [GTA map atlas](${siteUrl}atlas/): maps of Leonida, Vice City, San Andreas, Los Santos, Liberty City, the Red Dead frontier, Bullworth, and The Warriors' New York, with fan annotations.
- [GTA vs real life](${siteUrl}real-vs-reel/): Miami, New York, Los Angeles, San Francisco, Las Vegas, New Orleans, and London compared with their GTA counterparts.
- [Arcade](${siteUrl}arcade/): play a free GTA trivia quiz and Rockstar puzzle games, including daily challenges.
- [Games](${siteUrl}#games): theme-per-game dossiers.
- [Rockstar Beyond GTA](${siteUrl}elsewhere.html): Max Payne, Manhunt, Midnight Club, and L.A. Noire.
- [Interactive site](${siteUrl}): theme-morphing lore hub, horizontal story timeline, GTA map atlas, GTA vs real life map, trivia quiz, and puzzle games.
- [Changelog](${siteUrl}changelog.html): public release history.
- [Credits and licences](${siteUrl}credits.html): image credits, text sources, and CC BY-SA licence terms.
- [Contact](${siteUrl}contact.html): corrections and permissions via ${site.umbrella.name}.

## Game pages

${games.map((game) => `- [${game.name}](${siteUrl}games/${game.slug}/): ${game.blurb}`).join("\n")}

## Content inventory

- Lore entries: ${lore.map((item) => item.title).join(", ")}.
- Story beats from ${story[0].year} to ${story[story.length - 1].year}: ${story.map((event) => `${event.year} ${event.title}`).join("; ")}.

## Sourcing and license

- Lore summaries are a mix of original writing and adaptations from CC BY-SA sources (Wikipedia 4.0, GTA Wiki/Fandom 3.0). Each adapted entry carries an attribution and source link. Story notes remain original editorial writing.
- Adapted text is shared under the same CC BY-SA terms as its source; changes may have been made.
- Live Wikipedia summaries, when requested, are CC BY-SA and are attributed with a source link.
- Live GTA Wiki summaries, when requested, are CC BY-SA via Fandom and are attributed with a source link.
- This is a partial archive and does not cover every game, character, location, or story beat.
- Map comparisons use OpenFreeMap and OpenStreetMap data with attribution.
- Game titles, characters, locations, and trademarks remain the property of their respective owners.

## Disclaimer

This is a personal hobby and portfolio project, not a commercial product and not an official Rockstar resource. If a rights holder believes anything here oversteps, contact the site owner and the content will be removed or changed promptly.
`;

function changelogMarkdown() {
  const lines = ["# Changelog", "", "Version-only release history for FIVE STAR WANTED.", ""];
  changelog.forEach((release) => {
    lines.push(`## v${release.version}${release.label ? ` — ${release.label}` : ""}`, "");
    const block = (title, items) => {
      if (!items || !items.length) return;
      lines.push(`### ${title}`, "");
      items.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    };
    block("Added", release.added);
    block("Changed", release.changed);
    block("Fixed", release.fixed);
    block("Notes", release.notes);
  });
  return lines.join("\n");
}

const searchBase = new URL(siteUrl).pathname.replace(/\/?$/, "/");
const searchIndex = [
  { title: "Home", subtitle: "Lore-first landing page", href: `${searchBase}#home`, type: "Page", keywords: "home start archive" },
  { title: "Games", subtitle: "Theme-per-game dossiers", href: `${searchBase}#games`, type: "Page", keywords: "games dossiers" },
  { title: "Lore", subtitle: "Locations, characters, factions", href: `${searchBase}#lore`, type: "Page", keywords: "lore archive characters locations" },
  { title: "Story timeline", subtitle: "In-universe chronology", href: `${searchBase}#story`, type: "Page", keywords: "story timeline chronology" },
  { title: "GTA map atlas", subtitle: "Leonida, Vice City, San Andreas, Los Santos, and Liberty City", href: `${searchBase}atlas/`, type: "Page", keywords: "GTA map GTA maps Vice City map San Andreas map Los Santos map Liberty City map Leonida map locations atlas" },
  { title: "GTA vs real life", subtitle: "Real cities behind Vice City, Liberty City, and Los Santos", href: `${searchBase}real-vs-reel/`, type: "Page", keywords: "GTA vs real life Vice City Miami Liberty City New York Los Santos Los Angeles comparisons" },
  { title: "Arcade", subtitle: "Trivia and puzzles", href: `${searchBase}#play`, type: "Page", keywords: "arcade trivia puzzles" },
  { title: "GTA trivia quiz and Rockstar puzzle games", subtitle: "Free browser arcade guide", href: `${searchBase}arcade/`, type: "Page", keywords: "GTA trivia quiz Rockstar trivia puzzle games vault cracker heat grid clue dossier daily quiz" },
  { title: "About", subtitle: "Project and IP notes", href: `${searchBase}#about`, type: "Page", keywords: "about disclaimer" },
  { title: "Full-text archive", subtitle: "Static lore and story reading page", href: `${searchBase}archive.html`, type: "Page", keywords: "archive static full text" },
  { title: "Story reading mode", subtitle: "Scroll-driven timeline", href: `${searchBase}story.html`, type: "Page", keywords: "story reading" },
  { title: "Rockstar Beyond GTA", subtitle: "Max Payne, Manhunt, Midnight Club, L.A. Noire", href: `${searchBase}elsewhere.html`, type: "Page", keywords: "elsewhere max payne manhunt midnight club la noire" },
  { title: "Changelog", subtitle: "Version-only release history", href: `${searchBase}changelog.html`, type: "Page", keywords: "changelog releases versions" },
  { title: "Credits and licences", subtitle: "Photo sources, text sources, and CC BY-SA terms", href: `${searchBase}credits.html`, type: "Page", keywords: "credits images photos licences sources Wikipedia GTA Wiki CC BY-SA" },
  { title: "Contact", subtitle: "Corrections and permissions", href: `${searchBase}contact.html`, type: "Page", keywords: "contact corrections takedown" },
  ...lore.map((item) => ({ title: item.title, subtitle: item.summary, href: `${searchBase}archive.html#lore-${item.id}`, type: "Lore", keywords: [item.era, item.type, ...(item.tags || [])].join(" ") })),
  ...story.map((event) => ({ title: `${event.year} — ${event.title}`, subtitle: event.summary, href: `${searchBase}archive.html#story-${event.id}`, type: "Story", keywords: [event.game, event.era, ...(event.characters || []), ...(event.locations || [])].join(" ") })),
  ...games.map((game) => ({ title: game.name, subtitle: game.blurb, href: `${searchBase}games/${game.slug}/`, type: "Game", keywords: [game.year, game.era, ...(game.characters || []), ...(game.locations || [])].join(" ") }))
];

fs.writeFileSync(path.join(root, "archive.html"), archive);
fs.mkdirSync(path.join(root, "arcade"), { recursive: true });
fs.writeFileSync(path.join(root, "arcade", "index.html"), arcadePage());
fs.mkdirSync(path.join(root, "atlas"), { recursive: true });
fs.writeFileSync(path.join(root, "atlas", "index.html"), atlasPage());
fs.mkdirSync(path.join(root, "real-vs-reel"), { recursive: true });
fs.writeFileSync(path.join(root, "real-vs-reel", "index.html"), realWorldPage());
fs.writeFileSync(path.join(root, "story.html"), storyPage());
fs.writeFileSync(path.join(root, "elsewhere.html"), elsewherePage());
fs.writeFileSync(path.join(root, "changelog.html"), changelogPage());
fs.writeFileSync(path.join(root, "CHANGELOG.md"), changelogMarkdown());
fs.writeFileSync(path.join(root, "contact.html"), contactPage());
fs.writeFileSync(path.join(root, "credits.html"), creditsPage());
fs.writeFileSync(path.join(root, "assets/js/search-index.js"), `window.CS_SEARCH_INDEX = ${JSON.stringify(searchIndex, null, 2)};\n`);
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(root, "robots.txt"), robots);
fs.writeFileSync(path.join(root, "llms.txt"), llms);

for (const game of games) {
  const dir = path.join(root, "games", game.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), gamePage(game));
}

const indexPath = path.join(root, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
index = index
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${siteUrl}">`)
  .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${siteUrl}">`)
  .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${siteUrl}assets/og-cover.png">`)
  .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${siteUrl}assets/og-cover.png">`);
fs.writeFileSync(indexPath, index);

function buildCspHeaders() {
  const htmlFiles = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "tests") continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) htmlFiles.push(full);
    }
  }
  walk(root);

  const scriptHashes = new Set();
  const styleHashes = new Set();
  const sha = (value) => `'sha256-${createHash("sha256").update(value, "utf8").digest("base64")}'`;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (match[1].trim()) scriptHashes.add(sha(match[1]));
    }
    for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      if (match[1].trim()) styleHashes.add(sha(match[1]));
    }
  }

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: https:",
    `style-src 'self'${styleHashes.size ? " " + [...styleHashes].join(" ") : ""}`,
    "style-src-attr 'unsafe-inline'",
    `script-src 'self'${scriptHashes.size ? " " + [...scriptHashes].join(" ") : ""}`,
    "script-src-attr 'none'",
    "font-src 'self'",
    "connect-src 'self' https://en.wikipedia.org https://gta.fandom.com https://*.openfreemap.org https://*.openstreetmap.org https://*.maplibre.org",
    "media-src 'self' https://ccradio.ellak.gr https://mp3.theradio.cc https://*.somafm.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "manifest-src 'self'"
  ].join("; ");

  const headers = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
  Content-Security-Policy: ${csp}
`;
  fs.writeFileSync(path.join(root, "_headers"), headers);
}

buildCspHeaders();

console.log("generated archive.html, arcade/index.html, atlas/index.html, real-vs-reel/index.html, story.html, elsewhere.html, changelog.html, contact.html, credits.html, search-index.js, sitemap.xml, robots.txt, llms.txt, _headers, and", games.length, "game pages for", siteUrl);
