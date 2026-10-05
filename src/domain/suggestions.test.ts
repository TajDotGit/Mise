import { entry, ing, recipe } from '../test/factories';
import type { Leftover, Unit } from './schemas';
import { expiringLeftovers, proposeUseItUp, rankRecipes } from './suggestions';

const today = '2026-10-05';
const week = { start: '2026-10-05', end: '2026-10-11' };

function leftover(ingredientId: string, name: string, unit: Unit, amount: number, useBy: string): Leftover {
  return {
    key: `${ingredientId}|${unit}`,
    ingredientId,
    name,
    unit,
    needed: 1,
    purchased: 1 + amount,
    leftover: amount,
    purchaseDate: today,
    useBy,
    recipeNames: [],
  };
}

const beef = leftover('ground-beef', 'Ground beef', 'lb', 0.5, '2026-10-07');
const cream = leftover('cream', 'Heavy cream', 'cup', 0.5, '2026-10-08');

const shepherdsPie = recipe('pie', "Shepherd's pie", [ing('ground-beef', 1, 'lb'), ing('potato', 2, 'lb')]);
const pasta = recipe('pasta', 'Creamy pasta', [ing('cream', 0.25, 'cup')]);
const stroganoff = recipe('strog', 'Stroganoff', [
  ing('ground-beef', 0.5, 'lb'),
  ing('cream', 0.5, 'cup'),
]);
const salad = recipe('salad', 'Salad', [ing('lettuce', 1, 'head')]);
const all = [shepherdsPie, pasta, stroganoff, salad];

describe('expiringLeftovers', () => {
  it('keeps leftovers still good today within the window and drops expired or far-off ones', () => {
    const expired = leftover('cod', 'Cod', 'lb', 0.5, '2026-10-04');
    const later = leftover('carrot', 'Carrots', 'lb', 1, '2026-10-20');
    expect(expiringLeftovers([beef, expired, later, cream], today)).toEqual([beef, cream]);
  });
});

describe('rankRecipes', () => {
  it('ranks by fraction of expiring leftovers consumed and skips recipes that use none', () => {
    const ranked = rankRecipes([beef, cream], all);
    expect(ranked.map((r) => [r.recipe.name, r.score])).toEqual([
      ['Stroganoff', 2],
      // Needs 1 lb but only 0.5 lb is left: would force a new pack, so half credit.
      ["Shepherd's pie", 0.5],
      ['Creamy pasta', 0.5],
    ]);
  });

  it('prefers a recipe the leftover fully covers over one that needs more than is left', () => {
    const exact = recipe('exact', 'Exact', [ing('ground-beef', 0.5, 'lb')]);
    const greedy = recipe('greedy', 'Greedy', [ing('ground-beef', 2, 'lb')]);
    expect(rankRecipes([beef], [greedy, exact]).map((r) => [r.recipe.id, r.score])).toEqual([
      ['exact', 1],
      ['greedy', 0.25],
    ]);
  });

  it('caps usage at what is left over', () => {
    const [pie] = rankRecipes([beef], [shepherdsPie]);
    expect(pie?.uses).toEqual([{ key: 'ground-beef|lb', name: 'Ground beef', unit: 'lb', quantity: 0.5, useBy: '2026-10-07' }]);
  });

  it('does not match leftovers with a different unit', () => {
    const grams = recipe('g', 'Ounces', [ing('ground-beef', 8, 'oz')]);
    expect(rankRecipes([beef], [grams])).toEqual([]);
  });

  it('breaks ties by the most urgent leftover, then by name', () => {
    const usesBeef = recipe('x', 'Zed beef', [ing('ground-beef', 0.5, 'lb')]);
    const usesCream = recipe('y', 'Alpha cream', [ing('cream', 0.5, 'cup')]);
    const usesBeefToo = recipe('z', 'Alpha beef', [ing('ground-beef', 0.5, 'lb')]);
    expect(rankRecipes([beef, cream], [usesCream, usesBeef, usesBeefToo]).map((r) => r.recipe.name)).toEqual([
      'Alpha beef',
      'Zed beef',
      'Alpha cream',
    ]);
  });

  it('excludes the given recipe ids', () => {
    expect(rankRecipes([beef, cream], all, new Set(['strog'])).map((r) => r.recipe.id)).toEqual(['pie', 'pasta']);
  });
});

describe('proposeUseItUp', () => {
  it('fills open days with the best recipe, then re-scores with what is left', () => {
    const plan = [entry('salad', '2026-10-05')];
    const proposals = proposeUseItUp({ leftovers: [beef, cream], recipes: all, plan, range: week, today });
    // Stroganoff eats both leftovers on the first open day, so nothing remains for later days.
    expect(proposals.map((p) => [p.date, p.recipe.name])).toEqual([['2026-10-06', 'Stroganoff']]);
  });

  it('does not suggest recipes already planned in the range', () => {
    const plan = [entry('strog', '2026-10-05')];
    const proposals = proposeUseItUp({ leftovers: [beef, cream], recipes: all, plan, range: week, today });
    expect(proposals.map((p) => p.recipe.id)).not.toContain('strog');
    expect(proposals[0]).toMatchObject({ date: '2026-10-06', recipe: { id: 'pie' } });
    expect(proposals[1]).toMatchObject({ date: '2026-10-07', recipe: { id: 'pasta' } });
  });

  it('only counts leftovers still good on the proposed day', () => {
    // Every day up to the 8th is planned; beef (use by the 7th) can no longer be used.
    const plan = ['2026-10-05', '2026-10-06', '2026-10-07'].map((d) => entry('salad', d));
    const proposals = proposeUseItUp({ leftovers: [beef, cream], recipes: all, plan, range: week, today });
    expect(proposals[0]?.date).toBe('2026-10-08');
    expect(proposals[0]?.uses.map((u) => u.name)).toEqual(['Heavy cream']);
  });

  it('returns nothing when there are no open days', () => {
    const plan = ['05', '06', '07', '08', '09', '10', '11'].map((d) => entry('salad', `2026-10-${d}`));
    expect(proposeUseItUp({ leftovers: [beef, cream], recipes: all, plan, range: week, today })).toEqual([]);
  });

  it('returns nothing when there are no expiring leftovers', () => {
    expect(proposeUseItUp({ leftovers: [], recipes: all, plan: [], range: week, today })).toEqual([]);
  });

  it('never proposes days before today', () => {
    const proposals = proposeUseItUp({ leftovers: [beef], recipes: all, plan: [], range: week, today: '2026-10-07' });
    expect(proposals.every((p) => p.date >= '2026-10-07')).toBe(true);
  });
});
