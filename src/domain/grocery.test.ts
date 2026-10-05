import { entry, ing, recipe, testCatalog as catalog } from '../test/factories';
import { aggregateIngredients, buildGroceryList, groupBySection } from './grocery';

const week = { start: '2026-10-05', end: '2026-10-11' };

const spaghetti = recipe('r1', 'Spaghetti', [ing('ground-beef', 1, 'lb'), ing('spaghetti', 1, 'box'), ing('onion', 1, 'each')]);
const tacos = recipe('r2', 'Tacos', [ing('ground-beef', 0.75, 'lb'), ing('onion', 0.5, 'each'), ing('tortillas', 8, 'each')]);

describe('buildGroceryList', () => {
  it('returns an empty list for an empty plan', () => {
    expect(buildGroceryList([], [spaghetti], catalog, week)).toEqual([]);
  });

  it('merges the same catalog ingredient across recipes and names it from the catalog', () => {
    const list = buildGroceryList([entry('r1', '2026-10-05'), entry('r2', '2026-10-06')], [spaghetti, tacos], catalog, week);
    expect(list.find((i) => i.ingredientId === 'ground-beef')).toMatchObject({
      name: 'Ground beef',
      quantity: 1.75,
      unit: 'lb',
      section: 'meat & seafood',
      recipeNames: ['Spaghetti', 'Tacos'],
    });
    expect(list.find((i) => i.ingredientId === 'onion')?.quantity).toBe(1.5);
  });

  it('keeps the same ingredient in different units as separate lines', () => {
    const a = recipe('a', 'A', [ing('spinach', 2, 'cup')]);
    const b = recipe('b', 'B', [ing('spinach', 4, 'oz')]);
    const list = buildGroceryList([entry('a', '2026-10-05'), entry('b', '2026-10-06')], [a, b], catalog, week);
    expect(list.map((i) => `${i.quantity} ${i.unit}`).sort()).toEqual(['2 cup', '4 oz']);
  });

  it('counts a recipe planned twice in one week twice, but lists its name once', () => {
    const list = buildGroceryList([entry('r2', '2026-10-05'), entry('r2', '2026-10-09')], [tacos], catalog, week);
    expect(list.find((i) => i.ingredientId === 'tortillas')).toMatchObject({ quantity: 16, recipeNames: ['Tacos'] });
  });

  it('only includes plan entries inside the date range (inclusive)', () => {
    const plan = [entry('r1', '2026-10-04'), entry('r2', '2026-10-05'), entry('r2', '2026-10-11'), entry('r1', '2026-10-12')];
    const list = buildGroceryList(plan, [spaghetti, tacos], catalog, week);
    expect(list.find((i) => i.ingredientId === 'tortillas')?.quantity).toBe(16);
    expect(list.find((i) => i.ingredientId === 'spaghetti')).toBeUndefined();
  });

  it('ignores missing recipes and ingredients that are not in the catalog', () => {
    const odd = recipe('odd', 'Odd', [ing('not-in-catalog', 1, 'each'), ing('onion', 1, 'each')]);
    const list = buildGroceryList([entry('gone', '2026-10-05'), entry('odd', '2026-10-06')], [odd], catalog, week);
    expect(list.map((i) => i.ingredientId)).toEqual(['onion']);
  });

  it('avoids floating-point noise when summing', () => {
    const a = recipe('a', 'A', [ing('milk', 0.1, 'cup')]);
    const b = recipe('b', 'B', [ing('milk', 0.2, 'cup')]);
    const list = buildGroceryList([entry('a', '2026-10-05'), entry('b', '2026-10-06')], [a, b], catalog, week);
    expect(list[0]?.quantity).toBe(0.3);
  });

  it('marks items checked by key and groups them by section in aisle order', () => {
    const list = buildGroceryList([entry('r2', '2026-10-05')], [tacos], catalog, week, new Set(['tortillas|each']));
    expect(list.find((i) => i.ingredientId === 'tortillas')?.checked).toBe(true);
    expect(list.find((i) => i.ingredientId === 'onion')?.checked).toBe(false);
    expect(groupBySection(list).map((g) => g.section)).toEqual(['produce', 'meat & seafood', 'bakery']);
  });
});

describe('aggregateIngredients', () => {
  it('takes shelf life from the catalog and applies pack size only in the default unit', () => {
    const a = recipe('a', 'A', [ing('ground-beef', 0.5, 'lb'), ing('ground-beef', 4, 'oz')]);
    const lines = aggregateIngredients([entry('a', '2026-10-05')], [a], catalog, week);
    expect(lines.find((l) => l.unit === 'lb')).toMatchObject({ shelfLifeDays: 2, packSize: 1, perishable: true });
    expect(lines.find((l) => l.unit === 'oz')).toMatchObject({ shelfLifeDays: 2, perishable: true });
    expect(lines.find((l) => l.unit === 'oz')?.packSize).toBeUndefined();
  });
});
