# Repository Instructions – Relume Clone (Website-Generator)

## Mission
Baue eine App wie **relume.io**. Arbeit erfolgt **screen‑weise** anhand von Screenshots (du bekommst die Bilder im Prompt). **Immer echtes CRUD mit DB** (Prisma + Route Handlers), **keine Stubs**. Pixelgenauigkeit ±5 % bei 1440/920/420.

## Master Prompt (eingebettet)
- **Stack:** Next.js App Router + TypeScript + ESLint/Prettier + **Tailwind v4** (zero‑config).
- **UI‑Policy:** **shadcn/ui zuerst** (Button, Card, Dialog, Input, Label, Textarea, Select, Tabs, Tooltip, Toast, Breadcrumb, Table). Nur wenn nicht vorhanden → Tailwind.
- **State/Data:** **TanStack Query v5** (Query/Mutation + Optimistic Updates).
- **Forms/Validation:** **react-hook-form** + **zod** (+ `@hookform/resolvers/zod`).
- **Auth:** **Auth.js (next-auth v5)** mit Prisma‑Adapter.
- **DB:** Prisma (SQLite dev).
- **AI:** **OpenAI** über **Vercel AI SDK** (`ai` + `@ai-sdk/openai`).
- **Images:** `next/image` + `uploadthing` + `sharp` Varianten; `alt` Pflicht.
- **SEO:** `generateMetadata`, `app/sitemap.ts`, `app/robots.ts`, OG‑Images.
- **Exporter:** erzeugt ein Next.js‑Projekt (Zip); Header/Footer global dedupliziert.
- **Styling‑Baseline:** `.container-1440.pad-responsive` überall. Breakpoints **420/920/1440**. Sidebar‑Layouts mit `.with-sidebar` (Sidebar 280px; Content‑Abstand = `pad-responsive`). **Fonts/Radius/Brand‑Tokens** via `globals.css` (`@theme`).
- **Qualität:** `strict: true`, **kein `any`** außer im Fehlerpfad (`catch (err: any)`). **Hohe Kohäsion**, **Single Responsibility**, **keine God‑Components**. Komponenten **page‑lokal**; global nur Header/Footer.

## Regeln & Erwartungen
1. **Ein Prompt = ein Screen** (**UI + echte Daten**). Keine Abhängigkeiten zu späteren Prompts. Wenn Daten fehlen, **erzeuge DB‑Schema, Migration, CRUD‑API** innerhalb dieses Prompts.
2. **Files to touch** werden im Prompt angegeben; **nur** diese anfassen.
3. **DB‑Fluss** (Standard): Prisma Schema ▶ `prisma migrate dev` ▶ Route Handlers (`app/api/.../route.ts`) ▶ TanStack Query (GET/LIST) + Mutations (POST/PATCH/DELETE) **mit Optimistic Updates** + `invalidateQueries`.
4. **Zod** für jede Eingabe (API & Form). Fehler pattern: `catch (err: any) { toast.error(message) }`.
5. **UI‑Konventionen:** `.container-1440.pad-responsive` um *jede* Page/Section. Drei Spalten ab 1440, zwei ab 920, eine bis 420 (wenn relevant). Sidebar‑Layouts nutzen `.with-sidebar`.
6. **Akzeptanz:** Typecheck/Build ok, Pixel‑Nähe ±5 %, responsiv (420/920/1440), keine Hydration‑Warnings, CRUD funktioniert (create/read/update/delete) inkl. Dialogen & Toaster.

## Folder‑Guides
- Screens: `app/(auth)/**`, `app/(app)/**` – jeweils **lokale** `components/`.
- Sections‑Library: `src/sections/<kind>/<variant>/index.tsx`, Registry für `kind`+`variant`.
- Keine cross‑page UI‑Shareds ohne ausdrückliche Aufforderung.

## Prompt‑Kontrakt
Jeder Prompt liefert **komplette Umsetzung** des benannten Screens: **UI, Prisma‑Schema (falls nötig), Migrations, API‑Routes, Queries/Mutations, Zod‑Schemas, Toaster‑Feedback, a11y**. Zusätzlich **Liste der angefassten Dateien** + **kurze Begründung** je Datei.
