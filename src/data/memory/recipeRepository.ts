import { z } from 'zod';
import { RecipeInputSchema, RecipeSchema, type Recipe, type RecipeInput } from '../../domain/schemas';
import type { RecipeRepository } from '../repositories';
import { Emitter, nextId } from './emitter';

const IdSchema = z.string().min(1).max(100);

export function createMemoryRecipeRepository(seed: Recipe[] = []): RecipeRepository {
  const store = new Map<string, Recipe>(seed.map((r) => [r.id, RecipeSchema.parse(r)]));
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
      const recipe: Recipe = { ...RecipeInputSchema.parse(input), id: nextId('recipe') };
      store.set(recipe.id, recipe);
      emitter.emit();
      return structuredClone(recipe);
    },
    async update(id, input) {
      const key = IdSchema.parse(id);
      if (!store.has(key)) throw new Error('Recipe not found');
      const recipe: Recipe = { ...RecipeInputSchema.parse(input), id: key };
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
