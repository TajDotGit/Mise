import { entry, ing, perishable, recipe } from '../test/factories';
import { aggregateIngredients, buildGroceryList, groupByCategory } from './grocery';

const week = { start: '2026-10-05', end: '2026-10-11' };

const spaghetti = recipe('r1', 'Spaghetti', [
  perishable('Ground beef', 1, 'lb', 2, 1),
  ing('Spaghetti', 1, 'box', { category: 'pantry' }),
  ing('Onion', 1, 'each', { category: 'produce' }),
]);
const tacos = recipe('r2', 'Tacos', [
  perishable('ground  BEEF ', 0.75, 'lb', 3, 1),
  ing('Onion', 0.5, 'each', { category: 'produce' }),
  ing('Tortillas', 8, 'each', { category: 'bakery' }),
]);

describe('buildGroceryList', () => {
  it('returns an empty list for an empty plan', () => {
    expect(buildGroceryList([], [spaghetti], week)).toEqual([]);
  });

  it('merges identical ingredient names and units across recipes, ignoring case and spacing', () => {
    const list = buildGroceryList([entry('r1', '2026-10-05'), entry('r2', '2026-10-06')], [spaghetti, tacos], week);
    const beef = list.find((i) => i.name === 'Ground beef');
    expect(beef).toMatchObject({ quantity: 1.75, unit: 'lb', recipeNames: ['Spaghetti', 'Tacos'] });
    expect(list.filter((i) => i.name.toLowerCase().includes('beef'))).toHaveLength(1);
    expect(list.find((i) => i.name === 'Onion')?.quantity).toBe(1.5);
  });

  it('keeps unit mismatches as separate lines', () => {
    const a = recipe('a', 'A', [ing('Spinach', 2, 'cup')]);
    const b = recipe('b', 'B', [ing('Spinach', 100, 'g')]);
    const list = buildGroceryList([entry('a', '2026-10-05'), entry('b', '2026-10-06')], [a, b], week);
    expect(list.map((i) => `${i.quantity} ${i.unit}`).sort()).toEqual(['100 g', '2 cup']);
  });

  it('counts a recipe planned twice in one week twice, but lists its name once', () => {
    const list = buildGroceryList([entry('r2', '2026-10-05'), entry('r2', '2026-10-09')], [tacos], week);
    expect(list.find((i) => i.name === 'Tortillas')).toMatchObject({ quantity: 16, recipeNames: ['Tacos'] });
  });

  it('only includes plan entries inside the date range (inclusive)', () => {
    const plan = [entry('r1', '2026-10-04'), entry('r2', '2026-10-05'), entry('r2', '2026-10-11'), entry('r1', '2026-10-12')];
    const list = buildGroceryList(plan, [spaghetti, tacos], week);
    expect(list.find((i) => i.name === 'Tortillas')?.quantity).toBe(16);
    expect(list.find((i) => i.name === 'Spaghetti')).toBeUndefined();
  });

  it('ignores plan entries whose recipe no longer exists', () => {
    expect(buildGroceryList([entry('gone', '2026-10-05')], [spaghetti], week)).toEqual([]);
  });

  it('avoids floating-point noise when summing', () => {
    const a = recipe('a', 'A', [ing('Milk', 0.1, 'cup')]);
    const b = recipe('b', 'B', [ing('Milk', 0.2, 'cup')]);
    const list = buildGroceryList([entry('a', '2026-10-05'), entry('b', '2026-10-06')], [a, b], week);
    expect(list[0]?.quantity).toBe(0.3);
  });

  it('marks items checked by key and groups them by category in aisle order', () => {
    const list = buildGroceryList([entry('r2', '2026-10-05')], [tacos], week, new Set(['tortillas|each']));
    expect(list.find((i) => i.name === 'Tortillas')?.checked).toBe(true);
    expect(list.find((i) => i.name === 'Onion')?.checked).toBe(false);
    expect(groupByCategory(list).map((g) => g.category)).toEqual(['produce', 'bakery', 'other']);
  });
});

describe('aggregateIngredients', () => {
  it('uses the shortest shelf life and the largest pack size when merging', () => {
    const a = recipe('a', 'A', [perishable('Cream', 0.5, 'cup', 7, 1)]);
    const b = recipe('b', 'B', [perishable('Cream', 0.25, 'cup', 4, 2)]);
    const [line] = aggregateIngredients([entry('a', '2026-10-05'), entry('b', '2026-10-06')], [a, b], week);
    expect(line).toMatchObject({ quantity: 0.75, shelfLifeDays: 4, packSize: 2, perishable: true });
  });
});
