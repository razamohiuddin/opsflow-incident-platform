# OpsFlow — Frontend

Multi-tenant incident management UI built with **Vite + React (JavaScript)**, **Redux Toolkit**, **Tailwind CSS**, and **Axios**. Ready to connect to the Node/Express backend.

## Quick start

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

**Demo login (mock mode):** `alex@acme.io` / `password123`

## Environment

Copy `.env.example` to `.env`:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend REST base, e.g. `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | Socket.IO server, e.g. `http://localhost:5000` |
| `VITE_USE_MOCK` | `true` = in-memory mock API; `false` = real backend |

When the backend is ready, set `VITE_USE_MOCK=false` and start the API on port 5000.

## Theme

- **Light** and **dark** mode with toggle in the app header (sun/moon icon).
- Preference saved in `localStorage` (`opsflow_theme`).
- Login, signup, and create-org screens include the toggle (top-right).

## Screens (Requirements §10)

- Login / Signup
- Dashboard (metrics from `/dashboard/metrics`)
- Incident list (filters, debounced search, pagination, sort)
- Incident detail (timeline, comments, @mentions)
- Create / Edit incident
- Organization settings (invites, members, org switcher)

## Architecture

```
src/
  services/     # API layer — swap mock vs axios via VITE_USE_MOCK
  store/        # Redux slices (auth, organization, incidents, dashboard)
  features/     # Page-level UI
  components/   # Reusable layout + UI primitives
  hooks/        # useDebounce, usePermissions, useSocket
  constants/    # Routes, roles, enums
```

### Backend integration

- **Auth:** `Authorization: Bearer <accessToken>`, refresh on `401` + `TOKEN_EXPIRED`
- **Tenant:** `X-Organization-Id` header on every org-scoped request
- **Socket:** connects when `VITE_USE_MOCK=false`; listens for `incident:updated`, `comment:created`

Service files mirror planned REST routes (`authService`, `incidentService`, etc.).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
