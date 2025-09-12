# Relume‑Style Website Generator (Next.js)

Ein Full‑Stack Website‑Generator wie relume.io: Projekte ➜ AI‑Sitemap ➜ Wireframes ➜ Varianten/Replace ➜ Design‑Tokens ➜
Export (Next.js).

## Features

- **Projects CRUD** mit Prisma + Route Handlers
- **Sitemap Board** (Cards, Zoom/Pan, Reorder)
- **Sections‑Library** (10–50 Varianten je Kind) + **Snapshot Thumbnails**
- **Wireframe Canvas** (DnD, Inline‑Copy, Swap, Undo/Redo)
- **Variant Explorer & Replace** (Copy bleibt)
- **Favorites & AI Ranking** (OpenAI über Vercel AI SDK)
- **Design Settings** (Fonts/Radius/Colors Tokens)
- **Media Pipeline** (UploadThing + sharp + next/image)
- **SEO & OG & Analyzer**
- **AI Copy Assist** (per Page)
- **Exporter** (Next.js Zip)
- **Forms Module**, **Cal.com**, **E‑Commerce Starter**, **Library Admin**, **Sitemap Import**, **Figma Export (opt.)**

## Tech Stack

Next.js (App Router) • TypeScript (strict) • Tailwind v4 • shadcn/ui • TanStack Query v5 • react‑hook‑form + zod •
Prisma • AuthJS • UploadThing + sharp • Vercel AI SDK (OpenAI).

## Konventionen

- **Paddings:**
    - **Sections (export):** `.container-1440.pad-responsive` (420→20px, 920→40px, 1440→60px all)
    - **App UI (Dashboard/Tool):** `.app-shell` (fluid; Gutters ≈ 16/24/32px). Sidebar 280px via `.with-sidebar`.
- **TS:** `strict: true`, `noImplicitAny: true`; `any` nur in `catch (err: any)`.
- **UI:** shadcn‑first; hohe Kohäsion; page‑lokale Komponenten.

## Setup (Kurz)

```bash
pnpm i
cp .env.example .env   # Secrets setzen
pnpx prisma generate && pnpx prisma migrate dev
pnpm dev
```
