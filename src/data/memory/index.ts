import type { CatalogIngredient, Household, PlanEntry, Recipe } from '../../domain/schemas';
import type { Repositories } from '../repositories';
import { ingredientCatalog } from '../seed/ingredientCatalog';
import { createMemoryCatalogRepository } from './catalogRepository';
import { createMemoryGroceryRepository } from './groceryRepository';
import { createMemoryHouseholdRepository } from './householdRepository';
import { createMemoryPlanRepository } from './planRepository';
import { createMemoryRecipeRepository } from './recipeRepository';

const DEFAULT_HOUSEHOLD: Household = { id: 'household', name: 'Our kitchen', members: [] };

export function createMemoryRepositories(
  seed: { recipes?: Recipe[]; plan?: PlanEntry[]; household?: Household; catalog?: CatalogIngredient[] } = {},
): Repositories {
  const catalog = seed.catalog ?? ingredientCatalog;
  return {
    catalog: createMemoryCatalogRepository(catalog),
    household: createMemoryHouseholdRepository(seed.household ?? DEFAULT_HOUSEHOLD),
    recipes: createMemoryRecipeRepository(seed.recipes ?? [], catalog),
    plan: createMemoryPlanRepository(seed.plan),
    grocery: createMemoryGroceryRepository(),
  };
}
