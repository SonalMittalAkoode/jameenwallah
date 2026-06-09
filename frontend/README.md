# JameenWallah Frontend

This is the Next.js frontend for JameenWallah. It serves public pages, admin CMS pages, AI Suggestion Staging, API proxy routes, and sitemap routes.

For full repo setup, contribution rules, backend setup, database exports, and deployment notes, start with the root docs:

- [../README.md](../README.md)
- [../CONTRIBUTING.md](../CONTRIBUTING.md)
- [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- [../docs/AI_STAGING_RUNBOOK.md](../docs/AI_STAGING_RUNBOOK.md)

## Local Development

Start the backend local stack first:

```bash
cd ../backend
npm run local-stack
```

Then start the frontend:

```bash
cd ../frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 npm run dev
```

Open `http://localhost:3000`.

## Build And Verify

```bash
npm run build
npm run verify:production-ready
```

For production domain asset checks:

```bash
npm run verify:production-domains
```
