import { z } from 'zod';
import { makeCatalog, validateAgainstCatalog } from '../../domain/catalog';
import {
  RecipeInputSchema,
  RecipeSchema,
  type CatalogIngredient,
  type Recipe,
  type RecipeInput,
} from '../../domain/schemas';
import type { RecipeRepository } from '../repositories';
import { Emitter, nextId } from './emitter';

const IdSchema = z.string().min(1).max(100);

export function createMemoryRecipeRepository(seed: Recipe[], catalogItems: CatalogIngredient[]): RecipeRepository {
  const catalog = makeCatalog(catalogItems);

  /** Schema check plus: every ingredient must exist in the catalog, in one of its units. */
  const parse = (input: unknown): RecipeInput => {
    const value = RecipeInputSchema.parse(input);
    const issues = validateAgainstCatalog(value.ingredients, catalog);
    if (issues.length > 0) {
      throw new z.ZodError(
        issues.map((i) => ({ code: 'custom', path: ['ingredients', i.index, i.field], message: i.message, input })),
      );
    }
    return value;
  };

  const store = new Map<string, Recipe>(seed.map((r) => [r.id, { ...parse(r), id: RecipeSchema.parse(r).id }]));
  const emitter = new Emitter();

  return {
    subscribe: emitter.subscribe,
    async list() {
      return [...store.values()].map((r) => structuredClone(r)).sort((a, b) => a.name.localeCompare(b.name));
    },
    async get(id) {
      const r = store.get(IdSchema.parse(id));
      return r ? structuredClone(r) : undefined;
    },
    async create(input: RecipeInput) {
      const recipe: Recipe = { ...parse(input), id: nextId('recipe') };
      store.set(recipe.id, recipe);
      emitter.emit();
      return structuredClone(recipe);
    },
    async update(id, input) {
      const key = IdSchema.parse(id);
      if (!store.has(key)) throw new Error('Recipe not found');
      const recipe: Recipe = { ...parse(input), id: key };
      store.set(key, recipe);
      emitter.emit();
      return structuredClone(recipe);
    },
    async remove(id) {
      store.delete(IdSchema.parse(id));
      emitter.emit();
    },
  };
}
