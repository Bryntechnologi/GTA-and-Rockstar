import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "site.config.json");
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
const siteUrl = (process.env.SITE_URL || config.siteUrl || "https://channelsurf.pages.dev/").replace(/\/?$/, "/");
const lore = JSON.parse(fs.readFileSync(path.join(root, "data/lore.json"), "utf8"));
const story = JSON.parse(fs.readFileSync(path.join(root, "data/story-timeline.json"), "utf8"));
const games = JSON.parse(fs.readFileSync(path.join(root, "data/games.json"), "utf8"));
const elsewhere = JSON.parse(fs.readFileSync(path.join(root, "data/elsewhere.json"), "utf8"));
const imageCredits = JSON.parse(fs.readFileSync(path.join(root, "data/image-credits.json"), "utf8"));
const loreById = new Map(lore.map((item) => [item.id, item]));
const storyById = new Map(story.map((item) => [item.id, item]));

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

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

const loreByType = ["location", "character", "faction", "franchise"];
const loreSections = loreByType.map((type) => {
  const items = lore.filter((item) => (item.type || "location") === type);
  if (!items.length) return "";
  return `<section id="lore-${type}">
    <h2>${esc(type.charAt(0).toUpperCase() + type.slice(1))} entries</h2>
    ${items.map((item) => `<article id="lore-${esc(item.id)}">
      <h3>${esc(item.title)}</h3>
      <p class="meta">${esc(eraNames[item.era] || item.era)} · ${esc(item.type || "lore")}</p>
      <p>${esc(item.summary)}</p>
      ${item.tags ? `<p class="tags">${item.tags.map(esc).join(" · ")}</p>` : ""}
      <p><a href="${esc(item.source)}" rel="noopener noreferrer">Source</a></p>
    </article>`).join("")}
  </section>`;
}).join("");

const storySections = story.map((event) => `<article id="story-${esc(event.id)}">
  <h3><span class="year">${esc(event.year)}</span> ${esc(event.title)}</h3>
  <p class="meta">${esc(event.game)} · ${esc(eraNames[event.era] || event.era)}</p>
  <p>${esc(event.summary)}</p>
  <p>${esc(event.detail)}</p>
  <p class="tags">${[...(event.characters || []), ...(event.locations || [])].map(esc).join(" · ")}</p>
</article>`).join("");

function gamePage(game) {
  const gameLore = (game.loreIds || []).map((id) => loreById.get(id)).filter(Boolean);
  const gameStory = (game.storyIds || []).map((id) => storyById.get(id)).filter(Boolean);
  const relative = "../../";
  const canonical = `${siteUrl}games/${game.slug}/`;
  const credit = imageCredits[game.image];
  const photo = credit ? `<figure class="game-photo"><img src="${relative}${esc(credit.file)}" alt="${esc(credit.alt)}" loading="lazy"><figcaption>Real-world inspiration, not game artwork. Photo: ${esc(credit.artist)} (${esc(credit.license)}) · <a href="${esc(credit.source)}" rel="noopener noreferrer">source</a></figcaption></figure>` : "";
  const loreBlocks = gameLore.map((item) => `<article class="game-entry">    <p class="meta">${esc(item.type || "lore")}</p>
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.summary)}</p>
    <p><a href="${esc(item.source)}" rel="noopener noreferrer">Source</a></p>
  </article>`).join("");
  const storyBlocks = gameStory.map((event) => `<article class="game-entry">
    <h3><span class="year">${esc(event.year)}</span> ${esc(event.title)}</h3>
    <p class="meta">${esc(event.game)}</p>
    <p>${esc(event.summary)}</p>
    <p>${esc(event.detail)}</p>
  </article>`).join("");
  return `<!DOCTYPE html>
<html lang="en" data-era="${esc(game.theme)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(game.name)} — Lore, characters, and story | CHANNEL SURF</title>
  <meta name="description" content="${esc(game.blurb)} ${esc(game.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(game.name)} — CHANNEL SURF">
  <meta property="og:description" content="${esc(game.blurb)}">
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
    .game-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .game-disclaimer { margin-top: 2rem; padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${esc(game.name)} — CHANNEL SURF",
    "url": "${canonical}",
    "description": "${esc(game.blurb)}",
    "isPartOf": { "@type": "WebSite", "name": "CHANNEL SURF", "url": "${siteUrl}" },
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
      <p class="game-breadcrumb">CHANNEL SURF // GAME DOSSIER</p>
      <h1>${esc(game.name)}</h1>
      <p class="lede">${esc(game.description)}</p>
      <div class="game-meta">
        <span class="tag">${esc(game.year)}</span>
        <span class="tag">${esc(eraNames[game.era] || game.era)}</span>
        ${(game.characters || []).map((name) => `<span class="tag">${esc(name)}</span>`).join("")}
      </div>
      <div class="game-links">
        <a class="btn btn-ghost btn-sm" href="${relative}#story">Open the story timeline</a>
        <a class="btn btn-ghost btn-sm" href="${relative}#atlas">Open the atlas</a>
        <a class="btn btn-quiet btn-sm" href="${relative}#play">Play the arcade</a>
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
    </section>

    <p class="game-disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. All game names, characters, locations, and trademarks belong to their respective owners. Summaries are original editorial writing for this project. <a href="${esc(game.source)}" rel="noopener noreferrer">Source</a></p>
  </main>
</body>
</html>`;
}

