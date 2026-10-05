import { ing } from '../../test/factories';
import { createMemoryRepositories } from './index';

describe('memory repositories', () => {
  it('validates recipe input at the boundary', async () => {
    const { recipes } = createMemoryRepositories();
    await expect(recipes.create({ name: '  ', servings: 2, ingredients: [ing('Rice', 1, 'cup')], notes: '' })).rejects.toThrow();
    await expect(
      recipes.create({ name: 'X', servings: 2, ingredients: [ing('Milk', 1, 'cup', { perishable: true })], notes: '' }),
    ).rejects.toThrow(/shelf life/);
  });

  it('creates, updates, and notifies subscribers', async () => {
    const { recipes } = createMemoryRepositories();
    let calls = 0;
    recipes.subscribe(() => (calls += 1));
    const r = await recipes.create({ name: 'Rice', servings: 2, ingredients: [ing('Rice', 1, 'cup')], notes: '<b>hi</b>' });
    await recipes.update(r.id, { ...r, name: 'Fried rice' });
    expect((await recipes.get(r.id))?.name).toBe('Fried rice');
    expect(calls).toBe(2);
  });

  it('keeps one plan entry per date and rejects bad dates', async () => {
    const { plan } = createMemoryRepositories();
    await plan.assign('2026-10-05', 'a');
    await plan.assign('2026-10-05', 'b');
    expect(await plan.listRange({ start: '2026-10-05', end: '2026-10-05' })).toMatchObject([{ recipeId: 'b' }]);
    await expect(plan.assign('10/05/2026', 'a')).rejects.toThrow();
  });

  it('returns copies so callers cannot mutate stored data', async () => {
    const { recipes } = createMemoryRepositories();
    const r = await recipes.create({ name: 'Rice', servings: 2, ingredients: [ing('Rice', 1, 'cup')], notes: '' });
    r.name = 'Hacked';
    expect((await recipes.get(r.id))?.name).toBe('Rice');
  });
});
