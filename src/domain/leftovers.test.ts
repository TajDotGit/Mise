import { entry, ing, recipe, testCatalog as catalog } from '../test/factories';
import { inferLeftovers, purchasedQuantity, urgency } from './leftovers';

const week = { start: '2026-10-05', end: '2026-10-11' };

describe('purchasedQuantity', () => {
  it('rounds up to whole packs', () => {
    expect(purchasedQuantity(1.75, 1)).toBe(2);
    expect(purchasedQuantity(0.1, 0.5)).toBe(0.5);
  });
  it('buys exactly what is needed when there is no pack size', () => {
    expect(purchasedQuantity(1.75)).toBe(1.75);
  });
  it('does not buy an extra pack because of floating-point noise', () => {
    expect(purchasedQuantity(0.1 + 0.2, 0.3)).toBe(0.3);
  });
  it('buys nothing for zero need', () => {
    expect(purchasedQuantity(0, 1)).toBe(0);
  });
});

describe('inferLeftovers', () => {
  const tacos = recipe('t', 'Tacos', [ing('ground-beef', 0.75, 'lb'), ing('tortillas', 8, 'each')]);
  const chili = recipe('c', 'Chili', [ing('ground-beef', 1, 'lb')]);

  it('computes leftover = purchased - planned, and use-by = purchase date + shelf life', () => {
    expect(inferLeftovers([entry('t', '2026-10-06')], [tacos], catalog, week)).toEqual([
      {
        key: 'ground-beef|lb',
        ingredientId: 'ground-beef',
        name: 'Ground beef',
        unit: 'lb',
        needed: 0.75,
        purchased: 1,
        leftover: 0.25,
        purchaseDate: '2026-10-05',
        useBy: '2026-10-07',
        recipeNames: ['Tacos'],
      },
    ]);
  });

  it('returns no leftover when the need fills whole packs exactly', () => {
    expect(inferLeftovers([entry('c', '2026-10-06')], [chili], catalog, week)).toEqual([]);
  });

  it('combines a recipe planned twice before rounding to packs', () => {
    // 0.75 + 0.75 = 1.5 lb -> buy 2 lb -> 0.5 lb left (not 0.25 + 0.25 from two separate packs).
    const leftovers = inferLeftovers([entry('t', '2026-10-05'), entry('t', '2026-10-08')], [tacos], catalog, week);
    expect(leftovers).toHaveLength(1);
    expect(leftovers[0]).toMatchObject({ needed: 1.5, purchased: 2, leftover: 0.5 });
  });

  it('only rounds to packs in the default unit; other units are bought exactly', () => {
    const a = recipe('a', 'A', [ing('spinach', 3, 'cup')]);
    const b = recipe('b', 'B', [ing('spinach', 4, 'oz')]);
    const leftovers = inferLeftovers([entry('a', '2026-10-05'), entry('b', '2026-10-06')], [a, b], catalog, week);
    expect(leftovers.map((l) => `${l.leftover} ${l.unit}`)).toEqual(['2 cup']);
  });

  it('ignores non-perishables even when packs would leave some over', () => {
    const r = recipe('r', 'R', [ing('rice', 1, 'cup')]);
    expect(inferLeftovers([entry('r', '2026-10-05')], [r], catalog, week)).toEqual([]);
  });

  it('gives no leftover for a perishable with no pack size', () => {
    const r = recipe('r', 'R', [ing('basil', 0.5, 'bunch')]);
    expect(inferLeftovers([entry('r', '2026-10-05')], [r], catalog, week)).toEqual([]);
  });

  it('uses an explicit purchase date and sorts by use-by', () => {
    const r = recipe('r', 'R', [ing('cream', 0.5, 'cup'), ing('cilantro', 0.5, 'bunch')]);
    const leftovers = inferLeftovers([entry('r', '2026-10-07')], [r], catalog, week, '2026-10-06');
    expect(leftovers.map((l) => [l.name, l.useBy])).toEqual([
      ['Cilantro', '2026-10-08'],
      ['Heavy cream', '2026-10-13'],
    ]);
  });

  it('returns nothing for an empty plan', () => {
    expect(inferLeftovers([], [tacos], catalog, week)).toEqual([]);
  });
});

describe('urgency', () => {
  it.each([
    ['2026-10-04', 'expired'],
    ['2026-10-05', 'today'],
    ['2026-10-06', 'soon'],
    ['2026-10-07', 'soon'],
    ['2026-10-08', 'later'],
  ] as const)('use-by %s is %s on 2026-10-05', (useBy, expected) => {
    expect(urgency(useBy, '2026-10-05')).toBe(expected);
  });
});
