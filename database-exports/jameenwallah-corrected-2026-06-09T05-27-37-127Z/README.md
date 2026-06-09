# JameenWallah Corrected Database Export

Generated: 2026-06-09T05:27:37.142Z

## What changed

- Preserved existing MongoDB `_id` values.
- Corrected 0 suspicious tiny property size records from acre values into sq.ft.
- Removed or deduplicated gallery image URLs for 0 properties where URLs were third-party or person/profile-like.
- Did not modify the source local database; this folder contains the corrected export only.

## Import shape

Each file in `collections/` is Extended JSON and can be imported by collection. Review `manifest.json` before production import.
