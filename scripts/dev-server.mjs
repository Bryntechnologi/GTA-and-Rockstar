/* Local preview server for FIVE STAR WANTED.
   Run with: npm run dev
   Optional: PORT=5000 npm run dev
   Optional: CSP=1 npm run dev  (apply the generated _headers CSP as well)
*/

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const applyCsp = process.env.CSP === "1";

const types = new Map(Object.entries({
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
}));

function securityHeaders() {
  const headers = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()"
  };
  if (!applyCsp) return headers;
  const source = fs.readFileSync(path.join(root, "_headers"), "utf8");
  const csp = source.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
  if (csp) headers["Content-Security-Policy"] = csp[1].trim();
  return headers;
}

function resolveFile(requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const clean = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  let file = path.join(root, clean);
  if (!file.startsWith(root)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file) && !path.extname(file)) {
    const withHtml = file + ".html";
    if (fs.existsSync(withHtml)) file = withHtml;
  }
  if (!fs.existsSync(file) && !path.extname(file)) {
    const withIndex = path.join(file, "index.html");
    if (fs.existsSync(withIndex)) file = withIndex;
  }
  return file;
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  const file = resolveFile(request.url || "/");
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    const notFound = path.join(root, "404.html");
    response.writeHead(404, { ...securityHeaders(), "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "<h1>404</h1><p>Not found.</p>");
    return;
  }

  const type = types.get(path.extname(file).toLowerCase()) || "application/octet-stream";
  response.writeHead(200, {
    ...securityHeaders(),
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  fs.createReadStream(file).pipe(response);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try: PORT=5000 npm run dev`);
    process.exit(1);
  }
  throw error;
});

server.listen(port, host, () => {
  console.log(`FIVE STAR WANTED dev server: http://${host}:${port}/`);
  console.log("Press Ctrl+C to stop.");
  if (!applyCsp) console.log("Previewing without CSP. Use CSP=1 npm run dev to test the generated policy.");
});
