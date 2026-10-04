# Mise — Spec (Phase 0)

## Data model

**Recipe** — `id`, `name`, `servings`, `ingredients[]`, `notes`.

**Ingredient** (inside a recipe)
- `name`, `quantity`, `unit` (free text such as `lb`, `g`, `cup`, `each`)
- `category` — grocery aisle group: produce, meat & fish, dairy & eggs, bakery,
  pantry, frozen, other
- `perishable` — true for things that spoil
- `shelfLifeDays` — perishables only: how many days the item keeps after purchase
- `packSize` — optional: the amount it is sold in, in the same unit
  (ground beef comes in 1 lb packs, cream in 1 cup cartons)

**PlanEntry** — `id`, `recipeId`, `date` (`YYYY-MM-DD`). One dinner per date.

**GroceryItem** (derived, never typed in) — `name`, `quantity` (total needed),
`unit`, `category`, `recipeNames` (which recipes use it), `checked`.

**Leftover** (derived, never typed in) — `name`, `unit`, `needed`, `purchased`,
`leftover`, `purchaseDate`, `useBy`, `recipeNames`.

## Grocery list rules

1. Take every plan entry inside the chosen date range.
2. Add up the ingredients of each planned recipe. A recipe planned twice counts twice.
3. Lines merge when the name matches (ignoring case and extra spaces) **and** the
   unit matches. `2 cup spinach` and `100 g spinach` stay as two lines — Mise does
   not convert units.
4. Each line shows which recipes it came from ("from: Spaghetti, Tacos").
5. Checking a line off is remembered; nothing else about the list is stored.

## Leftover rules

1. Only perishable ingredients can become leftovers.
2. **Needed** = the merged quantity from the grocery list for the range.
3. **Purchased** = needed rounded **up** to whole packs. With 1 lb packs, needing
   1.75 lb means buying 2 lb. With no pack size, you buy exactly what you need.
4. **Leftover** = purchased − needed. If that is zero (needs fit exactly in whole
   packs), there is no leftover.
5. **Purchase date** = the first day of the range (the shopping day).
6. **Use-by** = purchase date + shelf life in days. If merged recipes give
   different shelf lives, the shortest wins.
7. **Urgency**, measured from today: *expired* (use-by has passed), *today*,
   *soon* (1–2 days left), *later* (3+ days).

## "Use it up" suggestions

1. Look at leftovers that are not expired and expire within the next 3 days.
2. For every recipe not already planned in the range, work out how much of each
   expiring leftover it would use (matching name and unit), capped at what is left.
3. Score = sum of the *fraction* of each leftover it uses (so units never need
   to be compared). Ties go to the recipe that uses the most urgent leftover, then
   alphabetical.
4. Proposals: walk the open (unplanned) days from today forward. For each day,
   pick the best-scoring remaining recipe that only counts leftovers still good
   on that day, then subtract what it uses and re-score for the next day.
5. Adding a suggestion to the plan recalculates everything, so the leftover
   shrinks or disappears.
