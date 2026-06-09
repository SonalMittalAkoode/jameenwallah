# Environment Variables

This repo uses separate frontend and backend environments. Keep production values in the deployment platform or server process manager, not in git.

## Frontend

Set these for `frontend/`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Public/admin backend origin used by browser and server code. Local value is usually `http://localhost:5001`. |
| `NEXT_PUBLIC_ADMIN_API_URL` | Optional | Admin API override. If unset, admin calls use `NEXT_PUBLIC_API_BASE_URL`. |
| `NEXT_PUBLIC_SITE_URL` | Yes for production | Canonical public site URL used by sitemap routes. |
| `NEXT_PUBLIC_API_KEY` | If forms require it | Public API key sent by some legacy form/property calls. |
| `NEXT_PUBLIC_END_API_KEY` | If forms require it | Alternate public API key name used by some legacy calls. |
| `GEMINI_API_KEY` | Required for Gemini staging | Server-side Gemini key used by `/api/ai-staging-suggestions`. |
| `GOOGLE_API_KEY` | Optional | Fallback key for Gemini route if `GEMINI_API_KEY` is not set. |
| `AI_STAGING_GEMINI_MODEL` | Optional | Gemini model override for AI staging. |
| `GEMINI_MODEL` | Optional | General Gemini model fallback. |
| `AI_STAGING_ACCESS_KEY` | Optional | Optional access key for staging access cookie flow. |
| `AI_STAGING_BACKEND_URL` | Optional | Backend override used by the staging backend proxy route. |
| `AI_CHATBOT_API_URL` | Optional | Python chatbot API URL. Defaults to `http://127.0.0.1:8010/chat`. |
| `VERIFY_PRODUCTION_PORT` | Optional | Port used by `frontend/scripts/verify-production-ready.mjs`. |
| `ANALYZE` | Optional | Set `true` for bundle analysis. |

## Backend

Set these for `backend/`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | Yes | Express API port. Local stack defaults to `5001`; normal backend defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | JWT signing secret for admin auth. Must match token issuer/validator. |
| `CORS_ALLOWED_ORIGINS` | Yes for production | Comma-separated frontend origins allowed by CORS. |
| `API_BASE_URL` | Recommended | Backend public base URL used by email/templates and local stack defaults. |
| `FRONTEND_URL` | Recommended | Public frontend URL used by email/templates and model helpers. |
| `NEXT_PUBLIC_FRONTEND_URL` | Optional | Fallback frontend URL for email helpers. |
| `EMAIL_USER` | If email enabled | SMTP username. |
| `EMAIL_PASS` | If email enabled | SMTP password. |
| `GEMINI_API_KEY` | If chatbot enabled | Gemini key for `backend/ai-chatbot`. |
| `GEMINI_MODEL` | Optional | Gemini model for chatbot. |
| `GOOGLE_MAPS_API_KEY` | Data scripts only | Used by image-fetching scripts that call Google Maps APIs. |

## Local Stack Variables

These only affect `backend/scripts/start-local-stack.mjs`.

| Variable | Purpose |
| --- | --- |
| `LOCAL_STACK_BACKUP_DIR` | Base BSON backup directory. |
| `LOCAL_STACK_SUPPLEMENTAL_DIR` | Optional supplemental BSON directory. |
| `LOCAL_STACK_IMAGE_UPDATE_OPS` | Optional JSON bulkWrite operations for property images. |
| `LOCAL_STACK_MAP_UPDATE_OPS` | Optional JSON bulkWrite operations for map/location fields. |
| `LOCAL_ADMIN_EMAIL` | Admin email used to generate the local token. Defaults to the seeded admin. |

The local stack writes `backend/.local-stack-runtime.json`. Treat it as sensitive because it includes a local admin JWT and Mongo URI. It is ignored by git.