function elsewherePage() {
  const canonical = `${siteUrl}elsewhere.html`;
  const cards = elsewhere.map((item) => {
    const credit = imageCredits[item.image];
    return `<article class="elsewhere-card" style="--elsewhere-accent:${esc(item.accent)};--card-display:'${esc(item.font || "Oswald")}'">
    ${credit ? `<img class="elsewhere-photo" src="${esc(credit.file)}" alt="${esc(credit.alt)}" loading="lazy">` : ""}
    <div class="elsewhere-head">
      <h2>${esc(item.name)}</h2>
      <span class="elsewhere-year">${esc(item.year)}</span>
    </div>
    <p class="elsewhere-genre">${esc(item.genre)}</p>
    <p>${esc(item.description)}</p>
    <p class="elsewhere-tags">${item.themes.map(esc).join(" · ")}</p>
    ${credit ? `<p class="elsewhere-credit">Photo: ${esc(credit.artist)} (${esc(credit.license)}) · <a href="${esc(credit.source)}" rel="noopener noreferrer">source</a></p>` : ""}
    <a href="${esc(item.source)}" rel="noopener noreferrer">Source</a>
  </article>`;
  }).join("");
  return `<!DOCTYPE html>
<html lang="en" data-era="gta4">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rockstar Elsewhere — Max Payne, Manhunt, Midnight Club | CHANNEL SURF</title>
  <meta name="description" content="A lightweight Rockstar Elsewhere dossier covering Max Payne, Manhunt, and Midnight Club: noir, stealth horror, and street racing beyond GTA.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="Rockstar Elsewhere — CHANNEL SURF">
  <meta property="og:description" content="Max Payne, Manhunt, and Midnight Club: three sides of Rockstar beyond GTA.">
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
    .elsewhere-year, .elsewhere-genre, .elsewhere-tags { color: var(--muted); font-family: var(--font-mono); font-size: 0.78rem; }
    .elsewhere-card p { line-height: 1.65; }
    .elsewhere-card a { color: var(--accent-2); }
    .elsewhere-breadcrumb { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .elsewhere-main .disclaimer { margin-top: 2rem; padding: 1rem; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Rockstar Elsewhere — Max Payne, Manhunt, Midnight Club",
    "url": "${canonical}",
    "description": "A lightweight dossier covering three Rockstar series beyond GTA.",
    "isPartOf": { "@type": "WebSite", "name": "CHANNEL SURF", "url": "${siteUrl}" },
    "inLanguage": "en",
    "about": ["Max Payne", "Manhunt", "Midnight Club", "Rockstar Games"]
  }
  </script>
</head>
<body>
  <main class="elsewhere-main">
    <nav class="elsewhere-breadcrumb" aria-label="Breadcrumb">
      <a href="./">Home</a> / <a href="./#games">Games</a> / Rockstar Elsewhere
    </nav>
    <p class="elsewhere-breadcrumb" style="margin-top:1.2rem">CHANNEL SURF // ROCKSTAR ELSEWHERE</p>
    <h1>Three doorways out of the city.</h1>
    <p class="lede">A lightweight dossier for Rockstar series that sit outside the GTA story timeline. Not new site-wide themes — just a look at the other edges of the catalog.</p>
    <div class="elsewhere-grid">${cards}</div>
    <p class="disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. All game names, characters, locations, and trademarks belong to their respective owners. Summaries are original editorial writing for this project.</p>
    <p class="elsewhere-breadcrumb"><a href="./">Return to the interactive archive</a> · <a href="archive.html">Full-text archive</a></p>
  </main>
</body>
</html>`;
}

