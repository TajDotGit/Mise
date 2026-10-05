# Decisions log

Choices made where the brief was open. Newest at the bottom.

| # | Decision | Why |
|---|----------|-----|
| 1 | ~~Added `category` and optional `packSize` to Ingredient.~~ Superseded by #17. | |
| 2 | One dinner per day in the plan. | Matches "seven days, each with an assigned recipe or an empty slot". |
| 3 | The week view is a **rolling 7 days starting today**, with arrows to move by a week. | A Monday-start week shows mostly past days late in the week, which makes planning and "use it up" proposals awkward. |
| 4 | Purchase date = first day of the grocery range (the shopping day). | Simplest rule that matches one weekly shop. |
| 5 | Lines merge only when catalog ingredient **and** unit match. No unit conversion. | Conversion (g ↔ lb, cups ↔ ml) is error-prone; separate lines are honest. |
| 6 | ~~Shortest shelf life / largest pack wins when merging.~~ Obsolete: the catalog gives one value per ingredient. | |
| 7 | Urgency: expired (< 0 days), today (0), soon (1–2), later (3+). "Use it up" looks at leftovers with ≤ 3 days left. | Gives a clear red / amber / green split. |
| 8 | Suggestion score = sum over expiring leftovers of used ÷ max(recipe need, leftover), so a recipe the leftover fully covers beats one that forces buying another pack. Recipes already planned in the range are not suggested. | Unit-agnostic, and avoids "eat tacos twice". |
| 9 | Repositories are async (Promise-based) and expose `subscribe()` for change notification. | Matches the shape a Supabase implementation (with realtime) will have. |
| 10 | Grocery checked state is keyed by catalog ingredient id + unit. | Items are derived, so the key must be stable across recomputation. |
| 11 | Mock plan dates are generated relative to today. | So the demo always shows leftovers nearing expiry. |
| 12 | In-memory data resets on page reload. | Phase 0 has no persistence by design. |
| 13 | TypeScript pinned to 6.0.x, not 7.x. | typescript-eslint currently supports TypeScript < 6.1. |
| 14 | Deleting a recipe also clears its plan entries; domain functions ignore plan entries whose recipe is missing. | Keeps the plan consistent. |
| 15 | jsdom 30 / vitest 5 do not support Node 25 (odd, non-LTS). `.nvmrc` pins Node 24 LTS; `engine-strict` is off so installs on 25 only warn. | Use `nvm use` for a supported runtime. |
| 16 | `.npmrc` sets `ignore-scripts=true`; run `npm run prepare` once to install git hooks. | No dependency install scripts run (only fsevents declares one; it is optional). |
| 17 | Recipes store only `{ingredientId, quantity, unit}`; everything else about an ingredient lives in a pre-loaded catalog (~200 items). | One spelling per ingredient, so merging and leftovers can't be split by typos. Custom ingredients are on the backlog. |
| 18 | One taxonomy: catalog `section` is both the picker's top level and the grocery aisle. `subsection` is picker-only. | Avoids two category lists drifting apart. |
| 19 | Each catalog ingredient has a short list of allowed units; the first is the default and the unit packs are sold in. Lines in other units are bought exactly (no leftover). | Autofill a sensible unit while still allowing "2 clove garlic" vs "1 head". |
| 20 | Search typo tolerance: 0 typos under 4 letters, 1 for 4–6, 2 for 7+ (edit distance), plus aliases. | Catches "cheddr"/"chiken" without matching random short strings. |
| 21 | The catalog sits behind `CatalogRepository` (seeded from `src/data/seed`). | Later it becomes a database table without UI changes. |
| 22 | Recipe `cookMinutes` and `link` are optional; `steps` may be empty. Links must be http(s) with a real domain, and are rendered with `rel="noopener noreferrer nofollow"`. | Not every recipe has a video or a known time. Blocks `javascript:` / `data:` links. |
| 23 | Theme (System / Light / Dark) is a per-device preference in `localStorage`, applied before first paint by `public/theme-init.js` (an external file, so a strict CSP still works). The switch lives on the Account tab. | Two phones may want different themes; no household data involved. |
| 24 | A fifth "Account" tab shows profile, appearance, household members, sync, data, and account rows. Features that don't exist yet are visible but disabled with a "Coming soon" badge. Export to JSON works today (local download only). | Lays out where future features go without pretending they work. |
