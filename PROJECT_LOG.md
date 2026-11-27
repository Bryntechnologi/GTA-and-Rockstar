# Project Log

Working notes for FIVE STAR WANTED. Public changelog: [CHANGELOG.md](CHANGELOG.md).

## Identity

- **Current project name:** FIVE STAR WANTED
- **Status:** Unofficial fan archive and front-end portfolio project
- **Deployment target:** static host, intended for Cloudflare Pages
- **Umbrella:** [Brynsites](https://brynsites.com/) (`brynsites.com`)
- **Contact route:** [brynsites.com/contact](https://brynsites.com/contact)
- **Production domain:** not finalised; `site.config.json` currently points at the placeholder `https://fivestarwanted.pages.dev/`

## Product direction

- Lore and story are primary; the arcade is secondary.
- Content should own the theme: a Vice City page looks like Vice City.
- The home page keeps its own distinct theme.
- Game pages are static and indexable; interactive modes remain client-side.
- Real-world inspiration is labelled as photography, not GTA artwork.
- No proprietary assets, fonts, or copied text.
- The archive is explicitly partial; it is not a complete lore database.
- Changelog uses versions only, not dates.
- GTA Wiki is used for outbound links and optional attributed summaries, not wholesale import.
- Contrast is a layer over era themes, not a replacement for them.
- Markdown is a small safe subset with wiki-link resolution; raw HTML is escaped.
- CSP is enforced with hashed inline scripts/styles and a repeatable audit.
- `npm run dev` is the supported local preview path; opening the HTML directly is not the primary workflow.

## Milestones

- [x] Lore-first architecture and navigation
- [x] Era theme engine with crossfades
- [x] Static game pages in release order
- [x] Story timeline carousel and static reading page
- [x] Full-text archive
- [x] Real vs Reel
- [x] Arcade modes and local persistence
- [x] Open-font era typography
- [x] CC/PD imagery with credits
- [x] PWA and service worker
- [x] Regression, transition, and header tests
- [x] Universal header, footer, breadcrumbs, and game theme picker on static pages
- [x] Version-only public changelog
- [x] Partial-archive and Brynsites identity copy
- [x] Related-entry links, GTA Wiki links, and attributed summaries
- [x] Contact page and image-credits page
- [x] Fuzzy static-page search and global error boundary
- [x] High-contrast preference layered over era themes
- [x] Safe Markdown rendering and `[[wiki links]]`
- [x] Enforced CSP with a repeatable audit
- [x] One-command local preview server (`npm run dev`)
- [x] Crawlable arcade page for GTA trivia and Rockstar puzzle searches
- [x] Crawlable GTA map atlas and GTA vs real life pages
- [x] Prominent Brynsites network attribution in the footer
- [x] Lore filter, detail-panel, and nav-state UX fixes
- [x] Per-page SEO titles, descriptions, keywords, and Twitter cards
- [x] Restructured About page with quick links and a collapsible disclaimer
- [x] Mobile nav grid alignment and full-width Brynsites footer banner
- [x] FIVE STAR WANTED rebrand, theme-copy cleanup, and GTA-style UI audio
- [x] 42-entry lore archive with era-neutral franchise entries and CC BY-SA attribution
- [x] Rockstar Beyond GTA series dossiers and whole-page theme crossfades
- [ ] Final production domain
- [ ] Final project rename

## Decisions

- No official GTA screenshots or artwork.
- Open lookalike fonts instead of proprietary GTA fonts.
- Static generated pages for SEO; SPA for interactive views.
- Wikimedia Commons photos for real-world inspiration.
- Local JSON with in-app fallbacks rather than a backend.
- No live GTA trackers: no stable official API exists.

## Next

1. Decide the final project name.
2. Set the production subdomain in `site.config.json`.
3. Run `npm run build:static`.
4. Deploy to Cloudflare Pages.
5. Re-run Lighthouse and PWA installability checks on production.
6. Consider share buttons, positive-only reactions, and reading progress as later enhancements.
7. Extract the reusable static-site kit after a second Brynsites site proves the seams; see `KIT_PLAN.md`.
