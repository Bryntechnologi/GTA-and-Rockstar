/* -------------------------------------------------------------------------
   FIVE STAR WANTED — services.js
   Optional, keyless integrations with graceful local fallbacks.
   No secrets, no build step, no backend.
   ------------------------------------------------------------------------- */
(function () {
  "use strict";

  const CACHE_PREFIX = "fivestarwanted.cache.";
  const memory = new Map();

  function readCache(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.at !== "number") return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeCache(key, data, ttl) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), ttl, data }));
    } catch (error) {
      /* storage full or blocked — harmless */
    }
  }

  async function cachedFetchJSON(url, options = {}) {
    const { ttl = 24 * 60 * 60 * 1000, timeout = 6000, force = false } = options;
    const cached = readCache(url);
    if (!force && cached && Date.now() - cached.at < (cached.ttl || ttl)) {
      return cached.data;
    }

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;
    try {
      const response = await fetch(url, {
        signal: controller ? controller.signal : undefined,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      writeCache(url, data, ttl);
      return data;
    } catch (error) {
      return cached ? cached.data : null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function loadLocalJSON(path) {
    if (memory.has(path)) return memory.get(path);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 5000) : null;
      try {
        const response = await fetch(path, { cache: "no-cache", signal: controller ? controller.signal : undefined });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        memory.set(path, data);
        return data;
      } catch (error) {
        if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 160));
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
    return null;
  }

  function wikiTitleToPath(title) {
    return encodeURIComponent(String(title).trim().replace(/\s+/g, "_"));
  }

  async function getWikiSummary(title) {
    if (!title) return null;
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitleToPath(title)}`;
    const data = await cachedFetchJSON(url, { ttl: 24 * 60 * 60 * 1000 });
    if (!data || data.type === "disambiguation" || !data.extract) return null;
    return {
      title: data.title,
      extract: data.extract,
      description: data.description || "",
      page: data.content_urls && data.content_urls.desktop ? data.content_urls.desktop.page : "",
      thumbnail: data.thumbnail ? data.thumbnail.source : ""
    };
  }

  function getLore() {
    return loadLocalJSON("data/lore.json");
  }

  function fandomTitleToPath(title) {
    return encodeURIComponent(String(title).trim().replace(/\s+/g, "_"));
  }

  async function getFandomSummary(title) {
    if (!title) return null;
    const url = `https://gta.fandom.com/api.php?action=parse&prop=text&section=0&format=json&origin=*&page=${encodeURIComponent(title)}`;
    const data = await cachedFetchJSON(url, { ttl: 24 * 60 * 60 * 1000, timeout: 8000 });
    const html = data && data.parse && data.parse.text ? data.parse.text["*"] : "";
    if (!html) return null;
    let extract = "";
    if (typeof DOMParser !== "undefined") {
      const doc = new DOMParser().parseFromString(html, "text/html");
      extract = Array.from(doc.querySelectorAll("p"))
        .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
        .filter((text) => text.length > 80)
        .slice(0, 3)
        .join("\n\n");
    } else {
      extract = (html.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [])
        .map((block) => block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
        .filter((text) => text.length > 80)
        .slice(0, 3)
        .join("\n\n");
    }
    if (!extract) return null;
    return {
      title: data.parse.title || title,
      extract,
      page: `https://gta.fandom.com/wiki/${fandomTitleToPath(data.parse.title || title)}`
    };
  }

  function getRealWorld() {
    return loadLocalJSON("data/real-world.json");
  }

  function getStreams() {
    return loadLocalJSON("data/streams.json");
  }

  function getStoryTimeline() {
    return loadLocalJSON("data/story-timeline.json");
  }

  function getGames() {
    return loadLocalJSON("data/games.json");
  }

  function getImageCredits() {
    return loadLocalJSON("data/image-credits.json");
  }

  window.CS_SERVICES = {
    cachedFetchJSON,
    loadLocalJSON,
    getWikiSummary,
    getFandomSummary,
    getLore,
    getRealWorld,
    getStreams,
    getStoryTimeline,
    getGames,
    getImageCredits
  };
})();
