# Deploy OpsFlow (Git + MongoDB Atlas + Render + Vercel)

## Architecture

| Service | Host | Purpose |
|---------|------|---------|
| MongoDB Atlas | Cloud | Database |
| Render | `server/` | Node.js API + Socket.IO |
| Vercel | `client/` | React static frontend |
| GitHub | Repo | Source control |

## 1. GitHub

```bash
git init
git add .
git commit -m "OpsFlow multi-tenant incident platform"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Do **not** commit `.env` files (root `.gitignore` excludes them).

## 2. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Database Access → create user with password.
3. Network Access → **Allow access from anywhere** (`0.0.0.0/0`) for Render, or add Render outbound IPs.
4. Connect → Drivers → copy connection string:
   `mongodb+srv://USER:PASS@cluster.mongodb.net/opsflow?retryWrites=true&w=majority`

## 3. Render (API)

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
4. Environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET` | Random 32+ chars |
| `JWT_REFRESH_SECRET` | Different random 32+ chars |
| `CLIENT_URL` | `https://YOUR_APP.vercel.app` (add preview URLs comma-separated if needed) |
| `PORT` | (Render sets automatically) |

5. Deploy. Note your API URL, e.g. `https://opsflow-api.onrender.com`.

6. **Seed once** (Render Shell or local with production `MONGO_URI`):

```bash
cd server
MONGO_URI="your-atlas-uri" npm run seed
```

Demo logins after seed: `alex@acme.io` / `password123`.

Or use **Blueprint**: repo includes `render.yaml` at root → Render → **New Blueprint**.

## 4. Vercel (frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment variables (required at **build** time):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://opsflow-api.onrender.com/api/v1` |
| `VITE_SOCKET_URL` | `https://opsflow-api.onrender.com` |
| `VITE_USE_MOCK` | `false` |

4. Deploy. Copy the Vercel URL (e.g. `https://opsflow.vercel.app`).

5. Update Render `CLIENT_URL` to match Vercel URL exactly (include `https://`, no trailing slash). Redeploy API if CORS fails.

`client/vercel.json` enables SPA routing (React Router).

## 5. Verify production

- [ ] `GET https://YOUR_API.onrender.com/health` → `{"ok":true}`
- [ ] Vercel app loads, login with seed user
- [ ] Incidents list, create, detail, comments
- [ ] Org switcher, invite link flow
- [ ] No "Mock API" banner in sidebar

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | `CLIENT_URL` on Render must match Vercel origin exactly |
| 401 / cannot login | Re-run seed on Atlas DB; check `MONGO_URI` |
| Socket not connecting | `VITE_SOCKET_URL` = API host without `/api/v1` |
| Cold start slow | Render free tier spins down; first request may take ~30s |
| Uploads disappear | Render disk is ephemeral; use object storage for production persistence |

## Local production smoke test

```bash
cd server && NODE_ENV=production npm start
cd client && npm run build && npm run preview
```
