/* -------------------------------------------------------------------------
   CHANNEL SURF — service worker
   App-shell offline support. External APIs, map tiles, and audio streams are
   deliberately network-only so they never go stale silently.
   ------------------------------------------------------------------------- */
const VERSION = "channelsurf-v18";
const CORE = [
  "./",
  "index.html",
  "archive.html",
  "story.html",
  "elsewhere.html",
  "manifest.webmanifest",
  "assets/favicon.svg",
  "assets/og-cover.png",
  "assets/styles.css",
  "assets/fonts/fonts.css",
  "assets/js/services.js",
  "assets/js/data.js",
  "assets/js/app.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/maskable-512.png",
  "assets/vendor/leaflet/leaflet.js",
  "assets/vendor/leaflet/leaflet.css",
  "assets/vendor/maplibre/maplibre-gl.js",
  "assets/vendor/maplibre/maplibre-gl.css",
  "data/lore.json",
  "data/real-world.json",
  "data/streams.json",
  "data/story-timeline.json",
  "data/games.json",
  "data/image-credits.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      Promise.allSettled(CORE.map((url) => cache.add(new Request(url, { cache: "reload" }))))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function isLocal(url) {
  return url.origin === self.location.origin;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isLocal(url)) {
    /* Wikipedia, map tiles, and audio streams stay network-only. */
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
