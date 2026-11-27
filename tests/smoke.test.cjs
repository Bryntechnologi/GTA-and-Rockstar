const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");

function makeFetch(online) {
  return async (url) => {
    if (!online) return { ok: false, status: 503, json: async () => null };
    const clean = String(url).replace(/^\.\//, "").replace(/^\/+/, "");
    const full = path.join(ROOT, clean);
    if (!fs.existsSync(full)) return { ok: false, status: 404, json: async () => null };
    return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(full, "utf8")) };
  };
}

async function loadSite({ online = true } = {}) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (error) => errors.push(error.message));
  vc.on("error", (...args) => errors.push(args.join(" ")));
  const dom = await JSDOM.fromFile(INDEX, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.matchMedia = () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {}
      });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.URL.createObjectURL = () => "blob:test";
      window.URL.revokeObjectURL = () => {};
      window.fetch = makeFetch(online);
    }
  });
  await new Promise((resolve) => dom.window.addEventListener("load", resolve, { once: true }));
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { dom, window: dom.window, doc: dom.window.document, errors };
}

function nav(doc, route) {
  doc.querySelector(`[data-route="${route}"]`)?.click();
}

async function waitFor(check, timeout = 6000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

test("home leads with lore and story previews", async () => {
  const { window, doc, errors } = await loadSite();
  assert.equal(doc.documentElement.dataset.era, "home");
  assert.equal(doc.querySelectorAll("#homeLoreCards .lore-card").length, 4);
  assert.equal(doc.querySelectorAll("#homeStoryStrip .home-story-card").length, 5);
  assert.equal(doc.querySelectorAll(".photo-strip img").length, 5);
  assert.doesNotMatch(doc.querySelector(".hero")?.textContent || "", /\b(20|35|08)\b\s*(lore|story|era)/i);
  assert.match(doc.querySelector(".hero h1")?.textContent || "", /archived/i);
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("contrast preference toggles and saves", async () => {
  const { window, doc, errors } = await loadSite();
  const button = doc.querySelector("#contrastToggle");
  assert.ok(button, "contrast toggle should exist");
  button.click();
  assert.equal(doc.documentElement.dataset.contrast, "high");
  assert.equal(button.getAttribute("aria-pressed"), "true");
  button.click();
  assert.equal(doc.documentElement.dataset.contrast, undefined);
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("lore filters, search, and detail panel work", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "lore");
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(doc.querySelectorAll("#loreContent .lore-card").length, 20);
  assert.equal(doc.querySelector('.nav-link[data-route="lore"]')?.getAttribute("aria-current"), "page");

  doc.querySelector('[data-lore-open="niko-bellic"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.match(doc.querySelector("#loreDetail h3")?.textContent || "", /Niko Bellic/);
  doc.querySelector('[data-lore-era="vicecity"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.ok(doc.querySelector("#loreDetail")?.classList.contains("hidden"), "filtering should clear a detail entry that no longer matches");

  doc.querySelector('[data-lore-era="vicecity"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 100));
  const filtered = doc.querySelectorAll("#loreContent .lore-card").length;
  assert.ok(filtered > 0 && filtered < 20, `expected a subset, got ${filtered}`);

  doc.querySelector('[data-lore-type="all"]')?.click();
  const search = doc.querySelector("#loreSearch");
  search.value = "Tommy";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.ok(doc.querySelectorAll("#loreContent .lore-card").length >= 1);

  doc.querySelector("#loreContent .lore-card")?.click();
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(doc.querySelector("#loreDetail")?.classList.contains("hidden"), false);
  assert.ok(doc.querySelector("#loreDetail h3")?.textContent.length > 0);
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("story timeline navigates, toggles spoilers, and follows the era", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "story");
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(doc.querySelectorAll("#storyRail .story-card").length, 35);
  assert.ok(doc.querySelector("#storyDetail h3")?.textContent.length > 0);
  assert.equal(doc.documentElement.dataset.era, "vicecity");

  doc.querySelector("[data-story-next]")?.click();
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(doc.querySelector("#storyCounter")?.textContent.trim(), "2 / 35");

  const spoiler = doc.querySelector("#storySpoilerToggle");
  spoiler?.click();
  assert.match(spoiler?.textContent || "", /on/);

  nav(doc, "home");
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(doc.documentElement.dataset.era, "home");
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("real vs reel renders comparison cards", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "reel");
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(doc.querySelectorAll(".reel-card").length, 10);
  assert.match(doc.querySelector(".reel-attribution")?.textContent || "", /Natural Earth/);
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("global search finds lore and story entries", async () => {
  const { window, doc, errors } = await loadSite();
  doc.querySelector("#searchBtn")?.click();
  await new Promise((resolve) => setTimeout(resolve, 200));
  const input = doc.querySelector("#searchInput");
  input.value = "Tommy";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.ok(doc.querySelectorAll("#searchResults .search-result").length >= 1);
  doc.querySelector("#searchResults .search-result")?.click();
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(doc.querySelector("#view-lore")?.classList.contains("is-active"), true);
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("offline data failures degrade gracefully", async () => {
  const { window, doc, errors } = await loadSite({ online: false });
  assert.equal(errors.length, 0, errors.join("\n"));
  nav(doc, "lore");
  await waitFor(() => /featured entries only/i.test(doc.querySelector("#loreContent")?.textContent || ""));
  assert.match(doc.querySelector("#loreContent")?.textContent || "", /featured entries only/i);
  assert.ok(doc.querySelectorAll("#loreContent .lore-card").length >= 1, "featured lore should still render offline");
  nav(doc, "reel");
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.ok(doc.querySelector("#reelContent"));
  nav(doc, "home");
  await waitFor(() => /unavailable offline/i.test(doc.querySelector("#radioList")?.textContent || ""));
  assert.match(doc.querySelector("#radioList")?.textContent || "", /unavailable offline/i);
  window.close();
});

test("games hub lists theme-per-game dossiers", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "games");
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(doc.querySelectorAll("#gamesContent .game-dossier").length, 9);
  const releaseYears = [...doc.querySelectorAll("#gamesContent .game-dossier-year")].map((el) => el.textContent.trim());
  assert.deepEqual(releaseYears, ["1997", "2002", "2004", "2005", "2006", "2008", "2013", "2018", "2026"]);
  assert.equal(doc.querySelectorAll("#gamesContent .game-dossier-art img").length, 9);
  const firstLink = doc.querySelector("#gamesContent a[href^='games/']");
  assert.ok(firstLink, "expected a static game page link");
  assert.equal(doc.querySelector("#view-games")?.classList.contains("is-active"), true);
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("real vs reel is reachable from the atlas subnav", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "atlas");
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(doc.querySelectorAll(".atlas-subnav [data-route]").length >= 2, true);
  doc.querySelector('.atlas-subnav [data-route="reel"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(doc.querySelector("#view-reel")?.classList.contains("is-active"), true);
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("content drives the theme on lore pages", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "lore");
  await new Promise((resolve) => setTimeout(resolve, 300));
  doc.querySelector('[data-lore-era="vicecity"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(doc.documentElement.dataset.era, "vicecity");
  assert.match(doc.querySelector("#themeMode")?.textContent || "", /content/i);

  doc.querySelector("#loreContent .lore-card")?.click();
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(doc.documentElement.dataset.era, "vicecity");

  nav(doc, "home");
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(doc.documentElement.dataset.era, "home");
  window.close();
});

test("content theme restores on exit and manual tuning wins", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "lore");
  await new Promise((resolve) => setTimeout(resolve, 250));
  doc.querySelector('[data-lore-era="vicecity"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(doc.documentElement.dataset.era, "vicecity");

  doc.querySelector('[data-lore-era="all"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(doc.documentElement.dataset.era, "gta6");

  doc.querySelector('[data-lore-era="vicecity"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 100));
  doc.querySelector("#eraToggle")?.click();
  await new Promise((resolve) => setTimeout(resolve, 80));
  doc.querySelector('[data-station="gta5"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.equal(doc.documentElement.dataset.era, "gta5");

  nav(doc, "games");
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(doc.documentElement.dataset.era, "gta5");
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("trivia era filters set and restore the theme", async () => {
  const { window, doc, errors } = await loadSite();
  nav(doc, "trivia");
  await new Promise((resolve) => setTimeout(resolve, 250));
  doc.querySelector('[data-filter="vicecity"]')?.click();
  doc.querySelector("#triviaStart")?.click();
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(doc.documentElement.dataset.era, "vicecity");

  nav(doc, "home");
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(doc.documentElement.dataset.era, "home");
  assert.equal(errors.length, 0, errors.join("\n"));
  window.close();
});

test("static indexability files and archive are present", () => {
  const index = fs.readFileSync(INDEX, "utf8");
  assert.match(index, /<link rel="canonical" href="https:\/\/channelsurf\.pages\.dev\/">/);
  assert.match(index, /application\/ld\+json/);
  assert.match(index, /name="robots" content="index,follow/);
  assert.match(index, /og-cover\.png/);
  assert.match(index, /archive\.html/);

  const archive = fs.readFileSync(path.join(ROOT, "archive.html"), "utf8");
  assert.equal((archive.match(/<article id="lore-/g) || []).length, 20);
  assert.equal((archive.match(/<article id="story-/g) || []).length, 35);
  assert.match(archive, /application\/ld\+json/);

  const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>/g) || []).length, 19);
  assert.match(sitemap, /credits\.html/);
  assert.match(sitemap, /contact\.html/);
  assert.match(sitemap, /\/arcade\//);
  assert.match(sitemap, /\/atlas\//);
  assert.match(sitemap, /\/real-vs-reel\//);

  for (const file of ["archive.html", "story.html", "elsewhere.html", "changelog.html", "contact.html", "credits.html", "arcade/index.html", "atlas/index.html", "real-vs-reel/index.html"]) {
    const page = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.match(page, /<header class="site-header">/, `${file} should have the universal header`);
    assert.match(page, /<footer class="site-footer">/, `${file} should have the universal footer`);
    assert.match(page, /Brynsites/, `${file} should link the umbrella project`);
    assert.match(page, /assets\/js\/chrome\.js/, `${file} should load the shared chrome script`);
  }

  const changelog = fs.readFileSync(path.join(ROOT, "changelog.html"), "utf8");
  assert.match(changelog, /v1\.0\.0/);
  assert.match(changelog, /v0\.1\.0/);
  assert.doesNotMatch(changelog, /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/);
  assert.match(changelog, /partial|fan-made/i);

  const contact = fs.readFileSync(path.join(ROOT, "contact.html"), "utf8");
  assert.match(contact, /brynsites\.com\/contact/);

  const creditsPage = fs.readFileSync(path.join(ROOT, "credits.html"), "utf8");
  assert.match(creditsPage, /ImageGallery/);

  const elsewhere = fs.readFileSync(path.join(ROOT, "elsewhere.html"), "utf8");
  assert.equal((elsewhere.match(/class="elsewhere-card"/g) || []).length, 4);
  assert.match(elsewhere, /Max Payne/);
  assert.match(elsewhere, /Manhunt/);
  assert.match(elsewhere, /Midnight Club/);
  assert.match(elsewhere, /L.A. Noire/);

  const storyPage = fs.readFileSync(path.join(ROOT, "story.html"), "utf8");
  assert.equal((storyPage.match(/class="reading-card"/g) || []).length, 35);
  assert.match(storyPage, /application\/ld\+json/);

  const games = JSON.parse(fs.readFileSync(path.join(ROOT, "data/games.json"), "utf8"));
  assert.equal(games.length, 9);
  for (const game of games) {
    const page = fs.readFileSync(path.join(ROOT, "games", game.slug, "index.html"), "utf8");
    assert.match(page, /<link rel="canonical"/);
    assert.ok(page.includes(`data-era="${game.theme}"`), `${game.slug} theme`);
    assert.match(page, /application\/ld\+json/);
  }

  for (const file of ["robots.txt", "sitemap.xml", "llms.txt", "assets/og-cover.png", "elsewhere.html", "story.html"]) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} missing`);
  }

  const credits = JSON.parse(fs.readFileSync(path.join(ROOT, "data/image-credits.json"), "utf8"));
  for (const credit of Object.values(credits)) {
    assert.ok(fs.existsSync(path.join(ROOT, credit.file)), `${credit.file} missing`);
    assert.ok(credit.license && credit.artist && credit.source, "image credit incomplete");
  }

  assert.ok(fs.existsSync(path.join(ROOT, "assets/fonts/fonts.css")), "fonts.css missing");
  assert.match(index, /assets\/fonts\/fonts\.css/);
});

test("markdown rendering is escaped and supports wiki links", () => {
  const { renderMarkdown } = require(path.join(ROOT, "assets/js/markdown-core.js"));
  const html = renderMarkdown("**Bold** <script>alert(1)</script> [[Tommy Vercetti]]", {
    resolveWiki: (name) => ({ href: "archive.html#lore-tommy-vercetti", label: name, dataLoreId: "tommy-vercetti" })
  });
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /class="wiki-link"/);
  assert.match(html, /data-lore-open="tommy-vercetti"/);
  assert.doesNotMatch(renderMarkdown("[bad](javascript:alert(1))"), /javascript:/i);
});
