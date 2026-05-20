# Render deploy (OpsFlow API)

This backend is **JavaScript**, not TypeScript. Do **not** add `tsc` or `dist/index.js`.

## Required settings

| Setting | Value |
|---------|--------|
| Root Directory | `server` |
| Build Command | `npm install` **or** `npm install && npm run build` |
| Start Command | `npm start` |
| Health Check | `/health` |

## Scripts in package.json

- `build` — no-op (satisfies Render if build step is enabled)
- `start` — `node src/server.js`
- `dev` — local only (`nodemon`)
