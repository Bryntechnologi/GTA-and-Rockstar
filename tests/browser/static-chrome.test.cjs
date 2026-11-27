const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173/";
const candidates = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);

const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) {
  console.log("No Chromium browser found; skipping static chrome test.");
  process.exit(0);
}

(async () => {
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`${BASE}changelog.html`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator(".site-header").count(), 1, "changelog should render the universal header");
    assert.equal(await page.locator(".site-footer").count(), 1, "changelog should render the universal footer");
    assert.match((await page.locator("h1").textContent()).trim(), /Changelog/i);
    assert.equal(await page.locator(".changelog-release").count(), 2, "changelog should show both versions");
    assert.doesNotMatch(await page.locator("body").innerText(), /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/);

    await page.locator("#eraToggle").click();
    assert.equal(await page.locator("#stationRail .station-btn").count(), 8, "static pages should expose the full era tuner");
    await page.locator('#stationRail [data-station="vicecity"]').click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.era), "vicecity");

    await page.locator("#searchBtn").click();
    await page.locator("#searchInput").fill("tommy");
    await page.waitForTimeout(200);
    assert.ok((await page.locator("#searchResults .search-result").count()) > 0, "static search should find lore entries");
    await page.locator("#searchOverlay").press("Escape");

    await page.locator("#contrastToggle").click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.contrast), "high", "contrast toggle should set the high-contrast mode");
    assert.equal(await page.locator("#contrastToggle").getAttribute("aria-pressed"), "true");
    await page.reload({ waitUntil: "domcontentloaded" });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.contrast), "high", "contrast preference should persist");
    await page.locator("#contrastToggle").click();

    assert.equal(await page.locator(".page-tools").count(), 1, "static pages should expose share and reaction tools");
    assert.equal(await page.locator(".reading-progress").count(), 1, "long static pages should expose reading progress");

    for (const [path, marker] of [["contact.html", "brynsites.com/contact"], ["credits.html", "Image credits"]]) {
      await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
      assert.equal(await page.locator(".site-header").count(), 1, `${path} should have the header`);
      assert.equal(await page.locator(".site-footer").count(), 1, `${path} should have the footer`);
      if (marker.startsWith("brynsites")) {
        assert.ok((await page.locator('a[href="https://brynsites.com/contact"]').count()) > 0, "contact page should link the umbrella contact URL");
      } else {
        assert.match(await page.locator("body").innerText(), new RegExp(marker, "i"));
      }
    }

    await page.goto(BASE + "games/vice-city/", { waitUntil: "domcontentloaded" });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.era), "vicecity", "game page should keep its content theme");
    assert.equal(await page.locator("#stationRail .station-btn").count(), 8, "game page should still expose the tuner");
    assert.equal(await page.locator(".site-header").count(), 1);
    assert.equal(await page.locator(".site-footer").count(), 1);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + "changelog.html", { waitUntil: "domcontentloaded" });
    await page.locator("#menuToggle").click();
    assert.equal(await page.locator("#primaryNav").evaluate((node) => node.classList.contains("is-open")), true, "mobile navigation should open on static pages");
    assert.equal(await page.locator("#menuToggle").getAttribute("aria-expanded"), "true");

    assert.deepEqual(errors, [], errors.join("\n"));
    console.log("Static chrome tests passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
