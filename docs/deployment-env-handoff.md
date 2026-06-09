# JameenWallah Deployment Env Handoff

This branch is intended to deploy the same app behavior that is running on localhost: production frontend, backend API, AI suggestion staging, cleaned property data, media/image proxies, service pages, comparison, filters, and chatbot.

Do not commit real secrets to the repository. Set secrets in the hosting provider dashboard or with `vercel env add` / the backend host's secret manager.

## Deployment Targets

| Environment | Frontend URL | Backend API URL |
| --- | --- | --- |
| Local | `http://localhost:3000` | `http://localhost:5001` or `http://localhost:5000` |
| Staging | `https://jameenwallah.akoodedemo.com` | `https://jameenwallahapi.akoodedemo.com` |
| Production | `https://jameenwallah.com` and `https://www.jameenwallah.com` | production API origin, for example `https://api.jameenwallah.com` |

The frontend must never be deployed with a browser-visible localhost backend URL in staging or production.

## Frontend Env

Set these on the Next.js frontend deployment.

```bash
NEXT_PUBLIC_SITE_URL=https://jameenwallah.akoodedemo.com
NEXT_PUBLIC_API_BASE_URL=https://jameenwallahapi.akoodedemo.com
NEXT_PUBLIC_ADMIN_API_URL=https://jameenwallahapi.akoodedemo.com/admin
AI_STAGING_BACKEND_URL=https://jameenwallahapi.akoodedemo.com
AI_STAGING_ACCESS_KEY=<strong-private-access-key>
GEMINI_API_KEY=<google-gemini-api-key>
AI_STAGING_GEMINI_MODEL=gemini-2.5-flash
GOOGLE_API_KEY=<google-api-key-if-shared-for-gemini-or-places>
GOOGLE_MAPS_API_KEY=<google-maps-places-key>
GOOGLE_PLACES_API_KEY=<google-places-key>
AI_CHATBOT_API_URL=<optional-python-chatbot-url>
MONGODB_URI=<optional-direct-mongo-uri-only-if-frontend-server-routes-need-it>
NEXT_PUBLIC_END_API_KEY=<optional-public-form-api-key>
NEXT_PUBLIC_API_KEY=<optional-public-form-api-key>
NEXT_PUBLIC_HERO_FILTER_CITY_ID=
```

For production, replace the URLs:

```bash
NEXT_PUBLIC_SITE_URL=https://jameenwallah.com
NEXT_PUBLIC_API_BASE_URL=https://api.jameenwallah.com
NEXT_PUBLIC_ADMIN_API_URL=https://api.jameenwallah.com/admin
AI_STAGING_BACKEND_URL=https://api.jameenwallah.com
```

### Frontend Env Rules

- `NEXT_PUBLIC_*` values are visible in the browser. Do not store admin tokens, Gemini keys, Mongo passwords, or JWT secrets in `NEXT_PUBLIC_*`.
- `AI_STAGING_BACKEND_URL` is server-only and is used by `/api/ai-staging-backend/*` to proxy API requests safely from staging/production.
- `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_MAPS_API_KEY`, and `GOOGLE_PLACES_API_KEY` are server-only. They power AI suggestions, chatbot fallback, and place-photo image fetching.
- If Google Places images are used, the Google key must allow Places API and any required domain/IP restrictions for the deployment host.
- `AI_STAGING_ACCESS_KEY` protects `/cmsadminlogin/ai-suggestion-staging` when enabled. Share it only with internal reviewers.

## Backend Env

Set these on the backend API deployment.

```bash
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<strong-random-secret>
API_BASE_URL=https://jameenwallahapi.akoodedemo.com
FRONTEND_URL=https://jameenwallah.akoodedemo.com
NEXT_PUBLIC_FRONTEND_URL=https://jameenwallah.akoodedemo.com
NEXT_PUBLIC_API_BASE_URL=https://jameenwallahapi.akoodedemo.com
CORS_ALLOWED_ORIGINS=https://jameenwallah.akoodedemo.com,https://jameenwallah.com,https://www.jameenwallah.com
EMAIL_USER=support@jameenwallah.com
EMAIL_PASS=<mail-provider-app-password-or-secret>
```

For production:

