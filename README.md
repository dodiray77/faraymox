# Faraymox

Dashboard monitoring infrastruktur untuk perangkat **MikroTik**, **Proxmox**, dan **Docker**. Dibangun dengan Next.js (App Router) dan sebuah custom server Node.js yang sekaligus menjalankan Socket.IO untuk trafik real-time.

## Menjalankan

Proyek ini memakai **pnpm**.

```bash
pnpm install
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

> **Catatan:** `pnpm dev` menjalankan `node server.js` (bukan `next dev`). Server kustom ini melayani Next.js **dan** Socket.IO pada port yang sama (`PORT`, default `3000`).

Build & produksi:

```bash
pnpm build
pnpm start
```

Lint:

```bash
pnpm lint
```

Tidak ada script test/typecheck di repo ini.

## Konfigurasi

Buat file `.env` di root (tidak di-commit):

```env
APP_NAME=faraymox
HOST=0.0.0.0
PORT=3000
NODE_ENV=development
MOCK=false
DATABASE_URL="file:./db/dev.db"
```

- Set `MOCK=true` untuk menjalankan UI dengan data contoh tanpa perangkat/host asli.
- Variabel opsional untuk integrasi nyata: `MIKROTIK_HOST`, `PROXMOX_HOST`, `PROXMOX_TOKEN`, `DOCKER_HOST`.

## Database

SQLite via Prisma 7 dengan driver adapter `better-sqlite3`.

- Config Prisma: **`prisma7.config.ts`** (penamaan default Prisma 7).
- Schema: `prisma/schema.prisma`; migrasi di `prisma/migrations`.
- Client hasil generate berada di `src/generated/prisma` dan **di-gitignore** — jangan mengeditnya langsung.

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

## Struktur singkat

- `server.js` — custom server: Next request handler + Socket.IO. Client join room `traffic:<deviceId>:<interface>`, server polling MikroTik tiap 2 detik lalu emit `traffic-update`.
- `src/app/(dashboard)/` — halaman UI: `/`, `/mikrotik`, `/mikrotik/[id]`, `/proxmox`, `/docker`.
- `src/app/api/` — route handler: `/api`, `/api/mikrotik`, `/api/proxmox`, `/api/docker`.
- `src/lib/` — layer data/service (Prisma, koneksi MikroTik, Docker, Proxmox).
- `src/data/device.js` — data perangkat contoh + helper routing.

UI dan komentar kode menggunakan Bahasa Indonesia.
