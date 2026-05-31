# CLAUDE.md

This file is a contract for Claude Code working in this repository. Follow it exactly.

## Project Overview

beregner-dk is a Danish calculator website (MinBeregner.dk) — a large collection of free financial, tax, loan, health and date calculators rendered as Next.js App Router pages, plus a public read-only JSON API under `/api/v1`.

- Production URL: `minberegner.dk` (also serves the Swedish domain `beraknare.se`).
- Stack: Next.js 15 (App Router, `output: "standalone"`), React 19, TypeScript, Tailwind CSS v4, npm.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build (`next build`)
- `npm run start` — run the built app (`next start`)
- `npm run lint` — `next lint`
- `npm run test` — run the test suite once (`vitest run`)
- `npm run test:watch` — vitest in watch mode

## Architecture

- `src/app/` — App Router. One folder per calculator (e.g. `brutto-netto`, `boliglaan`, `bmi`, `valuta`), plus `blog/`, `kategori/`, `embed/`, and root metadata files (`sitemap.ts`, `robots.ts`, `manifest.ts`, `layout.tsx`).
- `src/app/api/v1/` — public JSON API endpoints (`moms`, `bmi`, `loen`) with an index `route.ts` documenting them.
- `src/app/api/health/` — health route used for deploy verification.
- `src/components/` — one `*Beregner.tsx` component per calculator, plus shared UI (`Header`, `Footer`, `Sidebar`, `SearchBar`), `ads/`, and `ui/`.
- `src/lib/` — pure logic and data: calculations, formatting, i18n (`i18n.ts`, `get-locale.ts`), `domain-config.ts`, `categories.ts`, `calculator-list.ts`, `kommuner.ts`. Co-located `*.test.ts` files hold the unit tests.
- `src/middleware.ts` — request middleware (locale/domain handling).
- `locales/` — translation files. `public/` — static assets.
- Multi-domain/locale aware (Danish primary; `beregner.no`, `beraknare.se` referenced).

## Deploy

The app is deployed via Dokploy (`.dokploy/preview.template.json`, `Dockerfile` with `next build` → standalone) to production host `minberegner.dk`. The default branch is `master` and Dokploy has autoDeploy enabled. Flow:

1. Stage only the specific files you changed (never `git add .`).
2. Commit with an English imperative message; push to `master`.
3. Dokploy auto-deploys from `master` (autoDeploy is on).
4. Watch the Dokploy deploy log until it finishes.
5. Verify on production: `curl -fsI https://minberegner.dk/api/health` must return `200`.

A deploy is not done until it is verified on production.

## Test

Tests live as `*.test.ts` files in `src/lib/` and run with vitest (`jsdom`, `@testing-library/react`).

- Run `npm run test` before pushing. It must pass.
- Add or update tests when changing logic in `src/lib/`.

## Language

- Code, identifiers, comments, and commit messages: English, imperative mood for commits.
- User-facing copy: Danish (the product is a Danish site; watch encoding of æ/ø/å — UTF-8).

## Do Not

- Do not `git push --force` on `master` (the default branch).
- Do not use `git add .` or `git commit -a` — stage only files you intentionally changed.
- Do not add new dependencies without asking first.
- Do not hardcode colors — this is a Tailwind v4 project; use theme tokens/utility classes.
- Do not commit secrets (API keys, tokens, env values) to any file.
- Do not change calculator math in `src/lib/` without updating the corresponding `*.test.ts`.
- Do not break the public `/api/v1` response shapes — they are a documented external contract (see `src/app/api/v1/route.ts`).
- Do not push to `master` directly for non-trivial work; open a PR.

## Danger Zones

These have real, hard-to-reverse effects. Require an explicit "yes" before doing any of them:

- Force-pushing or rewriting history on `master`.
- DNS / Dokploy domain changes (the project is multi-domain: `minberegner.dk`, `beregner.no`, `beraknare.se`).
- Changing or rotating any secret/credential.
- Sending real emails to non-test addresses (e.g. via the newsletter signup flow).
- Changing the public `/api/v1` contract, which third parties may consume.

GDPR note: the site serves Danish/EU end users and includes cookie consent, analytics, and a newsletter signup. Treat any personal data (email addresses, analytics identifiers) as in scope for GDPR — do not log, export, or transmit it to new destinations without explicit approval.
