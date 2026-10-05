import { addDays } from '../domain/dates';
import type { IsoDate, PlanEntry } from '../domain/schemas';

/**
 * A week plan starting `today`, chosen so the shop leaves leftovers:
 * ground beef, chicken, and cilantro expire in 2 days and spinach in 3,
 * with open days for "use it up" suggestions.
 */
export function buildMockPlan(today: IsoDate): PlanEntry[] {
  const days: [number, string][] = [
    [0, 'tacos'],
    [1, 'stir-fry'],
    // day 2 open
    [3, 'curry'],
    [4, 'fish-chips'],
    // day 5 open
    [6, 'breakfast-dinner'],
  ];
  return days.map(([offset, recipeId]) => ({ id: `mock-${offset}`, recipeId, date: addDays(today, offset) }));
}