function storyPage() {
  const canonical = `${siteUrl}story.html`;
  const cards = story.map((event) => `<article class="reading-card" data-era="${esc(event.era)}" style="--event-accent:${eraAccents[event.era] || "#ff5d7e"}">
    <div class="reading-year">${esc(event.year)}</div>
    <div class="reading-body">
      <p class="reading-kicker">${esc(event.game)}</p>
      <h2>${esc(event.title)}</h2>
      <p class="reading-summary">${esc(event.summary)}</p>
      <p>${esc(event.detail)}</p>
      <p class="reading-tags">${[...(event.characters || []), ...(event.locations || [])].map(esc).join(" · ")}</p>
    </div>
  </article>`).join("");
  return `<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GTA Story Timeline - 1961 to 2026 | CHANNEL SURF</title>
  <meta name="description" content="A graphical reading timeline of 35 major in-universe GTA story beats, from 1961 London through Vice City, San Andreas, Liberty City, Los Santos, and 2026 Leonida.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="GTA Story Timeline - CHANNEL SURF">
  <meta property="og:description" content="35 story beats, full spoilers, and a theme that shifts as you scroll.">
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
    "name": "GTA Story Timeline - CHANNEL SURF",
    "url": "${canonical}",
    "description": "35 in-universe Grand Theft Auto story beats in chronological order.",
    "isPartOf": { "@type": "WebSite", "name": "CHANNEL SURF", "url": "${siteUrl}" },
    "inLanguage": "en",
    "about": ["Grand Theft Auto", "Rockstar Games", "story timeline"]
  }
  </script>
</head>
<body>
  <main class="reading-main">
    <div class="reading-bar"><span>CHANNEL SURF // STORY TIMELINE</span><span>Era: <b id="readingEra">GTA VI</b></span></div>
    <p class="reading-kicker">READING MODE</p>
    <header class="reading-hero">
      <h1>The story, from 1961 to 2026.</h1>
      <p class="lede">35 major in-universe GTA story beats, in chronological order. The page theme shifts as each chapter enters view. Full story details follow.</p>
      <div class="reading-meta"><span class="tag">${story.length} story beats</span><span class="tag">Full spoilers</span><span class="tag">Original summaries</span></div>
      <div class="reading-actions"><a class="btn btn-primary btn-sm" href="./#story">Open interactive timeline</a><a class="btn btn-ghost btn-sm" href="archive.html">Full-text archive</a><a class="btn btn-quiet btn-sm" href="./">Back to the site</a></div>
    </header>
    <div class="reading-timeline">${cards}</div>
    <p class="reading-disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. All summaries are original editorial writing for this project.</p>
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
</html>`;
}

