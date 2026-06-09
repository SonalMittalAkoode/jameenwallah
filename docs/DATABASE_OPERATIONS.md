# Database Operations

This repo includes scripts for local backup import, staging verification, and corrected database export. Treat production data as the source of truth unless a database engineer has approved a replacement export.

## Local Backup Stack

```bash
cd backend
npm run local-stack
```

The local stack:

- Starts an in-memory MongoDB.
- Imports BSON collections from configured backup directories.
- Optionally applies image/map update operations.
- Creates a local admin JWT.
- Writes `backend/.local-stack-runtime.json`.
- Starts the Express API on port `5001` by default.

The local stack does not modify production MongoDB.

## Corrected Export

Generate a corrected export from the currently running local stack:

```bash
cd backend
node scripts/export-corrected-database.mjs
```

The script writes:

- `database-exports/jameenwallah-corrected-<timestamp>/collections/*.json`
- `database-exports/jameenwallah-corrected-<timestamp>/manifest.json`
- `database-exports/jameenwallah-corrected-<timestamp>.zip`

Current correction behavior:

- Preserves existing MongoDB `_id` values.
- Corrects known suspicious tiny area values where source text supports acre-to-sqft conversion.
- Updates related `details.totalAreaInSqFt` and tiny floor-plan area values where applicable.
- Removes/deduplicates gallery image URLs flagged as third-party or person/profile-like.
- Does not mutate the source local database.

## Before Sending An Export

Review:

```bash
cat database-exports/<export-folder>/manifest.json
```

Confirm:

- `unchangedPropertyIds` is `true`.
- Collection counts are expected.
- Size corrections are limited to reviewed records.
- Image removals are expected.
- No production credentials or local runtime files are included.

## Database Engineer Import Instructions

Send the database engineer:

1. The corrected export zip.
2. The manifest.
3. This instruction:

   > Please create a local backup of the current production MongoDB before importing. Import the corrected export collection-by-collection while preserving the existing `_id` values. Do not drop the old backup until the production website, admin property list, property detail pages, images, amenities, sizes, and AI staging page have been verified. If any issue appears, restore from the saved backup immediately.

## Production Import Safety

Never import a corrected export directly into production without:

- A fresh production MongoDB backup.
- A checked manifest.
- A written import window.
- A rollback owner.
- A post-import smoke test on public and admin pages.

Post-import checks:

- `/properties` shows the expected count.
- Removed properties stay removed.
- Property IDs and slugs still work.
- Known corrected sizes no longer show `1 sqft`, `3.5 sqft`, or `4.5 sqft`.
- Gallery images are relevant to properties and do not show people/profile/third-party unrelated photos.
- Amenities/features render on property pages.
- AI staging still loads properties and editorial pages.

