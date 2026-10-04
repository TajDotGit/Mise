# Decisions log

Choices made where the brief was open. Newest at the bottom.

| # | Decision | Why |
|---|----------|-----|
| 1 | Added `category` and optional `packSize` to Ingredient. | Grocery grouping needs a category; leftover rounding needs a pack size. Without `packSize` you buy exactly what you need (no leftover). |
| 2 | One dinner per day in the plan. | Matches "seven days, each with an assigned recipe or an empty slot". |
| 3 | The week view is a **rolling 7 days starting today**, with arrows to move by a week. | A Monday-start week shows mostly past days late in the week, which makes planning and "use it up" proposals awkward. |
| 4 | Purchase date = first day of the grocery range (the shopping day). | Simplest rule that matches one weekly shop. |
| 5 | Ingredient lines merge only when the normalized name (trim, lowercase, collapse spaces) **and** unit match. No unit conversion. | Conversion (g ↔ lb, cups ↔ ml) is error-prone; separate lines are honest. |
| 6 | When merged lines disagree, shortest `shelfLifeDays` wins, and the largest `packSize` wins. | Safer to warn early; packs are usually the same anyway. |
| 7 | Urgency: expired (< 0 days), today (0), soon (1–2), later (3+). "Use it up" looks at leftovers with ≤ 3 days left. | Gives a clear red / amber / green split. |
| 8 | Suggestion score = sum of the fraction of each expiring leftover a recipe consumes. Recipes already planned in the range are not suggested. | Unit-agnostic, and avoids "eat tacos twice". |
| 9 | Repositories are async (Promise-based) and expose `subscribe()` for change notification. | Matches the shape a Supabase implementation (with realtime) will have. |
| 10 | Grocery checked state is keyed by normalized name + unit. | Items are derived, so the key must be stable across recomputation. |
| 11 | Mock plan dates are generated relative to today. | So the demo always shows leftovers nearing expiry. |
| 12 | In-memory data resets on page reload. | Phase 0 has no persistence by design. |
| 13 | TypeScript pinned to 6.0.x, not 7.x. | typescript-eslint currently supports TypeScript < 6.1. |
| 14 | Deleting a recipe also clears its plan entries; domain functions ignore plan entries whose recipe is missing. | Keeps the plan consistent. |
