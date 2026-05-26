# Campus E-Magazine Backend

Node.js + TypeScript + Express + TypeORM + PostgreSQL API for the Campus E-Magazine frontend. Structured with clean architecture (same style as Dig-notice-backend).

## Stack

- **Runtime**: Node.js, TypeScript
- **HTTP**: Express 5
- **ORM**: TypeORM + PostgreSQL
- **Auth**: JWT (Bearer token)
- **Realtime**: Socket.IO

## Project structure

```
src/
├── frameworks/       # Express server, routes, middleware
├── adapters/         # Controllers, TypeORM entities, repository implementations
├── application/      # Use cases + repository interfaces
├── infrastructure/   # Database, WebSocket
├── config/           # Environment configuration
├── shared/           # Errors, logger, helpers
└── scripts/          # Database seed
```

## Setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Create PostgreSQL database `campus_emagazine` and update `.env`.

3. Install dependencies:

```bash
pnpm install
```

4. Seed sample data (admin, reader, sample magazine):

```bash
pnpm run seed
```

5. Start development server:

```bash
pnpm run dev
```

Server runs at `http://localhost:5000` by default.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | Login `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/register` | Public | Register `{ email, password, name, role? }` |
| GET | `/api/magazines` | Public | List published editions |
| GET | `/api/magazines/:id` | Public | Get edition with content |
| POST | `/api/magazines` | Admin | Create new edition |
| POST | `/api/suggestions` | User | Submit edit suggestion |
| GET | `/api/notifications` | User | User notifications |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/pending` | Admin | Editions with pending suggestions |
| GET | `/api/admin/suggestions/:editionId` | Admin | Suggestions for edition |
| POST | `/api/admin/merge/:editionId` | Admin | Merge suggestions `{ suggestionIds? }` |
| POST | `/api/admin/reject/:editionId` | Admin | Reject suggestions `{ suggestionIds? }` |
| POST | `/api/admin/create-admin` | Admin | Create admin user |

All authenticated routes use header: `Authorization: Bearer <token>`.

Responses follow `{ ok: true, data }` or `{ ok: false, error }`.

## WebSocket events

Connect with Socket.IO; pass JWT as `auth.token` or `Authorization` header.

| Event | Audience | Description |
|-------|----------|-------------|
| `notification` | Admins | New suggestion notification |
| `suggestion-created` | Admins | Suggestion submitted |
| `magazine-updated` | All | Edition content merged |
| `suggestion-accepted` | Contributor | Suggestion approved |
| `suggestion-rejected` | Contributor | Suggestion rejected |

## Default seed accounts

| Email | Password | Role |
|-------|----------|------|
| admin@campus.edu | admin123 | admin |
| reader@campus.edu | reader123 | reader |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Development with hot reload |
| `pnpm run build` | Compile TypeScript |
| `pnpm run start` | Run compiled build |
| `pnpm run seed` | Seed database |
