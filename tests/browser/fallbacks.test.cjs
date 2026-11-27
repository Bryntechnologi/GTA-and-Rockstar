const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const ROOT = path.resolve(__dirname, "..", "..");
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
const executablePath = candidates.find((file) => fs.existsSync(file));

if (!executablePath) {
  console.warn("No Chrome/Edge found. Set BROWSER_PATH to run browser fallback tests.");
  process.exit(0);
}

(async () => {
  const browser = await chromium.launch({ executablePath, headless: true });

  // 1. Network failure fallbacks.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  for (const file of ["lore", "story-timeline", "games", "real-world", "image-credits", "streams"]) {
    await context.route(`**/data/${file}.json`, (route) =>
      route.fulfill({ path: path.join(ROOT, "data", `${file}.json`), contentType: "application/json" })
    );
  }
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await context.route(/en\.wikipedia\.org\/api\//, (route) => route.abort());
  await context.route(/tiles\.openfreemap\.org/, (route) => route.abort());
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#homeLoreCards .lore-card", { timeout: 15000 });

  await page.goto(BASE + "#lore", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#loreContent .lore-card", { timeout: 15000 });
  await page.locator("#loreContent .lore-card").first().evaluate((el) => el.click());
  await page.waitForSelector("[data-lore-wiki]", { timeout: 10000 });
  await page.locator("[data-lore-wiki]").first().evaluate((el) => el.click());
  await page.waitForSelector("#loreLive", { timeout: 10000 });
  await page.waitForFunction(
    () => /unavailable/i.test(document.querySelector("#loreLive")?.textContent || ""),
    { timeout: 15000 }
  );
  const wikiFallback = (await page.locator("#loreLive").textContent()).trim();
  assert.match(wikiFallback, /unavailable/i, "wiki fallback should render");

  await page.goto(BASE + "#reel", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#reelCards .reel-card", { timeout: 15000 });
  await page.waitForSelector("#reelMap .reel-marker", { timeout: 15000 });
  await page.waitForFunction(
    () => /marker|comparison/i.test(document.querySelector("#reelStatus")?.textContent || ""),
    { timeout: 15000 }
  );
  const reelStatus = (await page.locator("#reelStatus").textContent()).trim();
  assert.match(reelStatus, /marker|comparison/i, "map status should render");
  assert.equal(await page.locator(".reel-card").count(), 10, "comparison cards should remain");
  assert.deepEqual(pageErrors, [], "no page errors during fallback");
  await context.close();

  // 2. Offline app shell.
  const offline = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const offlinePage = await offline.newPage();
  await offlinePage.goto(BASE, { waitUntil: "domcontentloaded" });
  await offlinePage.waitForSelector("#homeLoreCards .lore-card", { timeout: 15000 });
  await offlinePage.evaluate(async () => {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.ready;
      await Promise.all([
        fetch("data/lore.json"),
        fetch("data/story-timeline.json"),
        fetch("data/games.json"),
        fetch("data/streams.json"),
        fetch("data/real-world.json"),
        fetch("assets/styles.css")
      ]).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  });
  await offline.setOffline(true);
  await offlinePage.reload({ waitUntil: "domcontentloaded" });
  await offlinePage.waitForTimeout(800);
  assert.match((await offlinePage.locator("#home-title").textContent()).trim(), /archived/i, "offline shell should render");
  assert.equal(await offlinePage.locator("#homeLoreCards .lore-card").count(), 4, "offline lore should render");
  const bg = await offlinePage.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(bg, "rgb(12, 11, 10)", "offline home theme CSS should load");
  await offline.setOffline(false);
  await offline.close();

  await browser.close();
  console.log("Browser fallback tests passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
