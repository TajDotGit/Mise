# Mise — Spec (Phase 0)

## Data model

**CatalogIngredient** (pre-loaded, read-only for now) — the single source of truth
for an ingredient:
- `id` (a stable slug such as `ground-beef`), `name`, `aliases` (extra search words)
- `section` — store aisle: produce, meat & seafood, dairy & eggs, bakery, beans &
  legumes, dry goods, canned & jarred, condiments & sauces, oils & vinegars,
  spices & seasonings, frozen
- `subsection` — grouping inside the picker (for example *Leafy greens*, *Fresh herbs*)
- `units` — the only units it can be measured in; the first is the default
- `perishable`, `shelfLifeDays` — how many days it keeps after purchase
- `packSize` — how much is sold at once, in the default unit (perishables only)

**Recipe** — `id`, `name`, `servings`, `cookMinutes` (optional estimate),
`link` (optional http/https video or recipe page), `ingredients[]`, `steps[]`
(short numbered reminders), `notes`.

**RecipeIngredient** — `ingredientId`, `quantity`, `unit` (must be one of that
ingredient's units). Name, aisle, and keeping time always come from the catalog.

**PlanEntry** — `id`, `recipeId`, `date` (`YYYY-MM-DD`). One dinner per date.

**Household** — `id`, `name`, `members[]` (`displayName`, `role`). Phase 0 shows a
fictional household; real membership arrives with accounts.

**GroceryItem** (derived, never typed in) — `ingredientId`, `name`, `quantity`
(total needed), `unit`, `section`, `recipeNames`, `checked`.

**Leftover** (derived, never typed in) — `ingredientId`, `name`, `unit`, `needed`,
`purchased`, `leftover`, `purchaseDate`, `useBy`, `recipeNames`.

## Picking ingredients

Ingredients are chosen from the catalog, never typed freely, so "Cheddar",
"cheddar", and "cheddr" can never become three different things. The picker has a
search box (ignores case, matches aliases like *coriander → Cilantro*, and forgives
one typo in 4–6 letter words, two in longer ones), section filter chips, and a list
grouped by section and subsection. Picking an ingredient fills in its default unit.

## Grocery list rules

1. Take every plan entry inside the chosen date range.
2. Add up the ingredients of each planned recipe. A recipe planned twice counts twice.
3. Lines merge when the **catalog ingredient and unit** match. `2 cup spinach` and
   `4 oz spinach` stay as two lines — Mise does not convert units.
4. Lines are grouped by store section in aisle order.
5. Each line shows which recipes it came from ("from: Spaghetti, Tacos").
6. Checking a line off is remembered; nothing else about the list is stored.

## Leftover rules

1. Only perishable ingredients can become leftovers.
2. **Needed** = the merged quantity from the grocery list for the range.
3. **Purchased** = needed rounded **up** to whole packs. With 1 lb packs, needing
   1.75 lb means buying 2 lb. With no pack size, or when the recipe uses a unit
   other than the one packs are sold in, you buy exactly what you need.
4. **Leftover** = purchased − needed. If that is zero (needs fit exactly in whole
   packs), there is no leftover.
5. **Purchase date** = the first day of the range (the shopping day).
6. **Use-by** = purchase date + the catalog's shelf life in days.
7. **Urgency**, measured from today: *expired* (use-by has passed), *today*,
   *soon* (1–2 days left), *later* (3+ days).

## "Use it up" suggestions

1. Look at leftovers that are not expired and expire within the next 3 days.
2. For every recipe not already planned in the range, work out how much of each
   expiring leftover it would use (matching name and unit), capped at what is left.
3. Score = for each expiring leftover it uses, *amount used ÷ the larger of (what the
   recipe needs, what is left)*, summed. Units never need comparing, and a recipe that
   needs more than is left (forcing another pack, and a new leftover) scores lower.
   Ties go to the recipe that uses the most urgent leftover, then
   alphabetical.
4. Proposals: walk the open (unplanned) days from today forward. For each day,
   pick the best-scoring remaining recipe that only counts leftovers still good
   on that day, then subtract what it uses and re-score for the next day.
5. Adding a suggestion to the plan recalculates everything, so the leftover
   shrinks or disappears.
