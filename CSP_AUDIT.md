# CSP audit

Bounded audit of the enforced Content-Security-Policy in `_headers`.

## Policy

```text
default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://en.wikipedia.org https://gta.fandom.com https://*.openfreemap.org https://*.openstreetmap.org https://*.maplibre.org; media-src 'self' https://ccradio.ellak.gr https://mp3.theradio.cc https://*.somafm.com; worker-src 'self' blob:; object-src 'none'; manifest-src 'self'
```

## Verified

- Enforced policy is present (not Report-Only).
- `script-src` includes `'self'` and `'unsafe-inline'` for inline JSON-LD and boot scripts.
- `style-src` includes `'unsafe-inline'` for the per-page and theme styles.
- `object-src 'none'` and `frame-ancestors 'none'` are set.
- Wikipedia, GTA Wiki, OpenFreeMap, OpenStreetMap, and radio-stream origins are declared.

## Inventory

- HTML files scanned: 16
- Inline script blocks: 15
- Inline style blocks: 15
- Inline event-handler attributes: 0
- External origins referenced: https://brynsites.com, https://ccradio.ellak.gr, https://channelsurf.pages.dev, https://commons.wikimedia.org, https://en.wikipedia.org, https://github.com, https://gta.fandom.com, https://ice1.somafm.com, https://mp3.theradio.cc, https://schema.org, https://somafm.com, https://theradio.cc, https://tiles.openfreemap.org, https://your-subdomain.example
- `eval` / `new Function` hits: none

## External origins observed

- `https://brynsites.com` — 72 reference(s)
- `https://ccradio.ellak.gr` — 2 reference(s)
- `https://channelsurf.pages.dev` — 20 reference(s)
- `https://commons.wikimedia.org` — 42 reference(s)
- `https://en.wikipedia.org` — 54 reference(s)
- `https://github.com` — 17 reference(s)
- `https://gta.fandom.com` — 52 reference(s)
- `https://ice1.somafm.com` — 6 reference(s)
- `https://mp3.theradio.cc` — 1 reference(s)
- `https://schema.org` — 1 reference(s)
- `https://somafm.com` — 6 reference(s)
- `https://theradio.cc` — 1 reference(s)
- `https://tiles.openfreemap.org` — 1 reference(s)
- `https://your-subdomain.example` — 1 reference(s)

## Remaining hardening work

- Replace inline scripts with external files or hashes/nonces to remove `'unsafe-inline'`.
- Replace inline page styles with external stylesheets or hashes.
- Add a report endpoint if CSP reporting is wanted.
- Keep the allow-list reviewed whenever a new API, map style, font, or stream is added.

## Verdict

PASS: the enforced policy covers the current resources. This is a practical enforcement baseline, not a strict no-inline policy.
