import { eachDay, isWithin } from './dates';
import { daysLeft } from './leftovers';
import { lineKey } from './grocery';
import { roundQty } from './quantity';
import type { DateRange, IsoDate, Leftover, PlanEntry, Recipe } from './schemas';

/** Leftovers with this many days or fewer left are worth using up. */
export const EXPIRING_WINDOW_DAYS = 3;

export interface LeftoverUse {
  key: string;
  name: string;
  unit: string;
  quantity: number;
  useBy: IsoDate;
}

export interface RankedRecipe {
  recipe: Recipe;
  /** Sum over leftovers of used / max(needed, leftover): unit-agnostic, rewards an exact fit. */
  score: number;
  uses: LeftoverUse[];
  earliestUseBy: IsoDate;
}

export interface UseItUpProposal extends RankedRecipe {
  date: IsoDate;
}

/** Leftovers that are still good today and expire within the window. */
export function expiringLeftovers(
  leftovers: Leftover[],
  today: IsoDate,
  windowDays: number = EXPIRING_WINDOW_DAYS,
): Leftover[] {
  return leftovers.filter((l) => {
    const left = daysLeft(l.useBy, today);
    return left >= 0 && left <= windowDays && l.leftover > 0;
  });
}

/** Rank recipes by how much of the given leftovers they would consume. */
export function rankRecipes(
  leftovers: Leftover[],
  recipes: Recipe[],
  exclude: ReadonlySet<string> = new Set(),
): RankedRecipe[] {
  const ranked: RankedRecipe[] = [];
  for (const recipe of recipes) {
    if (exclude.has(recipe.id)) continue;
    const needs = new Map<string, number>();
    for (const ing of recipe.ingredients) {
      const key = lineKey(ing.ingredientId, ing.unit);
      needs.set(key, (needs.get(key) ?? 0) + ing.quantity);
    }
    let score = 0;
    const uses: LeftoverUse[] = [];
    for (const l of leftovers) {
      const need = needs.get(l.key);
      if (!need || l.leftover <= 0) continue;
      const quantity = roundQty(Math.min(need, l.leftover));
      // Full credit only when the leftover covers the recipe's need; a recipe that
      // needs more than is left forces a new pack (and a new leftover), so it scores less.
      score += quantity / Math.max(need, l.leftover);
      uses.push({ key: l.key, name: l.name, unit: l.unit, quantity, useBy: l.useBy });
    }
    if (uses.length === 0) continue;
    const earliestUseBy = uses.map((u) => u.useBy).sort()[0] ?? '';
    ranked.push({ recipe, score: roundQty(score), uses, earliestUseBy });
  }
  return ranked.sort(
    (a, b) =>
      b.score - a.score || a.earliestUseBy.localeCompare(b.earliestUseBy) || a.recipe.name.localeCompare(b.recipe.name),
  );
}

export interface ProposeInput {
  leftovers: Leftover[];
  recipes: Recipe[];
  plan: PlanEntry[];
  range: DateRange;
  today: IsoDate;
  windowDays?: number;
}

/**
 * Fill open (unplanned) days from today onward with the recipes that use up the
 * most expiring leftovers. Each day only counts leftovers still good on that day,
 * and what a proposal uses is subtracted before choosing the next day.
 */
export function proposeUseItUp({
  leftovers,
  recipes,
  plan,
  range,
  today,
  windowDays = EXPIRING_WINDOW_DAYS,
}: ProposeInput): UseItUpProposal[] {
  const inRange = plan.filter((e) => isWithin(e.date, range.start, range.end));
  const plannedDates = new Set(inRange.map((e) => e.date));
  const exclude = new Set(inRange.map((e) => e.recipeId));
  const remaining = new Map(expiringLeftovers(leftovers, today, windowDays).map((l) => [l.key, { ...l }]));

  const firstDay = today > range.start ? today : range.start;
  if (firstDay > range.end) return [];

  const proposals: UseItUpProposal[] = [];
  for (const date of eachDay(firstDay, range.end)) {
    if (plannedDates.has(date)) continue;
    const usable = [...remaining.values()].filter((l) => l.leftover > 0 && l.useBy >= date);
    if (usable.length === 0) continue;
    const best = rankRecipes(usable, recipes, exclude)[0];
    if (!best) continue;
    proposals.push({ ...best, date });
    exclude.add(best.recipe.id);
    for (const use of best.uses) {
      const l = remaining.get(use.key);
      if (l) l.leftover = roundQty(l.leftover - use.quantity);
    }
  }
  return proposals;
}
