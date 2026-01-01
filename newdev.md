## New Developer Guide

Welcome to Movie Hype. This guide gives you a high-level tour of the architecture and the day‑to‑day developer workflow so you can be productive quickly.

## Overview

Movie Hype tracks trending movies, stores historical “hype” snapshots, and streams live updates to the UI.

- **Monorepo** using Yarn workspaces: `client` (Next.js), `server` (Fastify API + Socket.IO + Prisma), and `shared` (cross‑package types).
- **Realtime** updates over Socket.IO (`/events` namespace, `hype` event).
- **Data** in PostgreSQL via Prisma; Redis for health and future background needs.

## Repository layout

- `client/` Next.js app (React, React Query, Socket.IO client)
- `server/` Fastify API + Socket.IO + Prisma + background ingestor
- `shared/` Cross‑package TypeScript types
- `docker-compose.yml` Local Postgres and Redis
- `README.md` Project summary
- `newdev.md` This document

## Tech stack

- Runtime: Node.js (ESM)
- Frontend: Next.js, React 18, React Query, Socket.IO client
- Backend: Fastify 5, Socket.IO, Prisma 7, PostgreSQL, Redis, pino
- Testing: Vitest (client and server)
- Language: TypeScript (strict)

## Architecture

### Server (`server/`)

- Fastify app exposes:
  - `GET /health`: checks DB and Redis.
  - Socket.IO namespace `/events` (CORS permissive for local dev).
- Prisma 7 uses a PostgreSQL adapter for direct DB connections.
- Background ingestor (`server/src/services/worker.ts`):
  - Every 30s, pulls trending movies (TMDB) or emits a mock if no API key.
  - Upserts the `Movie`, inserts a `HistoricalSnapshot`, emits a `hype` event to `/events`.

### Client (`client/`)

- Fetches `/health` periodically to show system status.
- Subscribes to Socket.IO on `/events` and listens for `hype` events.
- `useSocket` hook manages subscription and last event state.

### Shared (`shared/`)

- Types shared between packages via TS path alias `@shared/*`.

## Data model (Prisma)

- `User`: minimal example.
- `Movie`: `id`, `tmdbId` (unique), `title`, timestamps.
- `HistoricalSnapshot`: linked to `Movie`, stores `hypeScore`, `popularity`, timestamp, and an index for queries.

Schema: `server/prisma/schema.prisma`  
Migrations/config: see “Prisma 7 configuration” below.

## Local development

### Prerequisites

- Node 20.9+ (Node 22 recommended)
- Docker (optional but recommended for local Postgres/Redis)

### First‑time setup

1) Install dependencies

```bash
yarn install
```

2) Start Postgres and Redis (optional; or point to existing services)

```bash
docker compose up -d
```

3) Environment variables

- Create `server/.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/movie_hype
REDIS_URL=redis://localhost:6379
PORT=4000
TMDB_API_KEY= # optional; if omitted, the server emits mock events
```

- Create `client/.env.local`:

```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

4) Generate client and run migrations (server)

```bash
yarn workspace @movie-hype/server generate
yarn workspace @movie-hype/server generate
```

5) Optional seed (server)

```bash
yarn workspace @movie-hype/server seed
```

6) Start both apps

```bash
yarn dev
```

- Client: `http://localhost:3000`
- Server: `http://localhost:4000`

## Prisma 7 configuration

Prisma 7 separates connection configuration from the schema:

- `server/prisma/schema.prisma` no longer includes `datasource.url`.
- `server/prisma/prisma.config.ts` provides the connection URL for Migrate using `DATABASE_URL`.
- At runtime, the server initializes `PrismaClient` with the PostgreSQL adapter:
  - Adapter package: `@prisma/adapter-pg` (uses `pg` pool internally).

Common commands (run from repo root):

```bash
# Generate client
yarn workspace @movie-hype/server generate

# Migrate dev DB
yarn workspace @movie-hype/server migrate
```

## Testing

- Run all tests:

```bash
yarn test
```

- Client-only:

```bash
yarn workspace @movie-hype/client test
```

- Server-only:

```bash
yarn workspace @movie-hype/server test
```

Notes:
- Server tests stub Prisma and Redis where needed; use `vi.stubEnv` for env overrides.
- The health endpoint and live events are covered at a basic level—prefer adding focused unit tests near new logic.

## Coding conventions

- TypeScript: strict mode; prefer explicit, descriptive names.
- ESM across packages (`"type": "module"` in `server`).
- Use `yarn format` before commits.
- Paths: Use `@shared/*` to import from `shared/` in TS.
- Avoid deep nesting; prefer guard clauses and small, testable functions.

## Realtime events

- Namespace: `/events`
- Event: `hype`
- Payload (example):

```json
{
  "movie": { "id": "cuid", "tmdbId": 123, "title": "Title" },
  "snapshot": {
    "id": "cuid",
    "movieId": "cuid",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "hypeScore": 42,
    "popularity": 50
  }
}
```

Client consumes via `useSocket` pointing to `NEXT_PUBLIC_SERVER_URL + /events`.

## Common tasks

- Add a new DB field/model:
  1) Edit `server/prisma/schema.prisma`.
  2) `npm run migrate -w server`.
  3) Regenerate client: `npm run generate -w server`.
  4) Update server logic and client types/UI accordingly.

- Add a new API route:
  1) Add a Fastify route in `server/src/index.ts` or a new module.
  2) Validate inputs (e.g., `zod`) and return typed responses.
  3) Add tests in `server/src/*.test.ts`.

- Emit a new realtime event:
  1) Emit from worker or a route via `app.io.of('/events').emit('name', payload)`.
  2) Subscribe in client with `useSocket(serverUrl + '/events', 'name')`.

## Troubleshooting

- Prisma “url no longer supported”:
  - Ensure `server/prisma/prisma.config.ts` exists and contains the datasource URL.
  - Ensure server code uses the PostgreSQL adapter when creating `PrismaClient`.
- Connection issues:
  - Verify `DATABASE_URL`, `REDIS_URL`, and `NEXT_PUBLIC_SERVER_URL`.
  - Check ports `3000` (client) and `4000` (server).
- Websocket not connecting:
  - Confirm `NEXT_PUBLIC_SERVER_URL` points to the running server and CORS is open.
- Migrations failing:
  - Ensure Postgres is up (`docker compose ps`) and `DATABASE_URL` points to it.

## Deployment (brief)

- Provide `DATABASE_URL` and `REDIS_URL` in the server environment.
- Build artifacts:
  - Client: `yarn workspace @movie-hype/client build`, then `yarn workspace @movie-hype/client start`.
  - Server: `yarn workspace @movie-hype/server build`, then `yarn workspace @movie-hype/server start`.
- Run migrations at deploy time before starting the server.

## Where to start

- Read `server/src/index.ts` (routes, Socket.IO, Prisma init).
- Skim `server/src/services/worker.ts` (ingestion + event flow).
- Run locally and watch the client console area update with live `hype` events.


