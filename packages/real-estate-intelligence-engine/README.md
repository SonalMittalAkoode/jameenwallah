# Real Estate Intelligence Engine

Production-oriented scraping and data intelligence package for Indian real estate data. This package is intentionally separate from the JameenWallah app and database exports.

It supports:

- compliant crawling and sitemap discovery
- static HTML extraction
- optional JavaScript rendering through Playwright/Selenium adapters
- JSON-LD, Next.js hydration, embedded state, and API payload extraction
- real estate schema normalization
- media download, dedupe, classification hooks, and thumbnail hooks
- SQLite local store plus adapter interfaces for PostgreSQL, MongoDB, Elasticsearch, and Redis
- change monitoring for price, media, inventory, possession, and status updates
- clean JSON output for AI search, recommendation engines, CRMs, and portals

Important operating rule: this engine includes anti-bot and CAPTCHA detection so jobs can pause, back off, or be reviewed. It does not include bypass logic for protected systems. Run only against sources you are allowed to crawl and respect robots, rate limits, and site terms.

## Quick Start

```bash
cd packages/real-estate-intelligence-engine
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools
pip install -e ".[browser,pdf,vision,stores]"
playwright install chromium

rei discover --source config/sample_sources.json --out data/discovered_urls.jsonl
rei crawl-url https://www.example-builder.com/project/example --out data/project.json
rei run-source --source config/sample_sources.json --out data/run
```

Current CLI:

```bash
rei discover --start-url https://www.dlf.in --include project --out data/dlf_urls.json
rei crawl-url https://www.example-builder.com/project/example --render-js --out data/project.json
rei run-source --sources config/sample_sources.json --render-js --out-dir data/run --sqlite data/rei.sqlite
```

## Builder Images And Upcoming Projects

The recommended production flow for builder websites is:

```bash
export GOOGLE_MAPS_API_KEY="your-key"

rei build-local-db \
  --sources config/india_builder_sources.json \
  --sqlite data/local-property-db/properties.sqlite \
  --out-dir data/local-property-db

rei refine-db \
  --source-sqlite data/local-property-db/properties.sqlite \
  --out-dir data/refined-builder-db \
  --target-images 5

rei complete-images \
  --input-csv data/refined-builder-db/refined_builder_properties.csv \
  --out-dir data/completed-property-images \
  --target-images 5
```

`complete-images` downloads usable local listing images. It tries official builder website images first. If fewer than five usable images are found and `GOOGLE_MAPS_API_KEY` is available, it resolves the exact project/place through Google Places and downloads Google Maps place photos. It does not store the API key in CSV output.

The output includes:

- `completed_properties.csv`: production-review CSV with local image paths.
- `completed_image_slots.csv`: one row per image slot.
- `completed_properties.sqlite`: local database for testing imports.
- `completion_summary.json`: counts for image coverage, Maps fallback, and review rows.
- `is_upcoming_next_6_months`: marks projects that look like upcoming/new-launch/pre-launch or have launch/possession dates inside the next six months.

Rows with `has_5_completed_images=No` or non-empty `image_completion_review_notes` should be reviewed before importing to production.

## Package Layout

- `src/rei/models.py`: canonical dataclasses and output schema
- `src/rei/crawler.py`: HTTP and optional browser rendering clients
- `src/rei/discover.py`: robots, sitemap, and link discovery
- `src/rei/extractors.py`: HTML, JSON-LD, Next.js, embedded state, PDF/video/media extraction
- `src/rei/normalize.py`: price, area, location, builder, amenity, and slug normalization
- `src/rei/media.py`: download, hashing, dedupe, type classification, thumbnails hook
- `src/rei/storage.py`: SQLite implementation and storage adapter contracts
- `src/rei/monitor.py`: snapshot diffing and alert event generation
- `src/rei/pipeline.py`: orchestrated crawl/extract/enrich/store flow
- `src/rei/cli.py`: command line entrypoints
- `docs/`: architecture, schema, and compliance notes

## Output Shape

Every project is emitted as structured JSON:

```json
{
  "project_name": "",
  "builder_name": "",
  "city": "",
  "sector": "",
  "address": "",
  "coordinates": { "lat": null, "lng": null },
  "price": { "starting": null, "ending": null, "price_per_sqft": null },
  "configurations": [],
  "amenities": [],
  "gallery_images": [],
  "floor_plans": [],
  "videos": [],
  "brochures": [],
  "virtual_tours": [],
  "rera_number": "",
  "description": "",
  "location_advantages": [],
  "nearby_places": [],
  "builder_details": {},
  "project_url": ""
}
```

## Local Storage

SQLite is the default durable local store so the engine can run without external services. Production adapters can send the same normalized objects to PostgreSQL, MongoDB, Elasticsearch, Redis, and vector stores.

## Continuous Monitoring

Use `rei run-source` on a schedule. The monitor compares normalized snapshots by stable canonical keys and emits alert events for:

- new project detected
- price increased/decreased
- possession date changed
- new brochure/media uploaded
- status changed to sold-out, ready-to-move, or new launch