const archive = `<!DOCTYPE html>
<html lang="en" data-era="gta6">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CHANNEL SURF - Full Text Archive (Lore and GTA Story Timeline)</title>
  <meta name="description" content="Full text archive of CHANNEL SURF: 20 curated Rockstar lore entries and 35 in-universe Grand Theft Auto story beats from 1961 London to 2026 Leonida.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${siteUrl}archive.html">
  <meta property="og:title" content="CHANNEL SURF - Full Text Archive">
  <meta property="og:description" content="All lore entries and the full GTA story timeline in one static, readable page.">
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
    .archive-nav { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0 2rem; }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "CHANNEL SURF - Full Text Archive",
    "url": "${siteUrl}archive.html",
    "description": "All curated lore entries and the full in-universe GTA story timeline from CHANNEL SURF.",
    "isPartOf": { "@type": "WebSite", "name": "CHANNEL SURF", "url": "${siteUrl}" },
    "inLanguage": "en",
    "about": ["Grand Theft Auto", "Rockstar Games", "video game lore"]
  }
  </script>
</head>
<body>
  <main class="archive-main">
    <p class="meta">CHANNEL SURF // FULL TEXT ARCHIVE</p>
    <h1>The story, in plain text.</h1>
    <p>This page is a static, JavaScript-free archive of every lore entry and every story beat on the site. It exists so the content can be read, linked, indexed, and summarised without running the app.</p>
    <p class="disclaimer">Unofficial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. The games and their lore are not my work and are not part of any project I own or claim. All game names, characters, locations, and trademarks belong to their respective owners. All summaries below are original editorial writing for this project.</p>
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

    <footer>
      <p class="meta">CHANNEL SURF · Unofficial Rockstar lore archive and arcade · <a href="./">Return to the interactive site</a></p>
    </footer>
  </main>
</body>
</html>
`;

const sitemapUrls = [
  { loc: siteUrl, priority: "1.0" },
  { loc: `${siteUrl}archive.html`, priority: "0.9" },
  { loc: `${siteUrl}elsewhere.html`, priority: "0.7" },
  { loc: `${siteUrl}story.html`, priority: "0.8" },
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

const llms = `# CHANNEL SURF

> CHANNEL SURF is an independent, non-commercial fan archive and browser arcade for the Rockstar universe. It contains 20 curated lore entries and 35 in-universe Grand Theft Auto story beats from 1961 London to 2026 Leonida, plus an era atlas, real-vs-reel city comparisons, trivia, and puzzles. It is not affiliated with Rockstar Games or Take-Two Interactive.

Canonical site: ${siteUrl}
Full text archive: ${siteUrl}archive.html

## What is here

- [Lore archive](${siteUrl}archive.html#lore): locations, characters, factions, and franchise history, with sources.
- [Story timeline](${siteUrl}archive.html#story): 35 chronological GTA story beats, including full spoiler details.
- [Story reading mode](${siteUrl}story.html): a graphical scroll-driven timeline page.
- [Games](${siteUrl}#games): theme-per-game dossiers.
- [Rockstar Elsewhere](${siteUrl}elsewhere.html): Max Payne, Manhunt, Midnight Club, and L.A. Noire.
- [Interactive site](${siteUrl}): theme-morphing lore hub, horizontal story timeline, atlas, Real vs Reel map, trivia, and puzzles.

## Game pages

${games.map((game) => `- [${game.name}](${siteUrl}games/${game.slug}/): ${game.blurb}`).join("\n")}

## Content inventory

- 20 lore entries: ${lore.map((item) => item.title).join(", ")}.
- 35 story beats from ${story[0].year} to ${story[story.length - 1].year}: ${story.map((event) => `${event.year} ${event.title}`).join("; ")}.

## Sourcing and license

- All lore summaries and story notes are original editorial writing for this project.
- Live Wikipedia summaries, when requested, are CC BY-SA and are attributed with a source link.
- Map comparisons use OpenFreeMap and OpenStreetMap data with attribution.
- Game titles, characters, locations, and trademarks remain the property of their respective owners.

## Disclaimer

This is a personal hobby and portfolio project, not a commercial product and not an official Rockstar resource. If a rights holder believes anything here oversteps, contact the site owner and the content will be removed or changed promptly.
`;

fs.writeFileSync(path.join(root, "archive.html"), archive);
fs.writeFileSync(path.join(root, "story.html"), storyPage());
fs.writeFileSync(path.join(root, "elsewhere.html"), elsewherePage());
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

console.log("generated archive.html, story.html, elsewhere.html, sitemap.xml, robots.txt, llms.txt, and", games.length, "game pages for", siteUrl);
