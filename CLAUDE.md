# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SitePilotPro frontend: a worksite (chantier) and client management dashboard. Nuxt 4 + Nuxt UI v4 + Tailwind v4, TypeScript. The UI language is French by default. A separate Laravel backend exists (see the PR template scope); authentication is meant to go through `nuxt-auth-sanctum`, but it is not configured or used yet.

## Commands

```bash
npm install          # also runs `nuxt prepare` (generates .nuxt/, required by eslint.config.mjs)
npm run dev          # dev server
npm run build        # production build
npm run lint         # eslint . (lint:fix to autofix)
npm run typecheck    # nuxt typecheck (vue-tsc)
npm run ci:local     # lint + typecheck + test, mirrors CI
```

Docker (multi-stage `Dockerfile`):
```bash
docker compose up front                 # dev with hot reload on :3000 (source bind-mounted)
docker compose --profile prod up front-prod   # `nuxt generate` served by nginx on :8080
```
The production image is a static SPA (`docker/nginx.conf` falls back to `200.html`). Since `ssr: false`, public runtime config is baked in at build time, so `NUXT_PUBLIC_*` values must be passed as build args, not runtime env vars.

- CI (`.github/workflows/ci-nuxt.yml`) uses **npm** (`npm ci`, Node 20) and `package-lock.json`, even though `packageManager` names pnpm and a `pnpm-lock.yaml` also exists. Keep `package-lock.json` in sync when changing dependencies.
- Test scripts call `vitest`, but vitest is **not installed** and there are no test files yet; the CI test job is commented out. `npm run test` (and therefore `ci:local`) will fail until vitest is added. Once it is, run a single test with `npx vitest run path/to/file.spec.ts` or `-t "name"`.

## Commit conventions

Commitlint (enforced in CI) uses conventional commits with a **required lowercase scope**: `type(scope): subject`. Allowed types: feat, fix, docs, style, refactor, perf, test, ci, chore, revert. Subject has no trailing period and is 3–100 characters. Example: `feat(worksite): add status filter`.

## Code style

ESLint stylistic rules (configured in `nuxt.config.ts`): semicolons, no trailing commas, 1tbs braces. Note that `.prettierrc.json` sets `trailingComma: "all"`, which conflicts; ESLint is what CI enforces, so follow it.

## Architecture

- **SPA only**: `ssr: false`. `server/api/` exists, but nothing calls it yet.
- **Source lives in `app/`** (Nuxt 4 layout); the `~` alias resolves to `app/`. Components are auto-imported with directory-prefixed names (e.g. `app/components/layout/SideBar.vue` → `<LayoutSideBar>`, `app/components/Worksites/index.vue` → `<Worksites>`).
- **Pages are thin**: `app/pages/worksite.vue` and `client.vue` only render the feature component (`<Worksites />`, `<Clients />`). The real logic lives in the feature folders under `app/components/<Feature>/`:
  - `index.vue`: the `UTable` (TanStack table under the hood) with pagination, global filter, column-visibility dropdown, and per-column cell/header slots (`#<columnId>-cell`, `#<columnId>-header`)
  - `<Feature>Filters.vue`: filter inputs bound through `v-model:global-filter` and similar props
  - `*.table.columns.ts`: `TableColumn<T>[]` definitions, with widths/alignment set through `meta.class.th/td`
  - `Types/`: the interface, plus enums with label maps and badge-color maps (e.g. `worksiteStatusEnum.ts`)
- **Shared table pieces** live in `app/components/Tables/`. `useTableColumns()` aggregates every feature's column definitions, so register new feature columns there. This folder also holds `ActionsDropdown.vue` (the row actions menu) and `utils/dateUtils.ts`.
- **Data is mocked**: tables import static arrays from `app/data/*.ts`. `server/api/worksites.ts` duplicates the same mock data.
- **Layout**: `layouts/Default.vue` wraps pages in `LayoutSideBar`, which uses `UDashboardGroup`/`UDashboardSidebar`. Add navigation links in the `links` array of `SideBar.vue`. Pages set `definePageMeta({ i18nTitle: '...' })`.
- **i18n**: `@nuxtjs/i18n` with the `no_prefix` strategy, default `fr`, plus `en`. Translations are split per domain in `i18n/locales/{fr,en}/<domain>.json`. A new domain file must be added to **both** locale `files` lists in `nuxt.config.ts`. Many labels (column headers, sidebar, status labels) are still hardcoded in French rather than translated.
- **Theming**: Nuxt UI colors `primary`/`secondary`/`tertiary` (set in `app/app.config.ts`) map to the custom palettes `primarySite`/`secondarySite`/`tertiarySite`, defined as `@theme` CSS variables in `app/assets/css/main.css`.
- Dates go through `dayjs-nuxt`. Forms are expected to use vee-validate with zod (installed, not used yet). Icons use Iconify `i-lucide-*`.
