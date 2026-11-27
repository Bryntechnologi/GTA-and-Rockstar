/* Shared site chrome for generated static pages. */

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const NAV = [
  { key: "games", label: "Games" },
  { key: "lore", label: "Lore" },
  { key: "story", label: "Story" },
  { key: "atlas", label: "GTA Maps" },
  { key: "reel", label: "GTA vs Real Life" },
  { key: "play", label: "Arcade" },
  { key: "about", label: "About" }
];
const PAGE_LINKS = { atlas: "atlas/", reel: "real-vs-reel/", play: "arcade/" };

export function sprite() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/></symbol>
    <symbol id="i-contrast" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none"/></symbol>
    <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
    <symbol id="i-external" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-8 8"/><path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></symbol>
  </svg>`;
}

export function header({ prefix = "", active = "", site = {} } = {}) {
  const home = prefix || "./";
  const brandMark = `<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="18.5" stroke="currentColor" stroke-width="1.4"/>
    <path d="M12 22h4.5M27.5 22H32" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M17 18.5v7l6-3.5-6-3.5Z" fill="currentColor"/>
    <path d="M16 10.5c3.8-2.4 8.2-2.4 12 0M9.5 14.5c6.9-4.7 15.1-4.7 22 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>
  </svg></span>`;
  const nav = NAV.map((item) => {
    const isActive = item.key === active || (active === "changelog" && item.key === "about") || (active === "credits" && item.key === "about");
    const href = PAGE_LINKS[item.key] ? `${prefix}${PAGE_LINKS[item.key]}` : `${home}#${item.key}`;
    return `<a class="nav-link${isActive ? " is-active" : ""}" href="${href}" data-route="${item.key}"${isActive ? ' aria-current="page"' : ""}>${item.label}</a>`;
  }).join("");
  const umbrella = site.umbrella || {};
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="${home}" aria-label="FIVE STAR WANTED home">
        ${brandMark}
        <span class="brand-copy">
          <span class="brand-name"><span class="brand-long">FIVE STAR <em>WANTED</em></span><span class="brand-short">5★ <em>WANTED</em></span></span>
          <span class="brand-sub">GTA lore, maps, trivia &amp; puzzles</span>
        </span>
      </a>
      <nav class="primary-nav" id="primaryNav" aria-label="Primary">
        <div class="nav-inner">${nav}</div>
      </nav>
      <div class="header-actions">
        <button class="era-toggle" id="eraToggle" type="button" aria-expanded="false" aria-controls="eraPanel" aria-label="Change game theme" title="Change game theme">
          <span class="onair-dot" aria-hidden="true"></span>
          <span class="era-toggle-copy">
            <span class="era-toggle-kicker">Game theme</span>
            <span class="era-toggle-value"><span id="tunerShort">CS</span><span id="tunerFreq">Five Star Wanted</span></span>
          </span>
          <svg class="icon era-toggle-chevron" aria-hidden="true"><use href="#i-chevron"></use></svg>
        </button>
        <div class="utility-cluster">
          <button class="icon-btn" id="contrastToggle" type="button" aria-pressed="false" aria-label="Toggle high contrast" title="Toggle high contrast">
            <svg class="icon" aria-hidden="true"><use href="#i-contrast"></use></svg>
          </button>
          <button class="icon-btn" id="searchBtn" type="button" aria-label="Search the archive" title="Search (Ctrl+K)">
            <svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>
          </button>
          <button class="icon-btn menu-toggle" id="menuToggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="primaryNav">
            <svg class="icon" aria-hidden="true"><use href="#i-menu"></use></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="era-panel" id="eraPanel" hidden>
      <div class="container era-panel-inner">
        <div class="era-panel-head">
          <div>
            <p class="eyebrow">Game theme</p>
            <h2>Choose a game theme</h2>
            <p class="small muted" style="margin:0.3rem 0 0">Each theme changes the site styling. Content pages keep their own game theme until you choose another.</p>
          </div>
          <div class="era-panel-controls">
            <button class="tuner-step" id="prevStation" type="button" aria-label="Previous theme">‹</button>
            <button class="tuner-step" id="nextStation" type="button" aria-label="Next theme">›</button>
          </div>
        </div>
        <div class="station-rail" id="stationRail" role="tablist" aria-label="Game themes"></div>
        <div class="era-panel-foot">
          <span class="theme-mode" id="themeMode">Theme: page default</span>
          <span class="small muted">A <a href="${esc(umbrella.url || "https://brynsites.com/")}" rel="noopener">${esc(umbrella.name || "Brynsites")}</a> project</span>
        </div>
      </div>
    </div>
  </header>`;
}

export function searchOverlay() {
  return `<div class="search-overlay" id="searchOverlay" hidden>
    <div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search the archive">
      <label class="search-field">
        <span class="sr-only">Search</span>
        <input id="searchInput" type="search" placeholder="Search lore, story, games, and pages…" autocomplete="off">
      </label>
      <div class="search-results" id="searchResults"></div>
      <p class="small muted search-hint">Esc to close · Enter to open the first result</p>
    </div>
  </div>`;
}

export function footer({ prefix = "", site = {} } = {}) {
  const home = prefix || "./";
  const umbrella = site.umbrella || {};
  const archiveNote = site.archiveNote || "A partial, fan-made archive. Not exhaustive, and may lag behind new releases.";
  const updatedNote = site.updatedNote || "Updated when time allows.";
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <strong>FIVE STAR WANTED</strong>
          <p>An independent, non-commercial fan project. Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. All game names, characters, locations, and trademarks belong to their respective owners. Original writing, code, CSS, and vector art only. <a class="text-link" href="${home}#about">Full disclaimer</a></p>
          <p class="footer-note">${esc(archiveNote)} ${esc(updatedNote)}</p>
        </div>
        <nav class="footer-links footer-columns" aria-label="Footer navigation">
          <div class="footer-col">
            <p class="footer-heading">Explore</p>
            <a href="${home}#home">Home</a>
            <a href="${home}#games">Games</a>
            <a href="${home}#lore">Lore</a>
            <a href="${home}#story">Story</a>
            <a href="${prefix}atlas/">GTA maps</a>
            <a href="${prefix}real-vs-reel/">GTA vs real life</a>
            <a href="${prefix}arcade/">Arcade</a>
          </div>
          <div class="footer-col">
            <p class="footer-heading">Project</p>
            <a href="${home}#about">About</a>
            <a href="${prefix}changelog.html">Changelog</a>
            <a href="${prefix}credits.html">Credits &amp; licences</a>
            <a href="${prefix}contact.html">Contact</a>
            <a href="${prefix}archive.html">Full-text archive</a>
            <a href="${prefix}story.html">Story reading mode</a>
            <a href="${prefix}elsewhere.html">Rockstar Beyond GTA</a>
          </div>
          <div class="footer-col">
            <p class="footer-heading">Elsewhere</p>
            <a href="${esc(umbrella.url || "https://brynsites.com/")}" rel="noopener">${esc(umbrella.name || "Brynsites")} <span class="external-mark" aria-hidden="true">↗</span></a>
            <a href="${esc(umbrella.contactUrl || "https://brynsites.com/contact")}" rel="noopener">Contact <span class="external-mark" aria-hidden="true">↗</span></a>
            <a href="https://github.com/Bryntechnologi/GTA-and-Rockstar" rel="noopener">GitHub <span class="external-mark" aria-hidden="true">↗</span></a>
            <a href="${prefix}llms.txt">llms.txt</a>
          </div>
        </nav>
      </div>
      <p class="footer-umbrella">
        <span class="umbrella-label">Part of the ${esc(umbrella.name || "Brynsites")} network</span>
        <a href="${esc(umbrella.url || "https://brynsites.com/")}" rel="noopener">${esc((umbrella.url || "https://brynsites.com/").replace(/^https?:\/\//, "").replace(/\/$/, ""))} <span class="external-mark" aria-hidden="true">↗</span></a>
        <span class="umbrella-note">More miscellany projects, writing, and contact.</span>
      </p>
      <div class="footer-bottom">
        <span>${esc(archiveNote)}</span>
        <span>Unofficial fan project · ${esc(updatedNote)}</span>
      </div>
    </div>
  </footer>`;
}

