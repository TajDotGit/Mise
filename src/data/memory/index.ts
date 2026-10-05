import type { PlanEntry, Recipe } from '../../domain/schemas';
import type { Repositories } from '../repositories';
import { createMemoryGroceryRepository } from './groceryRepository';
import { createMemoryPlanRepository } from './planRepository';
import { createMemoryRecipeRepository } from './recipeRepository';

export function createMemoryRepositories(seed: { recipes?: Recipe[]; plan?: PlanEntry[] } = {}): Repositories {
  return {
    recipes: createMemoryRecipeRepository(seed.recipes),
    plan: createMemoryPlanRepository(seed.plan),
    grocery: createMemoryGroceryRepository(),
  };
}
