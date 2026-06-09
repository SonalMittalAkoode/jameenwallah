# Operations

## Install

```bash
cd packages/real-estate-intelligence-engine
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip setuptools
pip install -e ".[browser,stores,pdf]"
playwright install chromium
```

## Discover URLs

```bash
rei discover \
  --start-url https://www.dlf.in \
  --include project \
  --include residential \
  --out data/dlf_urls.json
```

## Extract A Single URL

```bash
rei crawl-url "https://example.com/project-page" \
  --source-name "Example Builder" \
  --render-js \
  --download-media \
  --out data/example-project.json
```

## Run Configured Sources

```bash
rei run-source \
  --sources config/sample_sources.json \
  --render-js \
  --download-media \
  --out-dir data/run \
  --sqlite data/rei.sqlite
```

## Production Scheduling

Recommended cadence:

- Discovery: daily per domain
- Project detail recrawl: daily for active projects, weekly for stable ready-to-move projects
- Media refresh: weekly or on detected page changes
- Price/inventory alerting: immediate after extraction diff
- Full source audit: monthly

## Quality Gates

Before importing into a production property portal:

- `project_name` present
- `builder_name` present
- city/locality/address confidence reviewed
- at least one canonical identity signal
- price source confidence recorded
- RERA extracted or marked unavailable
- gallery media rights verified
- duplicate project detection run against existing inventory
