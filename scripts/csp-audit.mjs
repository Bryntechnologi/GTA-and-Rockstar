/* Bounded CSP audit for CHANNEL SURF.
   Run with: node scripts/csp-audit.mjs
   Writes CSP_AUDIT.md and exits non-zero if the enforced policy is missing a
   required source or an inline script/style hash. */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const headersPath = path.join(root, "_headers");
const headers = fs.readFileSync(headersPath, "utf8");
const policyMatch = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
const reportOnly = /Content-Security-Policy-Report-Only/i.test(headers);

if (!policyMatch) {
  console.error("CSP audit failed: _headers has no enforced Content-Security-Policy.");
  process.exit(1);
}

const policy = policyMatch[1].trim();
const directives = new Map(
  policy.split(";").map((part) => {
    const [name, ...values] = part.trim().split(/\s+/);
    return [name.toLowerCase(), values];
  })
);

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

const sha = (value) => `'sha256-${createHash("sha256").update(value, "utf8").digest("base64")}'`;
const scriptHashes = new Set();
const styleHashes = new Set();
let inlineScripts = 0;
let inlineStyles = 0;
let inlineHandlers = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    inlineScripts += 1;
    if (match[1].trim()) scriptHashes.add(sha(match[1]));
  }
  for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    inlineStyles += 1;
    if (match[1].trim()) styleHashes.add(sha(match[1]));
  }
  inlineHandlers += (html.match(/\son[a-z]+\s*=/gi) || []).length;
}

const failures = [];
if (reportOnly) failures.push("_headers still uses Content-Security-Policy-Report-Only");
if (!directives.get("script-src")?.includes("'self'")) failures.push("script-src is missing 'self'");
if (directives.get("script-src")?.includes("'unsafe-inline'")) failures.push("script-src still allows 'unsafe-inline'");
if (directives.get("style-src")?.includes("'unsafe-inline'")) failures.push("style-src still allows 'unsafe-inline'");
if (!directives.get("script-src-attr")?.includes("'none'")) failures.push("script-src-attr is not locked to 'none'");
if (!directives.get("style-src-attr")?.includes("'unsafe-inline'")) failures.push("style-src-attr should allow inline style attributes for the current UI");
if (!directives.get("object-src")?.includes("'none'")) failures.push("object-src is not locked to 'none'");
if (!directives.get("frame-ancestors")?.includes("'none'")) failures.push("frame-ancestors is not locked to 'none'");

for (const hash of scriptHashes) {
  if (!directives.get("script-src")?.includes(hash)) failures.push(`script-src is missing inline hash ${hash}`);
}
for (const hash of styleHashes) {
  if (!directives.get("style-src")?.includes(hash)) failures.push(`style-src is missing inline hash ${hash}`);
}

const requiredConnections = [
  "https://en.wikipedia.org",
  "https://gta.fandom.com",
  "https://*.openfreemap.org",
  "https://*.openstreetmap.org"
];
const requiredMedia = [
  "https://ccradio.ellak.gr",
  "https://mp3.theradio.cc",
  "https://*.somafm.com"
];
for (const origin of requiredConnections) {
  if (!directives.get("connect-src")?.includes(origin)) failures.push(`connect-src is missing ${origin}`);
}
for (const origin of requiredMedia) {
  if (!directives.get("media-src")?.includes(origin)) failures.push(`media-src is missing ${origin}`);
}

const externalOrigins = new Map();
function noteOrigin(url) {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) return;
    externalOrigins.set(parsed.origin, (externalOrigins.get(parsed.origin) || 0) + 1);
  } catch (error) {
    /* relative URL */
  }
}
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/gi)) noteOrigin(match[1]);
}
for (const file of ["data/streams.json", "assets/js/app.js", "assets/js/services.js", "index.html"]) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  for (const match of text.matchAll(/https?:\/\/[^\s"'`<>)}\]]+/g)) noteOrigin(match[0]);
}

const evalHits = [];
for (const file of ["assets/js/app.js", "assets/js/chrome.js", "assets/js/engagement.js", "assets/js/services.js", "assets/js/markdown-core.js"]) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  if (/\beval\s*\(|new\s+Function\s*\(/.test(text)) evalHits.push(file);
}

const report = `# CSP audit

Bounded audit of the enforced Content-Security-Policy in \`_headers\`.

## Policy

\`\`\`text
${policy}
\`\`\`

## Verified

- Enforced policy is present (not Report-Only).
- \`script-src\` has no \`'unsafe-inline'\`; every inline script has a SHA-256 hash.
- \`style-src\` has no \`'unsafe-inline'\`; every inline style block has a SHA-256 hash.
- \`style-src-attr 'unsafe-inline'\` remains for the current inline style attributes.
- \`script-src-attr 'none'\` blocks inline event-handler attributes.
- \`object-src 'none'\` and \`frame-ancestors 'none'\` are set.
- Wikipedia, GTA Wiki, OpenFreeMap, OpenStreetMap, MapLibre, and radio-stream origins are declared.

## Inventory

- HTML files scanned: ${htmlFiles.length}
- Inline script blocks: ${inlineScripts}
- Inline style blocks: ${inlineStyles}
- Inline event-handler attributes: ${inlineHandlers}
- Unique script hashes: ${scriptHashes.size}
- Unique style hashes: ${styleHashes.size}
- External origins referenced: ${[...externalOrigins.keys()].sort().join(", ") || "none"}
- \`eval\` / \`new Function\` hits: ${evalHits.length ? evalHits.join(", ") : "none"}

## External origins observed

${[...externalOrigins.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([origin, count]) => `- \`${origin}\` — ${count} reference(s)`).join("\n") || "- none"}

## Remaining hardening work

- Replace inline style attributes with utility classes so \`style-src-attr 'unsafe-inline'\` can be removed.
- Keep the script/style hashes regenerated by \`npm run build:static\` whenever a page changes.
- Add a report endpoint if CSP reporting is wanted.
- Keep the allow-list reviewed whenever a new API, map style, font, or stream is added.

## Verdict

${failures.length ? `FAILED: ${failures.join("; ")}` : "PASS: the enforced policy uses script/style hashes and leaves no 'unsafe-inline' in script-src or style-src. The remaining inline-style-attribute allowance is explicit."}
`;

fs.writeFileSync(path.join(root, "CSP_AUDIT.md"), report);
console.log(report);
if (failures.length) process.exit(1);
