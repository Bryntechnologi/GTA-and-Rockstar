# Project Log

Working notes for CHANNEL SURF. Public changelog: [CHANGELOG.md](CHANGELOG.md).

## Identity

- **Current project name:** CHANNEL SURF
- **Status:** Unofficial fan archive and front-end portfolio project
- **Deployment target:** static host, intended for Cloudflare Pages
- **Planned root/umbrella:** `brynsites.com` (pending final decision)
- **Production domain:** not finalised; `site.config.json` currently points at the placeholder `https://channelsurf.pages.dev/`

## Product direction

- Lore and story are primary; the arcade is secondary.
- Content should own the theme: a Vice City page looks like Vice City.
- The home page keeps its own distinct theme.
- Game pages are static and indexable; interactive modes remain client-side.
- Real-world inspiration is labelled as photography, not GTA artwork.
- No proprietary assets, fonts, or copied text.

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
- [ ] Final production domain
- [ ] Final umbrella branding and project rename

## Decisions

- No official GTA screenshots or artwork.
- Open lookalike fonts instead of proprietary GTA fonts.
- Static generated pages for SEO; SPA for interactive views.
- Wikimedia Commons photos for real-world inspiration.
- Local JSON with in-app fallbacks rather than a backend.
- No live GTA trackers: no stable official API exists.

## Next

1. Decide official project name and umbrella URL.
2. Set `site.config.json`.
3. Run `npm run build:static`.
4. Deploy to Cloudflare Pages.
5. Re-run Lighthouse and PWA installability checks on production.