export function chromeAssets(prefix = "") {
  return `<script src="${prefix}assets/js/data.js"></script>
  <script src="${prefix}assets/js/search-index.js"></script>
  <script src="${prefix}assets/js/chrome.js"></script>
  <script src="${prefix}assets/js/engagement.js"></script>`;
}

function socialMeta(html) {
  if (html.includes('name="twitter:card"')) return html;
  const grab = (value) => {
    const match = html.match(new RegExp(`<meta ${value} content="([^"]*)">`));
    return match ? match[1] : "";
  };
  const title = grab('property="og:title"');
  if (!title) return html;
  const tags = [
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${grab('property="og:description"')}">`,
    `<meta name="twitter:image" content="${grab('property="og:image"')}">`,
    `<meta name="twitter:url" content="${grab('property="og:url"')}">`
  ].map((tag) => `  ${tag}`).join("\n");
  return html.replace("</head>", `${tags}\n</head>`);
}

export function decoratePage(html, { prefix = "", active = "", lockEra = false, site = {} } = {}) {
  let out = html;
  if (lockEra) out = out.replace('<html lang="en"', '<html lang="en" data-lock-era="true"');
  out = out.replace("<body>", `<body>\n  <div class="ambient" aria-hidden="true"></div>\n  ${sprite()}\n  ${header({ prefix, active, site })}`);
  out = out.replace(/<main(\s|>)/, '<main id="main"$1');
  out = out.replace("</body>", `  ${footer({ prefix, site })}\n  ${searchOverlay()}\n  ${chromeAssets(prefix)}\n</body>`);
  return socialMeta(out);
}

export { esc };
