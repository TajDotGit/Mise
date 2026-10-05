import { makeCatalog } from '../domain/catalog';
import type { CatalogIngredient, PlanEntry, Recipe, RecipeIngredient, Section, Unit } from '../domain/schemas';

export function item(
  id: string,
  name: string,
  units: Unit[],
  extra: Partial<Omit<CatalogIngredient, 'id' | 'name' | 'units'>> = {},
): CatalogIngredient {
  return {
    id,
    name,
    units,
    section: 'dry goods' as Section,
    subsection: 'Test',
    perishable: false,
    aliases: [],
    ...extra,
  };
}

/** A small catalog for domain tests. */
export const testItems: CatalogIngredient[] = [
  item('ground-beef', 'Ground beef', ['lb', 'oz'], { section: 'meat & seafood', perishable: true, shelfLifeDays: 2, packSize: 1 }),
  item('chicken', 'Chicken breast', ['lb'], { section: 'meat & seafood', perishable: true, shelfLifeDays: 2, packSize: 1.5 }),
  item('cream', 'Heavy cream', ['cup'], { section: 'dairy & eggs', perishable: true, shelfLifeDays: 7, packSize: 1 }),
  item('cilantro', 'Cilantro', ['bunch'], { section: 'produce', perishable: true, shelfLifeDays: 2, packSize: 1, aliases: ['coriander'] }),
  item('spinach', 'Baby spinach', ['cup', 'oz'], { section: 'produce', perishable: true, shelfLifeDays: 3, packSize: 5 }),
  item('basil', 'Basil', ['bunch'], { section: 'produce', perishable: true, shelfLifeDays: 3 }),
  item('cheddar', 'Cheddar', ['cup'], { section: 'dairy & eggs', perishable: true, shelfLifeDays: 21, packSize: 2 }),
  item('onion', 'Onion', ['each'], { section: 'produce' }),
  item('tortillas', 'Flour tortillas', ['each'], { section: 'bakery' }),
  item('spaghetti', 'Spaghetti', ['box']),
  item('rice', 'White rice', ['cup'], { packSize: 10 }),
  item('milk', 'Milk', ['cup']),
  item('potato', 'Potatoes', ['lb']),
  item('lettuce', 'Romaine lettuce', ['head'], { section: 'produce' }),
];
export const testCatalog = makeCatalog(testItems);

export function ing(ingredientId: string, quantity: number, unit: Unit): RecipeIngredient {
  return { ingredientId, quantity, unit };
}

export function recipe(id: string, name: string, ingredients: RecipeIngredient[]): Recipe {
  return { id, name, servings: 2, ingredients, steps: [], notes: '' };
}

let n = 0;
export function entry(recipeId: string, date: string): PlanEntry {
  n += 1;
  return { id: `e${n}`, recipeId, date };
}
