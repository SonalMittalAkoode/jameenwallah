# JameenWallah Deployment Handoff

This package contains the current local production-ready database snapshot and a restore script.

## Database Restore

Install dependencies from the backend before restoring:

```bash
cd backend
npm install
```

Restore the packaged database into the target MongoDB database:

```bash
cd deployment-artifacts
MONGO_URI="mongodb+srv://USER:PASSWORD@HOST/jameenwallah?retryWrites=true&w=majority" \
node restore-ejson-dump.mjs ./db-export-current
```

The restore script clears and reloads each exported collection in the target database. Take a production backup first.

## Frontend Environment

Use these for staging:

```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://jameenwallah.akoodedemo.com
NEXT_PUBLIC_API_BASE_URL=https://jameenwallah-api.akoodedemo.com
NEXT_PUBLIC_ADMIN_API_URL=https://jameenwallah-api.akoodedemo.com/admin
AI_STAGING_BACKEND_URL=https://jameenwallah-api.akoodedemo.com
AI_STAGING_ACCESS_KEY=<strong-random-admin-only-key>
GEMINI_API_KEY=<server-side-google-gemini-key>
GOOGLE_MAPS_API_KEY=<server-side-google-maps-key-if-place-photo-api-is-enabled>
AI_CHATBOT_API_URL=https://jameenwallah-chatbot.akoodedemo.com/chat
```

Use these for production:

```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://jameenwallah.com
NEXT_PUBLIC_API_BASE_URL=https://api.jameenwallah.com
NEXT_PUBLIC_ADMIN_API_URL=https://api.jameenwallah.com/admin
AI_STAGING_BACKEND_URL=https://api.jameenwallah.com
AI_STAGING_ACCESS_KEY=<strong-random-admin-only-key>
GEMINI_API_KEY=<server-side-google-gemini-key>
GOOGLE_MAPS_API_KEY=<server-side-google-maps-key-if-place-photo-api-is-enabled>
AI_CHATBOT_API_URL=https://chatbot.jameenwallah.com/chat
```

`NEXT_PUBLIC_API_BASE_URL` must point to the backend origin without `/frontend/api`.
`NEXT_PUBLIC_ADMIN_API_URL` must point to the same backend origin with `/admin`.

## Backend Environment

Use these for staging:

```bash
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://USER:PASSWORD@HOST/jameenwallah_staging?retryWrites=true&w=majority
JWT_SECRET=<strong-random-jwt-secret>
FRONTEND_URL=https://jameenwallah.akoodedemo.com
API_BASE_URL=https://jameenwallah-api.akoodedemo.com
CORS_ALLOWED_ORIGINS=https://jameenwallah.akoodedemo.com,http://localhost:3000
EMAIL_USER=<smtp-or-gmail-user>
EMAIL_PASS=<smtp-or-gmail-app-password>
GEMINI_API_KEY=<server-side-google-gemini-key>
GEMINI_MODEL=gemini/gemini-2.5-flash
```

Use these for production:

```bash
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://USER:PASSWORD@HOST/jameenwallah?retryWrites=true&w=majority
JWT_SECRET=<strong-random-jwt-secret>
FRONTEND_URL=https://jameenwallah.com
API_BASE_URL=https://api.jameenwallah.com
CORS_ALLOWED_ORIGINS=https://jameenwallah.com,https://www.jameenwallah.com,https://jameenwallah.akoodedemo.com
EMAIL_USER=<smtp-or-gmail-user>
EMAIL_PASS=<smtp-or-gmail-app-password>
GEMINI_API_KEY=<server-side-google-gemini-key>
GEMINI_MODEL=gemini/gemini-2.5-flash
```

## Preflight Checks

Run these before switching traffic:

```bash
cd backend
npm install
NODE_ENV=production npm start
```

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=https://<backend-domain> \
NEXT_PUBLIC_ADMIN_API_URL=https://<backend-domain>/admin \
npm run build
npm start
```

Check these routes:

- `/`
- `/properties`
- `/properties?city=Delhi`
- `/properties/city/gurgaon`
- `/blog`
- `/about`
- `/lawyer`
- `/financer`
- `/architect`
- `/chartered-accountant`
- `/property-management-services`
- `/cmsadminlogin/enquiry-list`
- `/cmsadminlogin/call-request-list`
- `/cmsadminlogin/property-enquiry-list`

Check these backend APIs:

- `GET /frontend/api/properties?limit=1`
- `GET /frontend/api/cities-with-properties`
- `GET /frontend/api/site-content/footer`
- `POST /frontend/api/call-request`
- `POST /frontend/api/enquiry`
- `POST /frontend/api/propertyenquiry`
- `GET /admin/api/call-request`
- `GET /admin/api/enquiry`
- `GET /admin/api/property-enquiry`
