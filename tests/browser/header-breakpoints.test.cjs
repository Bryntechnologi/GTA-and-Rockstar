const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173/";
const widths = [1440, 1280, 1081, 1080, 1024, 900, 768, 720, 480, 390, 360];
const outDir = path.resolve(__dirname, "..", "snapshots");
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
  console.warn("No Chrome/Edge found. Set BROWSER_PATH to run header snapshot tests.");
  process.exit(0);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath, headless: true });
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    const metrics = await page.evaluate(() => {
      const brand = document.querySelector(".brand").getBoundingClientRect();
      const actions = document.querySelector(".header-actions").getBoundingClientRect();
      const bar = document.querySelector(".header-bar");
      return {
        overlap: brand.right > actions.left + 1,
        overflow: bar.scrollWidth > bar.clientWidth + 1,
        nav: getComputedStyle(document.querySelector(".primary-nav")).display,
        menu: getComputedStyle(document.querySelector("#menuToggle")).display
      };
    });
    assert.equal(metrics.overlap, false, `brand/action overlap at ${width}px`);
    assert.equal(metrics.overflow, false, `header overflow at ${width}px`);
    if (width > 1080) assert.equal(metrics.nav, "block", `nav should be visible at ${width}px`);
    if (width <= 1080) {
      assert.equal(metrics.nav, "none", `nav should collapse at ${width}px`);
      assert.equal(metrics.menu, "grid", `menu should show at ${width}px`);
    }
    await page.screenshot({
      path: path.join(outDir, `header-${width}.png`),
      clip: { x: 0, y: 0, width, height: width <= 480 ? 300 : 230 }
    });
    await page.close();
  }
  await browser.close();
  console.log("Header breakpoint snapshots passed. Images:", outDir);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
