<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Faraymox

Infra monitoring dashboard (Next.js App Router + a custom Socket.IO server) for MikroTik routers, Proxmox, and Docker.

## Commands

- Install: `pnpm install`. pnpm only (`packageManager: pnpm@12.4.2`, `pnpm-lock.yaml`). `postinstall` runs `prisma skills sync`.
- Dev: `pnpm dev` runs `node server.js`, **not** `next dev`. That custom server serves Next *and* hosts the Socket.IO traffic poller on the same port (`PORT` from `.env`).
- Prod: `pnpm build`, then `pnpm start` (`NODE_ENV=production node server.js`).
- Lint: `pnpm lint` (bare `eslint`). There is **no** test or typecheck script and no CI in-repo.

## Architecture

- `server.js` — custom `node:http` server that boots the Next request handler plus Socket.IO. Clients join room `traffic:<deviceId>:<interfaceName>`; the server polls MikroTik every 2s and emits `traffic-update`. Polling is reference-counted per room and stops when a room empties.
- `src/app/` — App Router. `(dashboard)` route group holds the UI: `/`, `/mikrotik`, `/mikrotik/[id]`, `/proxmox`, `/docker`; its `layout.js` wraps pages in the sidebar shell.
- `src/app/api/*` — route handlers, all `export const dynamic = "force-dynamic"`: `/api` (devices), `/api/mikrotik`, `/api/proxmox`, `/api/docker`.
- `src/lib/` — data/service layer. `prisma.js` constructs `PrismaClient` with the better-sqlite3 driver adapter; `mikrotik.js` keeps a process-wide connection pool on `globalThis._mikrotikConnections` keyed by device id (survives HMR); `services/mikrotik.service.js` wraps device queries + ping/identity.
- `src/data/device.js` — static/mock device list and `getDeviceHref` (always routes to `/mikrotik/<id>`).

## Prisma 7 quirks

- Config file is **`prisma7.config.ts`**, not `prisma.config.ts` (Prisma 7 renamed the default).
- Generator output is `src/generated/prisma` and is **gitignored** — never edit generated files; run `prisma generate` after schema edits.
- SQLite via `@prisma/adapter-better-sqlite3`; DB file is `db/dev.db` (`DATABASE_URL="file:./db/dev.db"`); migrations live in `prisma/migrations`.
- `pnpm lint` emits warnings inside `src/generated/prisma` (unused eslint-disable). Expected — don't "fix" generated code.

## Env and mock mode

- `.env` is gitignored. Two env modules exist and are not interchangeable:
  - `src/app/config/env.js` — `dotenv`, used by `server.js` (appName/host/port/nodeEnv/dbUrl).
  - `src/lib/config.js` — `server-only` + zod, exposes `isMock`.
- `MOCK=true` in `.env` makes API routes return canned data (`DEVICES`, `mockInterfaces`, Docker/Proxmox mocks) so the UI runs without real hardware.

## Conventions / gotchas

- Path alias `@/*` -> `src/*` (`jsconfig.json`).
- UI uses PrimeReact v11 namespaced components (`@primereact/ui/card` -> `Card.Root`, `Select.Trigger`, …), `@primeicons/react` icons, and Tailwind v4 via `@tailwindcss/postcss` (no `tailwind.config`). Dark mode class is `.my-app-dark`; theme state comes from `ThemeProvider` (localStorage key `sentinel-theme`).
- React Compiler is enabled; `routeros-client` is in `serverExternalPackages` (`next.config.mjs`). `server-only` is imported by `lib/config.js`, `lib/docker.js`, `lib/proxmox.js`.
- Known hardcoded values: socket client URL `http://localhost:3000` in `src/app/(dashboard)/mikrotik/[id]/page.js`, and a hardcoded category UUID in the `POST` handler of `src/app/api/mikrotik/route.js`.
- UI copy and code comments are in Indonesian (`<html lang="id">`).
