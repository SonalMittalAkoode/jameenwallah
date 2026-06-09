# AI Suggestion Staging Runbook

Route: `/cmsadminlogin/ai-suggestion-staging`

The staging tool exists so admins can review AI and rule-based suggestions before they reach MongoDB.

## What It Stages

Property fields:

- Long description
- Price/rate metadata
- SEO meta title
- SEO meta description
- Status and possession fields
- RERA fields
- Configuration
- Size
- Facing
- Ownership
- Parking
- Payment plan
- Address and zip code
- Nearby/connectivity
- Amenities/features
- Floor plans
- Gallery images

Editorial fields:

- Home page content and SEO
- About/contact/partner/service page content and SEO
- Footer service links
- Blog titles, excerpts, content, and SEO metadata

## Buttons

| Button | What it does | Safety note |
| --- | --- | --- |
| `Refresh Live Data` | Reloads properties and editorial records from the admin API. | Safe read. |
| `Run Monthly Scan` | Builds staged suggestions from the live API snapshot. | Safe until fields are pushed. |
| `Update All Properties + Pages` | Refreshes the full staging queue across loaded property and editorial records. | Review generated fields before live push. |
| `Gemini All Suggestions` | Runs Gemini enrichment across loaded records. | Gemini is blocked from image URL generation. |
| `Push All Pending Live` | Writes all pending suggestions through the authenticated admin API. | Requires backup and admin confirmation process. |
| `Restore Last Bulk Push` | Restores previous values captured by the last bulk push. | Use from the same tab/session after a bad push. |
| `Add to Reviewed` | Moves a field into the reviewed set for controlled approval. | Preferred for careful production batches. |
| `Approve & Push Field` | Pushes one field immediately. | Verify the public page afterward. |
| `Restore Field` | Restores a field from its saved before-value when available. | Use after single-field mistakes. |

## Image Handling

Gallery image suggestions are staged as `media.images`.

Rules:

- Existing database image URLs can be shown and reviewed.
- Admins can remove unwanted images from the suggested list before pushing.
- Gemini must not generate, rewrite, or replace image URLs.
- Third-party/person-like URLs should be filtered before export or staged for removal.
- Google Maps/Places images should only be kept when they match the actual property/building context.

## Size Handling

Some imported records may contain acre values incorrectly shown as sqft, for example `1 sqft`, `3.5 sqft`, or `4.5 sqft`. Corrections should be staged or exported only when the listing description/source text supports the real area.

Use the correction/export workflow in [DATABASE_OPERATIONS.md](DATABASE_OPERATIONS.md) when preparing a cleaned database for production import.

## Local Testing

Start backend and frontend:

```bash
cd backend
npm run local-stack
```

```bash
cd frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 npm run dev
```

Run service tests:

```bash
cd backend
npm run verify:ai-staging
```

Run full field-path tests:

```bash
cd backend
npm run verify:ai-staging:bulk
```

Manual browser checks:

1. Open `http://localhost:3000/cmsadminlogin/ai-suggestion-staging`.
2. Confirm counts load.
3. Confirm the four bulk buttons are visible.
4. Search a known property custom ID or slug.
5. Confirm every staged field shows current/suggested values.
6. Confirm gallery images show preview/remove controls.
7. Confirm suspicious size corrections appear as staged suggestions.
8. Open a property page from staging and confirm it renders.
9. Use a single-field approve/restore on local data.
10. Check browser console for hydration, image proxy, or API errors.

## Production Checklist

Before production AI staging:

- MongoDB backup exists.
- Production frontend and backend are deployed from the intended commit.
- `/api/local-stack-runtime` returns `403`.
- Admin login is working.
- `Refresh Live Data` reads the expected number of records.
- Gemini key is configured if Gemini buttons are needed.
- At least one property and one editorial page have been tested manually.

