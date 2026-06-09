# Deployment Runbook

Use this runbook for production-style deployments. It is intentionally conservative because the AI staging tool can update many property and page fields at once.

## Deployment Targets

- Frontend: Next.js app in `frontend/`.
- Backend: Express API in `backend/`.
- Production/staging domain currently tested by this repo: `https://jameenwallah.akoodedemo.com`.
- Main public domain may require separate DNS/proxy configuration before it serves the Next.js admin route.

## Pre-Deploy Checklist

1. Confirm the branch and commit to deploy.
2. Confirm no unintended generated files are included:

   ```bash
   git status --short
   git diff --stat
   ```

3. Back up production MongoDB before any database import or AI staging live push.
4. Confirm backend environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CORS_ALLOWED_ORIGINS`
   - `API_BASE_URL`
   - `FRONTEND_URL`
5. Confirm frontend environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `GEMINI_API_KEY` or `GOOGLE_API_KEY`
   - `AI_STAGING_GEMINI_MODEL` if a specific model is required.

## Local Production Build Verification

From `frontend/`:

```bash
npm install
npm run build
npm run verify:production-ready
```

`verify:production-ready` clears `.next`, builds, starts a local `next start` server, and verifies the home page and AI staging admin route load their `/_next/static` assets.

With the local backend stack running:

```bash
cd backend
npm install
npm run local-stack
```

In another terminal:

```bash
cd frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 npm run build
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 npm run start
```

Then run:

```bash
cd backend
npm run verify:ai-staging
npm run verify:ai-staging:bulk
```

## Backend Deployment

1. Install dependencies in `backend/`.
2. Set production environment variables.
3. Start or restart the backend process:

   ```bash
   cd backend
   npm install
   npm run start
   ```

4. Verify a backend route from the frontend server/network.
5. Confirm CORS allows the production frontend origin and blocks unrelated origins.

## Frontend Deployment

1. Install dependencies in `frontend/`.
2. Set production environment variables.
3. Clear stale Next build output before building:

   ```bash
   cd frontend
   rm -rf .next
   npm install
   npm run build
   npm run start
   ```

4. After deploy, verify production assets:

   ```bash
   cd frontend
   npm run verify:production-domains
   ```

If a deployment serves HTML but static chunks return `400` or `404`, rebuild with the old `.next` directory removed and redeploy from the same commit.

## Post-Deploy Verification

Open these URLs:

- `https://jameenwallah.akoodedemo.com/`
- `https://jameenwallah.akoodedemo.com/properties`
- `https://jameenwallah.akoodedemo.com/cmsadminlogin/ai-suggestion-staging`
- `https://jameenwallah.akoodedemo.com/sitemap.xml`
- `https://jameenwallah.akoodedemo.com/sitemap-properties.xml`

Expected:

- Public pages return `200`.
- Admin staging page loads only for authenticated admin flow.
- `/api/local-stack-runtime` returns `403` on production.
- No broken `/_next/static` JavaScript or CSS assets.
- Staging page shows property and editorial records from the live admin API.
- Image previews use existing database URLs or safe proxy fallbacks, not broken 404 spam.

## AI Staging Production Use

Before clicking any production bulk button:

1. Confirm production Mongo backup exists.
2. Confirm you are logged in as an admin.
3. Click `Refresh Live Data`.
4. Review the counts for loaded records and pending records.
5. For Gemini updates, run a small sample first if possible.
6. Use `Add to Reviewed` for fields that need controlled approval.
7. Use `Push All Pending Live` only when the reviewed batch is intended to go live.
8. Immediately verify at least one public property page and one editorial page.
9. If the result is wrong, use `Restore Last Bulk Push` from the same staging tab/session.

## Rollback

Use the safest available rollback in this order:

1. `Restore Last Bulk Push` if the issue came from the staging UI and the staging tab/session still has the restore snapshot.
2. Restore specific fields through the admin API if only a few records are affected.
3. Restore MongoDB from the pre-deploy backup if the import or bulk push was broad.
4. Redeploy the previous known-good frontend/backend commit if code caused the issue.

Record what was restored, when, and which backup or commit was used.

