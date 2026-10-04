import type { Ingredient, PlanEntry, Recipe } from '../domain/schemas';

export function ing(name: string, quantity: number, unit: string, extra: Partial<Ingredient> = {}): Ingredient {
  return { name, quantity, unit, category: 'other', perishable: false, ...extra };
}

export function perishable(
  name: string,
  quantity: number,
  unit: string,
  shelfLifeDays: number,
  packSize?: number,
): Ingredient {
  return ing(name, quantity, unit, { perishable: true, shelfLifeDays, ...(packSize ? { packSize } : {}) });
}

export function recipe(id: string, name: string, ingredients: Ingredient[]): Recipe {
  return { id, name, servings: 2, ingredients, notes: '' };
}

let n = 0;
export function entry(recipeId: string, date: string): PlanEntry {
  n += 1;
  return { id: `e${n}`, recipeId, date };
}
