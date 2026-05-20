# OpsFlow — Backend API

Node.js + Express + MongoDB multi-tenant incident management API.

## Setup

```bash
cd server
cp .env.example .env
# Start MongoDB locally or set MONGO_URI to Atlas
npm install
npm run seed
npm run dev
```

API base: `http://localhost:5000/api/v1`

## Connect frontend

In `client/.env`:

```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Demo credentials (after seed)

- `alex@acme.io` / `password123` (Admin)
- `jordan@acme.io` / `password123` (Manager)
- `sam@acme.io` / `password123` (Developer)

## API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user |
| GET | `/organizations` | List orgs |
| POST | `/organizations` | Create org |
| POST | `/organizations/:id/switch` | Switch tenant |
| GET | `/organizations/members` | List members (requires `X-Organization-Id`) |
| GET/POST | `/organizations/invites` | Invites |
| POST | `/organizations/invites/accept` | Accept invite |
| GET | `/incidents` | List with filters |
| CRUD | `/incidents/:id` | Incident ops |
| GET/POST | `/incidents/:id/comments` | Comments |
| POST | `/incidents/:id/attachments` | File upload |
| GET | `/dashboard/metrics` | Aggregations |

## Security

- bcrypt passwords
- JWT access + refresh tokens (hashed in DB)
- Helmet, CORS, rate limiting, mongo-sanitize
- Joi validation
- Tenant + RBAC middleware

## Socket.IO events

- `join:org`, `join:incident`, `leave:incident`
- Emits: `incident:updated`, `incident:assigned`, `comment:created`
