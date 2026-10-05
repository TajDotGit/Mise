import { CatalogIngredientSchema, type CatalogIngredient } from '../../domain/schemas';
import type { CatalogRepository } from '../repositories';

export function createMemoryCatalogRepository(seed: CatalogIngredient[]): CatalogRepository {
  const items = seed.map((i) => CatalogIngredientSchema.parse(i));
  const ids = new Set<string>();
  for (const i of items) {
    if (ids.has(i.id)) throw new Error(`Duplicate catalog id: ${i.id}`);
    ids.add(i.id);
  }
  return {
    async list() {
      return items.map((i) => structuredClone(i));
    },
  };
}
