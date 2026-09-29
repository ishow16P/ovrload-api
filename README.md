# Ovrload API

Express 5 + Mongoose. Auth = JWT in httpOnly cookie `ovr_token`. Frontend: [`ovrload-web`](../ovrload-web).

## Local

```bash
cp .env.example .env   # set JWT_SECRET (32+ chars)
npm i && npm run seed && npm run dev   # http://localhost:4000/api/health (Docker image listens on 3000)
```

## Deploy on Railway

The web service proxies `/api` to this service over Railway's private network, so the browser only ever
talks to the web domain (first-party cookie). **Don't** call this service's public URL from the browser.

1. New Project → **Deploy from GitHub repo** → this repo (`railway.json` → Dockerfile + `/api/health` healthcheck).
2. **+ New → Database → MongoDB** in the same project.
3. Variables:

   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | `${{MongoDB.MONGO_URL}}` |
   | `MONGODB_DB` | `ovrload` |
   | `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `PORT` | `3000` (same as the Dockerfile; the web service's `API_UPSTREAM` must use this port) |

   The image sets `NODE_ENV=production` (Secure cookie) and `TRUST_PROXY=1` (the web nginx hop).
4. No public domain needed. Note the service name — the web service uses
   `http://${{<api-service>.RAILWAY_PRIVATE_DOMAIN}}:3000`.

Every start runs `src/seed/seed.js` first (idempotent upsert of the master exercise list).

```bash
docker build -t ovrload-api .
docker run --rm -p 3000:3000 -e MONGODB_URI=mongodb://host.docker.internal:27017 -e MONGODB_DB=ovrload \
  -e JWT_SECRET=<32+ chars> ovrload-api
```

## Endpoints (`/api`)

🔒 = login required, data scoped to the user.

| Method | Path | |
|---|---|---|
| GET | /health | healthcheck |
| POST | /auth/register | `{ email, password (8+), displayName }` |
| POST | /auth/login | `{ email, password }` (rate-limited 20 / 15 min) |
| POST | /auth/logout | clear cookie |
| GET, PATCH | /auth/me | 🔒 current user / `{ displayName }` |
| PUT | /auth/password | 🔒 `{ currentPassword, newPassword }` → logs out other devices |
| GET | /exercises?muscleGroup=&q= , /exercises/:id | public, read-only |
| GET, POST | /programs | 🔒 |
| GET, PUT, DELETE | /programs/:id | 🔒 |
| POST | /logs | 🔒 start `{ programId }` → sets prefilled from last session / program targets |
| GET | /logs?status=&limit= | 🔒 history |
| GET, PUT, DELETE | /logs/:id | 🔒 PUT `{ entries, notes }` = autosave |
| PATCH | /logs/:id/finish | 🔒 |
