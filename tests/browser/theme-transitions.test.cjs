const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173/";
const candidates = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
].filter(Boolean);
const executablePath = candidates.find((file) => fs.existsSync(file));
if (!executablePath) {
  console.warn("No Chrome/Edge found. Set BROWSER_PATH to run transition tests.");
  process.exit(0);
}

(async () => {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#homeLoreCards .lore-card", { timeout: 15000 });
  await page.waitForTimeout(300);

  const before = await page.evaluate(() => ({
    bg: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
    transition: getComputedStyle(document.documentElement).transitionProperty
  }));
  assert.match(before.transition, /--bg/, "theme tokens should be transitioned");

  await page.click("#eraToggle");
  await page.waitForTimeout(80);
  await page.click('[data-station="gta5"]');
  await page.waitForTimeout(280);
  const mid = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
  assert.notEqual(mid, before.bg, "background should be mid-transition");
  assert.notEqual(after, before.bg, "background should reach the new theme");

  await page.click('[data-route="home"]');
  await page.waitForTimeout(150);
  await page.click('[data-route="lore"]');
  await page.waitForTimeout(300);
  await page.click('[data-lore-era="vicecity"]');
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.era), "vicecity");
  await page.click('[data-route="games"]');
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.era), "gta5", "base era should restore");

  await browser.close();
  console.log("Theme transition tests passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
