# Movie Hype Monorepo

Monorepo containing a Next.js client and Fastify server with Prisma, Redis, Socket.IO, Vitest, Docker, CI.

## Requirements

- Node.js v20+ (`.nvmrc` provided)
- Docker (for Postgres + Redis)

## Structure

- `client/` — Next.js App Router app
- `server/` — Fastify API with Prisma ORM, Socket.IO
- `shared/` — Shared TypeScript types

## Setup

1. Install deps:

```bash
npm install
```

2. Infra (Postgres + Redis):

```bash
docker compose up -d
```

3. Env vars:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Prisma:

```bash
npm run generate -w server
npm run migrate -w server
npm run seed -w server   # optional
```

5. Dev:

```bash
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:4000

## Scripts

- `npm run test` — run client and server tests (Vitest)
- `npm run build` — build client and server
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check
- `npm run validate -w server` — Prisma schema validation

## CI

GitHub Actions runs format check, Prisma validate, tests, and builds on push/PR.

## Notes

- Server emits live events on `/events` namespace; client listens via `useSocket`.
- Health endpoint: `GET /health` returns DB/Redis status.
