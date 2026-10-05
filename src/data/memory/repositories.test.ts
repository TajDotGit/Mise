import { testItems } from '../../test/factories';
import { createMemoryRepositories } from './index';

const repos = () => createMemoryRepositories({ catalog: testItems });
const rice = { name: 'Rice', servings: 2, ingredients: [{ ingredientId: 'rice', quantity: 1, unit: 'cup' as const }], steps: [], notes: '' };

describe('memory repositories', () => {
  it('validates recipe input at the boundary', async () => {
    const { recipes } = repos();
    await expect(recipes.create({ ...rice, name: '  ' })).rejects.toThrow();
    await expect(recipes.create({ ...rice, link: 'javascript:alert(1)' })).rejects.toThrow();
    await expect(recipes.create({ ...rice, cookMinutes: 0 })).rejects.toThrow();
  });

  it('rejects ingredients that are not in the catalog or use a unit it is not sold in', async () => {
    const { recipes } = repos();
    await expect(
      recipes.create({ ...rice, ingredients: [{ ingredientId: 'cheddr', quantity: 1, unit: 'cup' }] }),
    ).rejects.toThrow(/Pick an ingredient/);
    await expect(recipes.create({ ...rice, ingredients: [{ ingredientId: 'rice', quantity: 1, unit: 'lb' }] })).rejects.toThrow(
      /Use cup/,
    );
  });

  it('creates, updates, and notifies subscribers', async () => {
    const { recipes } = repos();
    let calls = 0;
    recipes.subscribe(() => (calls += 1));
    const r = await recipes.create({ ...rice, notes: '<b>hi</b>', steps: ['Rinse', 'Boil'], cookMinutes: 20, link: 'https://www.example.com/v/1' });
    await recipes.update(r.id, { ...r, name: 'Fried rice' });
    expect(await recipes.get(r.id)).toMatchObject({ name: 'Fried rice', steps: ['Rinse', 'Boil'], cookMinutes: 20 });
    expect(calls).toBe(2);
  });

  it('keeps one plan entry per date and rejects bad dates', async () => {
    const { plan } = repos();
    await plan.assign('2026-10-05', 'a');
    await plan.assign('2026-10-05', 'b');
    expect(await plan.listRange({ start: '2026-10-05', end: '2026-10-05' })).toMatchObject([{ recipeId: 'b' }]);
    await expect(plan.assign('10/05/2026', 'a')).rejects.toThrow();
  });

  it('returns copies so callers cannot mutate stored data', async () => {
    const { recipes } = repos();
    const r = await recipes.create(rice);
    r.name = 'Hacked';
    expect((await recipes.get(r.id))?.name).toBe('Rice');
  });

  it('renames the household with validation', async () => {
    const { household } = repos();
    expect((await household.rename('  Home  ')).name).toBe('Home');
    await expect(household.rename('   ')).rejects.toThrow();
  });
});
