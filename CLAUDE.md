# CLAUDE.md — Mise

## Project summary

Mise is a household meal-planning web app for two people. It plans recipes for
the week, generates a deduplicated grocery list, and tracks the use-by dates of
perishable leftovers so food gets used before it spoils. It is a private household
tool (not a commercial product) that will be installed on two phones as a PWA.

**Current phase: Phase 0 — mock-data MVP.** A clickable, mobile-first front-end
prototype running entirely on in-memory mock data. Not in scope yet: real auth,
Supabase, hosting config, push notifications, the calendar feed, a service worker.
Do not create accounts or call external services.

## Stack

Vite + React + TypeScript (strict) · Tailwind CSS v4 (`@tailwindcss/vite`) ·
React Router · Zod · Vitest + React Testing Library (jsdom) · ESLint · husky.

Keep dependencies minimal. **Ask before adding any package** not already in
`package.json`. Install with exact versions (`.npmrc` sets `save-exact`) and commit
`package-lock.json`.

## Commands

| Task             | Command                    |
| ---------------- | -------------------------- |
| Install          | `npm ci`                   |
| Dev server       | `npm run dev` → http://localhost:5173 |
| Build            | `npm run build`            |
| Tests            | `npm test` (watch: `npm run test:watch`) |
| Lint             | `npm run lint`             |
| Type check       | `npm run typecheck`        |
| Secret scan      | `npm run secrets:scan` (needs `gitleaks` on PATH) |

The pre-commit hook (`.husky/pre-commit`) runs gitleaks on staged changes, lint,
and type check. CI (`.github/workflows/ci.yml`) runs lint, type check, tests,
`npm audit --omit=dev`, and a gitleaks scan on every push and PR.

## Folder structure

```
src/
  config/      env parsing (Zod over import.meta.env)
  domain/      pure logic + Zod schemas — NO React, NO I/O (grocery, leftovers, suggestions, dates)
  data/        repository interfaces, React context/hooks, implementations (memory/ for Phase 0)
  mock/        generic mock recipes, plan, household
  components/  shared presentational UI (shell, buttons, sheets, badges)
  features/    one folder per screen: plan, recipes, grocery, useSoon
docs/          spec.md, decisions.md, security-plan.md
```

## Architecture rules

1. **All data access goes through repository interfaces** (`src/data/repositories.ts`).
   UI talks only to hooks from `src/data/hooks.ts` / `RepositoryContext`. UI must not
   import from `src/mock` or `src/data/memory`. Phase 1 swaps in a Supabase
   implementation without touching UI code.
2. **Domain logic is pure** (`src/domain`): no React, no I/O, no `Date.now()` —
   "today" is always passed in. Every domain function has Vitest tests.
3. **Validate with Zod at the repository boundary.** Every create/update input is parsed.
4. Keep files small; one concern per file.
5. Grocery items and leftovers are always **derived** from the plan, never stored.
   The only stored grocery state is which lines are checked.

## Security and public-repo rules (always apply)

This repo is **public**. Treat everything as world-readable.

- Never commit secrets, keys, tokens, passwords, connection strings, project URLs,
  or real email addresses — not in code, comments, docs, tests, mock data, or
  commit messages. Review `git diff --cached` before every commit.
- Use only obviously fictional names in mock data (e.g. "Alex Example"). No real
  names, emails, addresses, or locations.
- Config is read only via `import.meta.env`, validated by `src/config/env.ts` at
  startup (fails loudly). Phase 0 has no required variables. `.env.example` holds
  names with empty values only.
- Never hardcode the allowed-user list — it belongs in server-side config later.
- Never use `dangerouslySetInnerHTML`, `eval`, `new Function`, or string event
  handlers (ESLint enforces this). Render user text only through React escaping.
- Pin GitHub Actions to full commit SHAs. CI must need no secrets in Phase 0.
- Don't run package install scripts you can't justify.

## Working agreement

- Small, clearly named commits; run tests + type check as you go.
- Ambiguity → make a reasonable choice, record it in `docs/decisions.md`, keep moving.
- Stop and ask before adding a dependency or touching any external service.
- Keep this file current as the project evolves.
