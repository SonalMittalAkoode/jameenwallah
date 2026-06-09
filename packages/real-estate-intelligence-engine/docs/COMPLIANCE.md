# Compliance And Safety

This package is designed for compliant data collection.

## Implemented

- `robots.txt` checks are enabled by default.
- Per-request randomized delays are enabled by default.
- CAPTCHA and protected-response markers are detected.
- Protected pages are paused and logged for review.
- Crawlers avoid bypassing access controls.
- Raw source URLs are preserved for audit trails.

## Not Implemented Intentionally

The engine does not include code to bypass Cloudflare, Akamai, DataDome, PerimeterX, CAPTCHA systems, login walls, paywalls, or other access controls.

For protected data, use one of these routes:

- Official APIs
- Written permission
- Partner feeds
- User-provided exports
- Authenticated access where your account terms allow automated collection

## Recommended Production Controls

- Maintain an allowlist of approved domains.
- Store source terms and crawl permission notes per domain.
- Cap per-domain request rates.
- Keep raw HTML snapshots with timestamps.
- Log extraction confidence and human-review flags.
- Never publish media unless you have the right to use it.
- Prefer builder-owned images, official project material, public-map photos with permitted usage, or licensed media.
