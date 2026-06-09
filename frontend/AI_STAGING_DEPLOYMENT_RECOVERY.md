# AI Staging Deployment Recovery

This note exists because the AI Suggestion Staging code can build correctly while production still serves an older or partial Next.js deployment.

## Current Production Symptoms

- `https://jameenwallah.akoodedemo.com/cmsadminlogin/ai-suggestion-staging` returns page HTML, but some `/_next/static` JavaScript and CSS chunks return `400`.
- `https://jameenwallah.com/cmsadminlogin/ai-suggestion-staging` is served by the Laravel/LiteSpeed host and returns `404`, so it is not currently pointing at this Next.js frontend deployment.

## Required Recovery Steps

1. Merge this PR using a GitHub account that is a member of the `eatiakoode's projects` Vercel team.
2. Redeploy the latest `main` commit with Vercel cache cleared, or run a fresh VPS deploy that removes the old `.next` folder before `next build`.
3. Verify the frontend route after deployment:

```bash
cd frontend
npm run verify:production-domains
```

4. If `jameenwallah.com` must expose the AI staging admin route, point that domain to the same Next.js frontend deployment as `jameenwallah.akoodedemo.com`.

## Expected Result

After a fresh deploy from the merged commit, the verification script should report `Broken assets: 0` for the Next.js frontend routes.
