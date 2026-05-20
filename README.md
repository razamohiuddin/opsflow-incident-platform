# OpsFlow — Multi-Tenant Incident Management Platform

Full-stack MERN assignment: multi-tenant SaaS for engineering teams to manage incidents, collaborate, and track ops metrics.

## Structure

| Folder | Stack |
|--------|--------|
| `client/` | Vite + React (JavaScript), Redux Toolkit, Tailwind |
| `server/` | Node.js + Express (JavaScript), MongoDB, Socket.IO |
| `SYSTEM_DESIGN.md` | Architecture reference |
| `Requirements.md` | Assignment brief |

## Quick start

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

API: http://localhost:5000/api/v1

### 2. Frontend

```bash
cd client
cp .env.example .env
# Set VITE_USE_MOCK=false to use the API
npm install
npm run dev
```

App: http://localhost:5173

### Demo login (after seed)

- **alex@acme.io** / password123 (Admin)
- **jordan@acme.io** / password123 (Manager)
- **sam@acme.io** / password123 (Developer)

## Features implemented

- JWT auth + refresh tokens
- Multi-tenant org isolation (`X-Organization-Id`)
- RBAC (admin, manager, developer)
- Incidents CRUD, filters, pagination, optimistic concurrency (`version`)
- Activity timeline, comments with @mentions
- Dashboard MongoDB aggregations
- File attachments (local disk)
- Socket.IO real-time events
- Security: bcrypt, Helmet, rate limits, Joi validation, mongo sanitize

See `client/README.md` and `server/README.md` for details.

## Technology choices

Implemented in **JavaScript** (not TypeScript) to stay within assignment time while keeping Joi validation, layered modules, and the structure described in `SYSTEM_DESIGN.md`.

## Deploy (Atlas + Render + Vercel)

Step-by-step guide: **[DEPLOY.md](./DEPLOY.md)**

- **MongoDB Atlas** — database  
- **Render** — `server/` API (`render.yaml` blueprint included)  
- **Vercel** — `client/` frontend (`client/vercel.json` for SPA routes)  
- **GitHub** — push repo; do not commit `.env` files  

Production build verified: `cd client && npm run build`

## Pre-deploy checklist

1. `npm run seed` against Atlas (once)  
2. Render env: `MONGO_URI`, JWT secrets, `CLIENT_URL` = your Vercel URL  
3. Vercel env: `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_USE_MOCK=false`  
4. Hit `https://YOUR_API/health` → `{ "ok": true }`  
5. Login `alex@acme.io` / `password123` on Vercel app  
