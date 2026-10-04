# Security plan for later phases

Phase 0 is a front-end prototype on mock data with no backend, no accounts, and no
secrets. This document records how later phases must be secured. It contains no
real values; real configuration lives only in git-ignored files and in the hosting
and database providers' settings.

## 1. Database: Supabase with Row Level Security everywhere

- **RLS is enabled on every table**, including join tables, with no exceptions.
  A migration check (CI) fails if any table in the public schema has RLS disabled.
- Data is owned by a **household**. Tables: `households`, `household_members`
  (`household_id`, `user_id`), and household-scoped `recipes`, `ingredients`,
  `plan_entries`, `grocery_checks`.
- Every policy is scoped through membership, e.g.
  `household_id in (select household_id from household_members where user_id = auth.uid())`
  for select, insert, update, and delete — each operation has its own explicit
  policy. Inserts use `with check` so rows cannot be written into another household.
- Leftovers and grocery lists stay derived (computed client-side or in a view that
  inherits RLS via `security_invoker`), never trusted from client input.
- Inputs are still validated with Zod at the repository boundary; database
  constraints (not null, check constraints, foreign keys) back them up.

## 2. Keys

- The client only ever receives the **anon/publishable key**, which is safe only
  because RLS is on everywhere.
- The **service-role key is never shipped to the client**, never prefixed `VITE_`,
  never committed. If server-side code needs it, it lives only in server-side
  environment settings.
- `src/config/env.ts` will reject any variable whose name suggests a service-role
  or secret key being exposed to the browser.

## 3. Authentication: magic link with a server-side allowlist

- Login is passwordless magic link (email OTP).
- Only two people may sign in. The **allowlist is enforced server-side** (a Supabase
  auth hook / database function that rejects sign-ups and sign-ins for addresses
  not on the list). The list lives in server-side configuration or a protected
  table — **never in this repository** and never in client code.
- Public sign-up is disabled. Sessions use short-lived access tokens with refresh;
  sign-out revokes the refresh token.

## 4. Hosting: security headers at the host

Set at the hosting layer (e.g. a headers config), not in client code:

- `Content-Security-Policy`: `default-src 'self'`; `script-src 'self'` (no
  `unsafe-inline`, no `unsafe-eval`); `style-src 'self'`; `img-src 'self' data:`;
  `connect-src 'self'` plus the project's database API origin only;
  `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`; `object-src 'none'`.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying camera, microphone, geolocation, etc.
- `Cross-Origin-Opener-Policy: same-origin`
- Preview deployments are protected so unreleased builds aren't public.

## 5. Calendar feed URL

- The future iCal feed is served from a URL containing a **long random token**
  (at least 128 bits from a CSPRNG, URL-safe encoded).
- Only a **hash** of the token is stored. The feed exposes recipe names and dates
  only — no ingredients, notes, or personal data.
- Tokens are **revocable and rotatable** from the app's settings; rotating
  immediately invalidates the old URL. Feed responses send `Cache-Control: private`
  and `X-Robots-Tag: noindex`.

## 6. Rate limiting

- Auth endpoints (magic-link request, OTP verify) are rate limited per IP and per
  email address, using the provider's built-in limits tightened to household scale.
- The calendar feed endpoint is rate limited per token and per IP.
- Failed attempts are logged without logging the email body or tokens.

## 7. Ongoing hygiene

- gitleaks runs in pre-commit and CI; Dependabot keeps npm and Actions current;
  `npm audit --omit=dev` runs in CI; Actions are pinned to commit SHAs with
  least-privilege `permissions`.
- If a secret is ever exposed: revoke and rotate first, then purge from history.
