import { CatalogIngredientSchema } from '../../domain/schemas';
import { ingredientCatalog } from './ingredientCatalog';

describe('seed catalog', () => {
  it('is valid, has unique ids, and covers every section', () => {
    const ids = new Set<string>();
    for (const item of ingredientCatalog) {
      expect(() => CatalogIngredientSchema.parse(item)).not.toThrow();
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
    }
    expect(ingredientCatalog.length).toBeGreaterThan(150);
    expect(new Set(ingredientCatalog.map((i) => i.section)).size).toBe(11);
  });

  it('only gives pack sizes to perishables (leftovers are only tracked for those)', () => {
    expect(ingredientCatalog.filter((i) => i.packSize !== undefined && !i.perishable)).toEqual([]);
  });
});
