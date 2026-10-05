import { ingredientCatalog } from '../data/seed/ingredientCatalog';
import { makeCatalog, validateAgainstCatalog } from '../domain/catalog';
import { addDays } from '../domain/dates';
import { inferLeftovers, urgency } from '../domain/leftovers';
import { RecipeSchema } from '../domain/schemas';
import { proposeUseItUp } from '../domain/suggestions';
import { buildMockPlan } from './plan';
import { mockRecipes } from './recipes';

const today = '2026-10-05';
const range = { start: today, end: addDays(today, 6) };
const catalog = makeCatalog(ingredientCatalog);

describe('mock data', () => {
  it('has about 12 valid recipes', () => {
    expect(mockRecipes.length).toBeGreaterThanOrEqual(12);
    for (const r of mockRecipes) {
      expect(() => RecipeSchema.parse(r)).not.toThrow();
      expect(validateAgainstCatalog(r.ingredients, catalog)).toEqual([]);
    }
  });

  it('produces at least two leftovers nearing expiry and a use-it-up proposal', () => {
    const plan = buildMockPlan(today);
    const leftovers = inferLeftovers(plan, mockRecipes, catalog, range);
    const near = leftovers.filter((l) => ['today', 'soon'].includes(urgency(l.useBy, today)));
    expect(near.length).toBeGreaterThanOrEqual(2);
    expect(proposeUseItUp({ leftovers, recipes: mockRecipes, plan, range, today }).length).toBeGreaterThan(0);
  });
});