```bash
API_BASE_URL=https://api.jameenwallah.com
FRONTEND_URL=https://jameenwallah.com
NEXT_PUBLIC_FRONTEND_URL=https://jameenwallah.com
NEXT_PUBLIC_API_BASE_URL=https://api.jameenwallah.com
CORS_ALLOWED_ORIGINS=https://jameenwallah.com,https://www.jameenwallah.com,https://jameenwallah.akoodedemo.com
```

### Backend Env Rules

- `MONGO_URI` must point to the approved staging or production database.
- `JWT_SECRET` must be stable across backend restarts. Changing it logs out all admins.
- `CORS_ALLOWED_ORIGINS` must include the exact frontend origins with protocol and no trailing slash.
- The backend serves uploaded/static images under `/images/*`; frontend image proxies depend on this.

## API Wiring

Public frontend API clients use:

```text
${NEXT_PUBLIC_API_BASE_URL}/frontend/api/...
```

Admin API clients use:

```text
${NEXT_PUBLIC_ADMIN_API_URL}/...
```

The staging admin suggestion page and fallback production API proxy use:

```text
/api/ai-staging-backend/<backend-path>
```

That proxy forwards to:

```text
${AI_STAGING_BACKEND_URL}/<backend-path>
```

Important backend paths:

```text
/frontend/api/properties
/frontend/api/property/:slug
/frontend/api/blogs/all
/frontend/api/builder
/frontend/api/site-content/:section
/admin/api/property
/admin/api/builder
/admin/api/site-content
```

## Database Deployment

The corrected local dataset must be imported as a new dataset/backup, not by deleting old database export folders.

Recommended rollout:

1. Take a fresh production Mongo backup.
2. Import the verified corrected export into a staging database first.
3. Point staging backend `MONGO_URI` to the staging database.
4. Run staging smoke tests.
5. After approval, import or promote the same verified dataset to production.
6. Point production backend `MONGO_URI` to the production database.

The latest property-wise suggestion report is:

```text
database-exports/property-wise-suggestion-report-2026-06-05T08-37-16-834Z/property_wise_suggestions.csv
```

The latest suggestion run report is:

```text
database-exports/professional-suggestion-update-2026-06-05T08-37-16-834Z/professional_suggestion_update_report.json
```

## Pre-Deploy Checks

Run these before opening the PR as ready for merge:

```bash
cd frontend
npm run build
npm run verify:next-assets
npm run verify:production-ready
```

Run backend checks against the intended database:

```bash
cd backend
npm run verify-local-flow
npm run verify-ai-staging-service
node scripts/audit-property-details.mjs
```

Manual browser checks:

- `/`
- `/properties`
- `/properties/residential`
- `/properties/commercial`
- `/blog`
- `/about`
- `/contact`
- `/lawyer`
- `/financer`
- `/architect`
- `/chartered-accountant`
- `/property-management-services`
- `/cmsadminlogin/ai-suggestion-staging`

## Deployment Acceptance Criteria

- Homepage, blog, services, property listing, property detail, compare, and contact pages load without 500s.
- No `localhost` API URLs appear in staging/production browser network calls.
- No visible grey placeholder images such as `370X240`, `690X350`, or `1170X600`.
- Property cards show professional images and at least useful specs such as area, beds, baths, or request labels without broken layout.
- Builder/developer logos are visible on non-white backgrounds and no mock initial-only logo cards are shown as final logos.
- Villas and intentionally hidden bad listings are not visible in public listings.
- The DLF `₹75,000` style tiny-price issue does not appear.
- AI suggestion staging loads, can generate Gemini suggestions, and can push approved data live.
- Production chatbot works on the homepage or falls back gracefully if the Python chatbot URL is not configured.
- Sitemaps generate with the correct `NEXT_PUBLIC_SITE_URL`.

## Notes For Deployment Engineer

- Keep staging and production envs separate. Do not reuse staging Mongo credentials in production.
- For Vercel, set frontend env vars separately for Preview and Production. Preview can use `jameenwallah.akoodedemo.com`; Production must use `jameenwallah.com`.
- Pull envs locally with `vercel env pull .env.local --environment=preview` when debugging staging.
- If any image proxy fails, verify both frontend server-only Google keys and backend `/images/*` static file access.
- If frontend receives 404s for Next assets, clear `.next`, rebuild, and redeploy from a clean build artifact.
