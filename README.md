# JameenWallah

JameenWallah is a real estate platform with a Next.js frontend, an Express/MongoDB backend, admin CMS tools, public property pages, editorial pages, blogs, and an AI Suggestion Staging workflow for reviewing bulk property and page updates before they are pushed live.

The repository is split into two applications:

- `frontend/` - Next.js 15 app for public pages, admin pages, API proxy routes, AI staging UI, sitemap routes, and production verification scripts.
- `backend/` - Express API, MongoDB models/controllers/routes, local Mongo backup stack, database correction/export scripts, and AI staging verification scripts.

## Core Workflows

- Public website: home, property listing/detail pages, service pages, blogs, sitemap XML routes.
- Admin CMS: `/cmsadminlogin/*` routes for properties, amenities, categories, blogs, partners, teams, enquiries, and AI staging.
- AI Suggestion Staging: `/cmsadminlogin/ai-suggestion-staging`
  - Loads verified properties and editable site/blog records from the admin API.
  - Stages description, SEO, status, amenities, payment plan, floor plan, address/connectivity, size, and gallery image suggestions.
  - Supports "Update All Properties + Pages", "Gemini All Suggestions", "Push All Pending Live", and "Restore Last Bulk Push".
  - Keeps image URL edits reviewable by admins and blocks Gemini from inventing or rewriting image URLs.

## Local Setup

Use two terminals: one for the backend, one for the frontend.

```bash
cd backend
npm install
npm run local-stack
```

`npm run local-stack` starts an in-memory MongoDB, imports the configured backup datasets, creates a local admin token, writes `backend/.local-stack-runtime.json`, and starts the Express API on port `5001` by default.

In another terminal:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 npm run dev
```

Open:

- Public site: `http://localhost:3000`
- Admin staging: `http://localhost:3000/cmsadminlogin/ai-suggestion-staging`
- Admin staging alias: `http://localhost:3000/cmsadminlogin/ai-suggestions-staging`

The local staging page can read `backend/.local-stack-runtime.json` through `/api/local-stack-runtime`. That helper is local-only and must return `403` in production.

## Environment Variables

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for the complete list.

Common local values:

```bash
# frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=optional-local-key
AI_STAGING_GEMINI_MODEL=gemini-2.5-flash

# backend
PORT=5001
MONGO_URI=mongodb://...
JWT_SECRET=replace-me
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Do not commit `.env*`, `backend/.local-stack-runtime.json`, database dumps, production credentials, or generated export zips unless a reviewer explicitly asks for a specific artifact.

## Verification

Run these before handing work to another developer or preparing a PR.

```bash
cd frontend
npm run build
npm run verify:production-ready
```

With the local backend stack and frontend running:

```bash
cd backend
npm run verify:ai-staging
npm run verify:ai-staging:bulk
```

`verify:ai-staging:bulk` is intentionally slow. It mutates each staged field through the admin API, checks reflection where possible, and restores the original values. Use it before deployment-sensitive AI staging changes.

## Deployment

Deployment details and production safety checks are documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Short version:

1. Back up production MongoDB first.
2. Deploy backend and frontend from the same reviewed commit.
3. Confirm production environment variables point at the correct backend, site URL, and Gemini key.
4. Verify Next static assets and staging routes after deploy.
5. Run AI staging changes on production only after admin login, review, and backup confirmation.

## Database Corrections And Exports

Database export/correction workflow is documented in [docs/DATABASE_OPERATIONS.md](docs/DATABASE_OPERATIONS.md).

The current correction script preserves existing property `_id` values, corrects known tiny acre-as-sqft sizes, and removes third-party/person-like gallery image URLs in a generated export without modifying the source local database.

```bash
cd backend
node scripts/export-corrected-database.mjs
```

Review the generated `database-exports/<timestamp>/manifest.json` before sending it to a database engineer.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing application code or data scripts. The main rules are:

- Keep production deployment and local database work separated.
- Preserve existing MongoDB IDs unless a migration document explicitly says otherwise.
- Test staged property/page changes locally before touching production.
- Do not push, deploy, import data, or open PRs without explicit approval.

