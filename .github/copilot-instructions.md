> Read me first. These instructions are sent with every Copilot Agent request. They are short, task‑agnostic, and describe how to work efficiently in this repo. Trust these instructions and only search the codebase if information here is missing or proven wrong.
>

## 1) What this repository does (high‑level)

A **Relume‑style website generator** built on **Next.js (App Router)**. Users create projects, generate AI‑assisted **Sitemaps** and **Wireframes**, choose section **variants**, adjust **design tokens**, and **export** a production‑ready Next.js site. The app uses genuine CRUD with a SQL database via **Prisma**, strict **TypeScript**, **Tailwind v4** (zero‑config), **shadcn/ui** components, and **Vercel AI SDK** with **OpenAI**.

**Project type & tech:** Full‑stack web app. Languages: TypeScript/TSX, SQL (Prisma). Frameworks: Next.js (>=14 App Router), Tailwind v4, shadcn/ui, TanStack Query, react‑hook‑form + zod, NextAuth (Auth.js), UploadThing + sharp, Vercel AI SDK (OpenAI). Target runtime: Node.js ≥ 20 (LTS).

## 2) Build & validation — exact commands

> Always: use pnpm; ensure Node ≥ 20; copy envs; run Prisma commands before first build.
>

**Bootstrap (fresh clone):**

```
pnpm install
cp .env.example .env   # then fill required secrets (see below)
pnpx prisma generate
pnpx prisma migrate dev --name init
pnpm run dev           # verify boots locally
```

**Build (CI‑safe):**

```
pnpm run typecheck
pnpm run lint
pnpm run build
```

**Run (local):** `pnpm run dev` ⇒ http://localhost:3000

**Tests:** If test suite is present: `pnpm run test`. (If missing, agent should add minimal smoke tests only when requested.)

**Lint/Format:** `pnpm run lint` / `pnpm run format` (if defined). Treat lint warnings that affect runtime as failures.

**Common pitfalls & fixes:**

- **Prisma schema changed** → run `pnpx prisma generate` then `pnpx prisma migrate dev`.
- **Missing envs** → check `.env.example` and section **3) Environment** below.
- **Hydration warnings** → do not put `"use client"` in `app/layout.tsx`; co‑locate client components under page components.
- **Tailwind v4** requires `@import "tailwindcss";` and tokens in `styles/globals.css` (no `tailwind.config.ts`).

> When a command ordering matters, use the sequence above (install → prisma generate → migrate → typecheck → lint → build). If a step fails, do not continue; fix and re‑run from the failing step.
>

## 3) Environment & secrets (required)

Create `.env` from `.env.example` and set at minimum:

```
DATABASE_URL= file:./dev.db            # SQLite dev (or Postgres URL in prod)
NEXTAUTH_SECRET= <generated>
OPENAI_API_KEY= <your key>
UPLOADTHING_SECRET= <...>
UPLOADTHING_APP_ID= <...>
# Optional: RESEND_API_KEY, STRIPE_SECRET_KEY, CALCOM_ORIGIN, etc.
```

**Always** validate `.env` presence before running Prisma or the dev server.

## 4) Project layout & where things live

```
/               package.json, README.md, .env.example
/app            Next.js App Router pages & layouts
  /(auth)       Auth screens (login, etc.) with local /components
  /(app)        App screens (dashboard, projects, wireframes, settings)
  /api          Route Handlers (CRUD, AI, export, uploads)
/prisma         schema.prisma, migrations/
/src
  /sections     Predefined section variants (kind/variant/index.tsx) + registry
  /lib          Helpers (seo, validations, utils)
/styles         globals.css (Tailwind v4 + tokens, breakpoints, utilities)
/.github
  /workflows    CI pipelines (lint, typecheck, build, test if present)
```

**Key configs:** TypeScript `tsconfig.json` (strict), ESLint `.eslintrc*`, Tailwind via `styles/globals.css` (no tailwind config file), Prisma `prisma/schema.prisma`.

**Styling baseline (used everywhere):**

- Wrap content with `.container-1440 pad-responsive`.
- Breakpoints: 420px / 920px / 1440px.
- Sidebar layouts: `.with-sidebar` (sidebar 280px; content respects `pad-responsive`).
- Design tokens defined in `styles/globals.css` under `@theme inline` (colors, radius, fonts).

## 5) Coding standards & conventions

- **TypeScript strict**; prefer precise types; `any` **only** in `catch (err: any)` error paths.
- **shadcn/ui first**, Tailwind utilities only to glue.
- **High cohesion & Single Responsibility:** co‑locate component files within the screen; avoid cross‑page "god components". Mark explicit globals (Header/Footer) only.
- **Forms** use `react-hook-form` + `zod` with resolvers, a11y labels, and `aria-live` for errors.
- **Data** via **TanStack Query v5** (queries + mutations with optimistic updates and invalidation).
- **AI** via **Vercel AI SDK** (`ai` + `@ai-sdk/openai`).
- **Images** via `next/image`; uploads via UploadThing; variants via `sharp`.
- **SEO** via `generateMetadata`, `app/sitemap.ts`, `app/robots.ts`, OG images.

## 6) CI & validation expectations

- A CI workflow (if present) should run, at minimum: `pnpm install`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, and tests.
- Agents should **mimic CI locally** using the sequence in **2)** before creating PRs.
- PRs must not introduce hydration warnings, type errors, or failing migrations.

## 7) Quick facts to reduce searching

- **Entry points:** `app/layout.tsx` (imports `styles/globals.css`), page routes under `app/*/page.tsx`.
- **APIs:** add/modify route handlers under `app/api/**/route.ts`.
- **Database:** edit `prisma/schema.prisma`, then `pnpx prisma generate` + `pnpx prisma migrate dev`.
- **Section variants:** add new component under `src/sections/<kind>/<variant>/index.tsx` and map in `src/sections/registry.ts`.
- **Common scripts** (expected in `package.json`): `dev`, `build`, `typecheck`, `lint`, `db:push|migrate|seed`.

## 8) Final guidance to the agent

- **Follow this file verbatim.** Only run repository‑wide searches if these instructions are incomplete or produce errors.
- Prefer **small, compiling changes** with clear commit messages over large refactors.
- If a command fails, document the failure in the PR description and include the exact fix you applied.
