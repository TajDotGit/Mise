import { entry, ing, perishable, recipe } from '../test/factories';
import type { Leftover } from './schemas';
import { expiringLeftovers, proposeUseItUp, rankRecipes } from './suggestions';

const today = '2026-10-05';
const week = { start: '2026-10-05', end: '2026-10-11' };

function leftover(name: string, unit: string, amount: number, useBy: string): Leftover {
  return {
    key: `${name.toLowerCase()}|${unit}`,
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

const beef = leftover('Ground beef', 'lb', 0.5, '2026-10-07');
const cream = leftover('Cream', 'cup', 0.5, '2026-10-08');

const shepherdsPie = recipe('pie', "Shepherd's pie", [perishable('Ground beef', 1, 'lb', 2, 1), ing('Potatoes', 2, 'lb')]);
const pasta = recipe('pasta', 'Creamy pasta', [perishable('Cream', 0.25, 'cup', 5, 1)]);
const stroganoff = recipe('strog', 'Stroganoff', [
  perishable('ground beef', 0.5, 'lb', 2, 1),
  perishable('Cream', 0.5, 'cup', 5, 1),
]);
const salad = recipe('salad', 'Salad', [ing('Lettuce', 1, 'each')]);
const all = [shepherdsPie, pasta, stroganoff, salad];

describe('expiringLeftovers', () => {
  it('keeps leftovers still good today within the window and drops expired or far-off ones', () => {
    const expired = leftover('Fish', 'lb', 0.5, '2026-10-04');
    const later = leftover('Carrots', 'lb', 1, '2026-10-20');
    expect(expiringLeftovers([beef, expired, later, cream], today)).toEqual([beef, cream]);
  });
});

describe('rankRecipes', () => {
  it('ranks by fraction of expiring leftovers consumed and skips recipes that use none', () => {
    const ranked = rankRecipes([beef, cream], all);
    expect(ranked.map((r) => [r.recipe.name, r.score])).toEqual([
      ['Stroganoff', 2],
      ["Shepherd's pie", 1],
      ['Creamy pasta', 0.5],
    ]);
  });

  it('caps usage at what is left over', () => {
    const [pie] = rankRecipes([beef], [shepherdsPie]);
    expect(pie?.uses).toEqual([{ key: 'ground beef|lb', name: 'Ground beef', unit: 'lb', quantity: 0.5, useBy: '2026-10-07' }]);
  });

  it('does not match leftovers with a different unit', () => {
    const grams = recipe('g', 'Grams', [ing('Ground beef', 200, 'g')]);
    expect(rankRecipes([beef], [grams])).toEqual([]);
  });

  it('breaks ties by the most urgent leftover, then by name', () => {
    const usesBeef = recipe('x', 'Zed beef', [ing('Ground beef', 0.5, 'lb')]);
    const usesCream = recipe('y', 'Alpha cream', [ing('Cream', 0.5, 'cup')]);
    const usesBeefToo = recipe('z', 'Alpha beef', [ing('Ground beef', 0.5, 'lb')]);
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
    expect(proposals[0]?.uses.map((u) => u.name)).toEqual(['Cream']);
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
