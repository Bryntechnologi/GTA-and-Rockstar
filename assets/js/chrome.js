/* -------------------------------------------------------------------------
   CHANNEL SURF — chrome.js
   Shared header, footer, theme tuner, search, and error boundary for static
   pages. The interactive SPA keeps its own app.js.
   ------------------------------------------------------------------------- */
(function () {
  "use strict";

  const root = document.documentElement;
  const DATA = window.CS_DATA || {};
  const eras = DATA.eras || {};
  const eraOrder = (DATA.eraOrder || Object.keys(eras)).filter((key) => eras[key]);
  const SETTINGS_KEY = "channelsurf.settings.v1";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.prototype.slice.call(document.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function readSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveSettings(next) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), ...next }));
    } catch (error) {
      /* storage blocked — the page still works */
    }
  }

  function applyContrast(value) {
    const high = value === "high";
    if (high) root.dataset.contrast = "high";
    else root.removeAttribute("data-contrast");
    const button = $("#contrastToggle");
    if (button) {
      button.setAttribute("aria-pressed", String(high));
      button.setAttribute("title", high ? "Use standard contrast" : "Toggle high contrast");
      button.setAttribute("aria-label", high ? "Use standard contrast" : "Toggle high contrast");
    }
  }

  function initContrast() {
    const saved = readSettings().contrast;
    applyContrast(saved === "high" ? "high" : "normal");
    $("#contrastToggle")?.addEventListener("click", () => {
      const next = root.dataset.contrast === "high" ? "normal" : "high";
      applyContrast(next);
      saveSettings({ contrast: next });
    });
  }

  function currentEra() {
    return root.dataset.era && eras[root.dataset.era] ? root.dataset.era : eraOrder[0];
  }

  function updateReadout(key) {
    const era = eras[key];
    if (!era) return;
    const short = $("#tunerShort");
    const freq = $("#tunerFreq");
    const station = $("#tunerStation");
    if (short) short.textContent = era.short || "";
    if (freq) freq.textContent = era.freq || "";
    if (station) station.textContent = era.station || era.name || "";
    const mode = $("#themeMode");
    if (mode) mode.textContent = `Theme: ${era.name || key}`;
    $$("#stationRail [data-station]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.station === key));
    });
  }

  function applyEra(key, options = {}) {
    if (!eras[key]) return;
    root.dataset.era = key;
    updateReadout(key);
    if (options.persist !== false) saveSettings({ era: key });
  }

  function renderRail() {
    const rail = $("#stationRail");
    if (!rail) return;
    rail.innerHTML = eraOrder.map((key) => {
      const era = eras[key];
      const selected = currentEra() === key;
      return `<button class="station-btn" type="button" role="tab" aria-selected="${selected}" data-station="${escapeHTML(key)}" title="${escapeHTML(era.name)} — ${escapeHTML(era.station || "")}">
        <span class="station-btn-short">${escapeHTML(era.short || "")}</span>
        <span class="station-btn-name">${escapeHTML(era.name || key)}</span>
      </button>`;
    }).join("");
  }

  function setPanel(open) {
    const panel = $("#eraPanel");
    const toggle = $("#eraToggle");
    if (!panel || !toggle) return;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  function rotate(direction) {
    const index = eraOrder.indexOf(currentEra());
    const next = eraOrder[(index + direction + eraOrder.length) % eraOrder.length];
    applyEra(next);
  }

  function initTuner() {
    renderRail();
    updateReadout(currentEra());
    if (root.dataset.lockEra !== "true") {
      const saved = readSettings().era;
      if (saved && eras[saved]) applyEra(saved, { persist: false });
    }
    $("#eraToggle")?.addEventListener("click", () => {
      setPanel($("#eraPanel")?.hidden !== false);
    });
    $("#prevStation")?.addEventListener("click", () => rotate(-1));
    $("#nextStation")?.addEventListener("click", () => rotate(1));
    $("#stationRail")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-station]");
      if (!button) return;
      applyEra(button.dataset.station);
      setPanel(false);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest("#eraPanel") && !event.target.closest("#eraToggle")) setPanel(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setPanel(false);
    });
  }

  function initMenu() {
    const button = $("#menuToggle");
    const menu = $("#primaryNav");
    if (!button || !menu) return;
    button.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
  }

  function searchEntries() {
    if (Array.isArray(window.CS_SEARCH_INDEX) && window.CS_SEARCH_INDEX.length) return window.CS_SEARCH_INDEX;
    return $$("a[href]").map((link) => ({
      title: (link.textContent || "").trim(),
      subtitle: link.getAttribute("href") || "",
      href: link.getAttribute("href") || "",
      type: "Link"
    })).filter((item) => item.title);
  }

  function score(entry, query) {
    const haystack = `${entry.title} ${entry.subtitle} ${entry.type} ${entry.keywords || ""}`.toLowerCase();
    if (!query) return 1;
    if (haystack.includes(query)) return 100 - haystack.indexOf(query);
    const tokens = query.split(/\s+/).filter(Boolean);
    let matched = 0;
    tokens.forEach((token) => {
      if (haystack.includes(token)) matched += 1;
      else if (token.length > 2 && haystack.includes(token.slice(0, Math.ceil(token.length * 0.7)))) matched += 0.5;
    });
    return matched ? matched * 10 : 0;
  }

  function initSearch() {
    const overlay = $("#searchOverlay");
    const input = $("#searchInput");
    const results = $("#searchResults");
    if (!overlay || !input || !results) return;

    function close() {
      overlay.hidden = true;
      input.value = "";
    }

    function render() {
      const query = input.value.trim().toLowerCase();
      const ranked = searchEntries()
        .map((entry) => ({ entry, rank: score(entry, query) }))
        .filter((item) => item.rank > 0)
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 12)
        .map((item) => item.entry);
      if (!ranked.length) {
        results.innerHTML = '<p class="small muted search-empty">No matches. Try a game, era, person, or place.</p>';
        return;
      }
      results.innerHTML = ranked.map((entry) => `<a class="search-result" href="${escapeHTML(entry.href)}">
        <span class="search-type">${escapeHTML(entry.type || "Page")}</span>
        <span class="search-copy"><b>${escapeHTML(entry.title)}</b><small>${escapeHTML(entry.subtitle || "")}</small></span>
      </a>`).join("");
    }

    $("#searchBtn")?.addEventListener("click", () => {
      overlay.hidden = false;
      input.focus();
      render();
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    input.addEventListener("input", render);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const first = results.querySelector(".search-result");
        if (first) {
          event.preventDefault();
          window.location.href = first.getAttribute("href");
        }
      }
      if (event.key === "Escape") close();
    });
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        overlay.hidden = false;
        input.focus();
        render();
      }
      if (event.key === "Escape" && !overlay.hidden) close();
    });
  }

  function showError(message) {
    let banner = $("#chromeError");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "chromeError";
      banner.className = "chrome-error";
      banner.setAttribute("role", "status");
      banner.innerHTML = '<span></span><button type="button" aria-label="Dismiss error">Dismiss</button>';
      banner.querySelector("button").addEventListener("click", () => banner.remove());
      document.body.appendChild(banner);
    }
    const text = banner.querySelector("span");
    if (text) text.textContent = message || "Something went wrong, but the page content is still available.";
  }

  window.addEventListener("error", () => showError("Something went wrong on this page. The article content is still available."));
  window.addEventListener("unhandledrejection", () => showError("A background request failed. The page content is still available."));

  initTuner();
  initContrast();
  initMenu();
  initSearch();
})();
