/* -------------------------------------------------------------------------
   FIVE STAR WANTED — markdown-core.js
   Small, dependency-free Markdown subset with HTML escaping and a wiki-link
   resolver. Works as a browser global and as a CommonJS module for the
   static build.
   ------------------------------------------------------------------------- */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CS_MARKDOWN = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function safeUrl(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    if (/^(https?:|mailto:)/i.test(value)) return value;
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return "";
    if (value.startsWith("//")) return "";
    return value;
  }

  function inline(text, options) {
    const placeholders = [];
    const hold = (html) => {
      const key = `\u0000${placeholders.length}\u0000`;
      placeholders.push(html);
      return key;
    };
    let out = escapeHTML(text);

    out = out.replace(/`([^`]+)`/g, (_, code) => hold(`<code>${escapeHTML(code)}</code>`));

    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, label, url, title) => {
      const href = safeUrl(url);
      if (!href) return label;
      const titleAttr = title ? ` title="${escapeHTML(title)}"` : "";
      const external = /^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
      return hold(`<a href="${escapeHTML(href)}"${titleAttr}${external}>${escapeHTML(label)}</a>`);
    });

    out = out.replace(/\[\[([^\]]+)\]\]/g, (_, name) => {
      const clean = String(name || "").trim();
      const resolved = options.resolveWiki ? options.resolveWiki(clean) : null;
      if (!resolved) return `<span class="wiki-missing">${escapeHTML(clean)}</span>`;
      const data = resolved.dataLoreId ? ` data-lore-open="${escapeHTML(resolved.dataLoreId)}"` : "";
      const href = safeUrl(resolved.href) || "#";
      return hold(`<a class="wiki-link" href="${escapeHTML(href)}"${data}>${escapeHTML(resolved.label || clean)}</a>`);
    });

    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
    out = out.replace(/\n/g, "<br>");

    return out.replace(/\u0000(\d+)\u0000/g, (_, index) => placeholders[Number(index)] || "");
  }

  function renderMarkdown(text, options = {}) {
    if (!text) return "";
    const source = String(text).replace(/\r\n?/g, "\n").trim();
    if (!source) return "";
    const lines = source.split("\n");
    const blocks = [];
    let paragraph = [];
    let list = null;
    let quote = [];
    let code = null;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      blocks.push(`<p>${inline(paragraph.join(" "), options)}</p>`);
      paragraph = [];
    };
    const flushList = () => {
      if (!list) return;
      blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inline(item, options)}</li>`).join("")}</${list.type}>`);
      list = null;
    };
    const flushQuote = () => {
      if (!quote.length) return;
      blocks.push(`<blockquote>${quote.map((line) => `<p>${inline(line, options)}</p>`).join("")}</blockquote>`);
      quote = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.replace(/\s+$/, "");
      if (code) {
        if (/^```/.test(line)) {
          blocks.push(`<pre><code>${escapeHTML(code.lines.join("\n"))}</code></pre>`);
          code = null;
        } else {
          code.lines.push(rawLine);
        }
        continue;
      }
      if (/^```/.test(line)) {
        flushParagraph();
        flushList();
        flushQuote();
        code = { lines: [] };
        continue;
      }
      if (!line.trim()) {
        flushParagraph();
        flushList();
        flushQuote();
        continue;
      }
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        flushQuote();
        const level = heading[1].length;
        blocks.push(`<h${level}>${inline(heading[2], options)}</h${level}>`);
        continue;
      }
      const quoteLine = line.match(/^>\s?(.*)$/);
      if (quoteLine) {
        flushParagraph();
        flushList();
        quote.push(quoteLine[1]);
        continue;
      }
      const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
      if (bullet || ordered) {
        flushParagraph();
        flushQuote();
        const type = bullet ? "ul" : "ol";
        if (!list || list.type !== type) {
          flushList();
          list = { type, items: [] };
        }
        list.items.push((bullet || ordered)[1]);
        continue;
      }
      if (list) flushList();
      if (quote.length) flushQuote();
      paragraph.push(line);
    }

    if (code) blocks.push(`<pre><code>${escapeHTML(code.lines.join("\n"))}</code></pre>`);
    flushParagraph();
    flushList();
    flushQuote();
    return blocks.join("");
  }

  function renderInto(element, text, options = {}) {
    if (!element) return;
    element.innerHTML = renderMarkdown(text, options);
  }

  return { renderMarkdown, renderInto, escapeHTML, safeUrl };
});
