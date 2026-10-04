import { addDays, daysBetween } from './dates';
import { aggregateIngredients } from './grocery';
import { roundQty } from './quantity';
import type { DateRange, IsoDate, Leftover, PlanEntry, Recipe } from './schemas';

/** Needed quantity rounded up to whole packs. No pack size means you buy exactly what you need. */
export function purchasedQuantity(needed: number, packSize?: number): number {
  if (!packSize || needed <= 0) return roundQty(Math.max(needed, 0));
  // Round first so 0.1 + 0.2 style noise can't push us into an extra pack.
  const packs = Math.ceil(roundQty(needed / packSize));
  return roundQty(packs * packSize);
}

/**
 * Leftovers implied by a plan: for each perishable line in the range, buy whole
 * packs on `purchaseDate` (default: range start), and whatever isn't planned is left over.
 * Sorted by use-by date, soonest first.
 */
export function inferLeftovers(
  plan: PlanEntry[],
  recipes: Recipe[],
  range: DateRange,
  purchaseDate: IsoDate = range.start,
): Leftover[] {
  return aggregateIngredients(plan, recipes, range)
    .filter((line) => line.perishable)
    .flatMap((line) => {
      const purchased = purchasedQuantity(line.quantity, line.packSize);
      const leftover = roundQty(purchased - line.quantity);
      if (leftover <= 0) return [];
      return [
        {
          key: line.key,
          name: line.name,
          unit: line.unit,
          needed: line.quantity,
          purchased,
          leftover,
          purchaseDate,
          useBy: addDays(purchaseDate, line.shelfLifeDays ?? 0),
          recipeNames: line.recipeNames,
        },
      ];
    })
    .sort((a, b) => a.useBy.localeCompare(b.useBy) || a.name.localeCompare(b.name));
}

export type Urgency = 'expired' | 'today' | 'soon' | 'later';

export const SOON_DAYS = 2;

export function daysLeft(useBy: IsoDate, today: IsoDate): number {
  return daysBetween(today, useBy);
}

export function urgency(useBy: IsoDate, today: IsoDate): Urgency {
  const left = daysLeft(useBy, today);
  if (left < 0) return 'expired';
  if (left === 0) return 'today';
  if (left <= SOON_DAYS) return 'soon';
  return 'later';
}
