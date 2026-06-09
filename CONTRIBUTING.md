# Contributing

Thanks for working on JameenWallah. This repo touches production content, property inventory, SEO metadata, images, and admin bulk update tools, so contributions need a little discipline.

## Ground Rules

- Do not push branches, create PRs, deploy, or import database files unless the task explicitly asks for it.
- Do not commit secrets, `.env*`, `backend/.local-stack-runtime.json`, SSH details, admin tokens, database passwords, or raw production dumps.
- Preserve existing MongoDB `_id` values and existing property IDs unless a migration plan explicitly requires a change.
- Do not delete original code or source database exports while preparing corrections. Generate new corrected output beside the original.
- Keep frontend, backend, and data changes separated in commits when possible.
- Do not run "Push All Pending Live" on production unless a production Mongo backup exists and the reviewed change set is understood.

## Branch And Commit Style

Use short, descriptive branches:

```bash
git checkout -b codex/ai-staging-image-review
```

Write commits around one concern:

- `docs: add deployment and contribution guide`
- `fix: normalize property enum updates`
- `feat: stage gallery image removal`
- `test: cover AI staging bulk field paths`

Before committing, inspect the full diff:

```bash
git status --short
git diff --stat
git diff
```

If generated folders such as `database-exports/` appear in `git status`, only commit them when the task explicitly requires committing that artifact.

## Local Development

Start backend:

```bash
cd backend
npm install
npm run local-stack
```

Start frontend:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 npm run dev
```

The local stack imports backup BSON data into an in-memory MongoDB and writes a temporary admin token to `backend/.local-stack-runtime.json`. That file is ignored by git and must stay local.

## Testing Expectations

For UI/content-only frontend changes:

```bash
cd frontend
npm run build
```

For production readiness:

```bash
cd frontend
npm run verify:production-ready
```

For AI staging service changes:

```bash
cd backend
npm run verify:ai-staging
```

For field-path, bulk update, push, and restore changes:

```bash
cd backend
npm run verify:ai-staging:bulk
```

The bulk verifier is slow and mutates/restores local data. Let it finish. If it is interrupted, check whether it is still running before starting another verifier:

```bash
ps -ef | grep verify-ai-staging-bulk-all
```

## AI Staging Rules

When editing `frontend/src/components/property/dashboard/ai-suggestion-staging/` or `frontend/src/app/api/ai-staging-suggestions/route.js`:

- Keep property descriptions long and useful for buyers/investors.
- Stage every editable field separately so admins can review before push.
- Keep gallery image edits explicit and reviewable.
- Do not let Gemini generate or rewrite image URLs.
- Keep restore paths working for both single-field and bulk pushes.
- Verify admin API updates and public page reflection where a public surface exists.

## Database Change Rules

Database corrections should be generated as new exports:

```bash
cd backend
node scripts/export-corrected-database.mjs
```

Before sending an export to a database engineer:

- Confirm the manifest preserves existing IDs.
- Confirm no unwanted third-party/person-like gallery images remain.
- Confirm suspicious small areas, such as `1`, `3.5`, or `4.5` sqft values, have been corrected only when source text supports the real area.
- Keep the older database locally until the imported replacement is verified.

## Production Safety Checklist

Before production deployment or database import:

- Production MongoDB backup created and stored locally by the database engineer.
- Frontend and backend commit SHAs recorded.
- Environment variables reviewed for frontend and backend.
- `npm run build` passes in `frontend/`.
- `npm run verify:production-ready` passes locally.
- Staging admin route tested on the production domain after deployment.
- `/api/local-stack-runtime` returns `403` on production.
- `Push All Pending Live` and `Restore Last Bulk Push` have been tested locally for the affected field types.

