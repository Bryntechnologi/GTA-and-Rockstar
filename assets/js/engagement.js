/* -------------------------------------------------------------------------
   CHANNEL SURF — engagement.js
   Lightweight, backend-free share tools, positive reactions, and reading
   progress. Everything stays in localStorage.
   ------------------------------------------------------------------------- */
(function () {
  "use strict";

  const REACTION_KEY = "channelsurf.reactions.v1";
  const PROGRESS_KEY = "channelsurf.progress.v1";
  const path = window.location.pathname + window.location.search;

  function read(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* storage blocked — harmless */
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    return Promise.resolve();
  }

  function status(message) {
    let node = document.querySelector(".page-tool-status");
    if (!node) {
      node = document.createElement("p");
      node.className = "page-tool-status";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      const tools = document.querySelector(".page-tools");
      if (tools) tools.appendChild(node);
    }
    node.textContent = message;
  }

  function buildTools() {
    if (document.querySelector(".page-tools")) return;
    const footer = document.querySelector(".site-footer .container") || document.querySelector(".site-footer");
    if (!footer) return;
    const tools = document.createElement("div");
    tools.className = "page-tools";
    tools.setAttribute("aria-label", "Page tools");
    tools.innerHTML = `
      <div class="page-tool-group">
        <button class="page-tool" type="button" data-page-action="share">Share</button>
        <button class="page-tool" type="button" data-page-action="copy">Copy link</button>
      </div>
      <div class="page-tool-group" aria-label="Positive reactions">
        <span class="page-tool-label">Was this useful?</span>
        <button class="page-tool" type="button" data-reaction="helpful" aria-pressed="false">Helpful</button>
        <button class="page-tool" type="button" data-reaction="interesting" aria-pressed="false">Interesting</button>
      </div>`;
    const bottom = footer.querySelector(".footer-bottom");
    footer.insertBefore(tools, bottom || null);

    tools.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-page-action]");
      if (action) {
        const kind = action.dataset.pageAction;
        if (kind === "share" && navigator.share) {
          try {
            await navigator.share({ title: document.title, url: window.location.href });
            status("Shared.");
          } catch (error) {
            if (error && error.name !== "AbortError") status("Share cancelled.");
          }
          return;
        }
        try {
          await copyText(window.location.href);
          status("Link copied.");
        } catch (error) {
          status("Copy failed — select the address bar instead.");
        }
        return;
      }
      const reaction = event.target.closest("[data-reaction]");
      if (reaction) {
        const reactions = read(REACTION_KEY, {});
        const page = reactions[path] || {};
        const key = reaction.dataset.reaction;
        page[key] = !page[key];
        reactions[path] = page;
        write(REACTION_KEY, reactions);
        reaction.setAttribute("aria-pressed", String(page[key]));
        reaction.classList.toggle("is-active", page[key]);
        status(page[key] ? "Noted. Thanks." : "Reaction removed.");
      }
    });

    const reactions = read(REACTION_KEY, {})[path] || {};
    tools.querySelectorAll("[data-reaction]").forEach((button) => {
      const active = Boolean(reactions[button.dataset.reaction]);
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
  }

  function initProgress() {
    const main = document.querySelector("main");
    if (!main || main.scrollHeight < window.innerHeight * 1.25) return;
    const bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<span></span>";
    document.body.appendChild(bar);
    const fill = bar.firstElementChild;
    const progress = read(PROGRESS_KEY, {});
    let ticking = false;

    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      fill.style.width = pct.toFixed(2) + "%";
      progress[path] = Math.round(pct);
      write(PROGRESS_KEY, progress);
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function init() {
    buildTools();
    initProgress();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
