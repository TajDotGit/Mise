import { isWithin } from './dates';
import { itemKey, roundQty } from './quantity';
import { CATEGORIES, type Category, type DateRange, type GroceryItem, type PlanEntry, type Recipe } from './schemas';

/** One merged ingredient line across every planned recipe in a range. */
export interface AggregatedLine {
  key: string;
  name: string;
  unit: string;
  category: Category;
  quantity: number;
  recipeNames: string[];
  perishable: boolean;
  /** Shortest shelf life among the perishable sources. */
  shelfLifeDays?: number;
  /** Largest pack size among the sources. */
  packSize?: number;
}

/** Planned entries inside the range, in date order, with missing recipes dropped. */
export function plannedRecipes(plan: PlanEntry[], recipes: Recipe[], range: DateRange): Recipe[] {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  return plan
    .filter((e) => isWithin(e.date, range.start, range.end))
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((e) => {
      const recipe = byId.get(e.recipeId);
      return recipe ? [recipe] : [];
    });
}

/** Sum ingredient quantities across planned recipes, merging identical name + unit. */
export function aggregateIngredients(plan: PlanEntry[], recipes: Recipe[], range: DateRange): AggregatedLine[] {
  const lines = new Map<string, AggregatedLine>();
  for (const recipe of plannedRecipes(plan, recipes, range)) {
    for (const ing of recipe.ingredients) {
      const key = itemKey(ing.name, ing.unit);
      let line = lines.get(key);
      if (!line) {
        line = {
          key,
          name: ing.name.trim(),
          unit: ing.unit.trim(),
          category: ing.category,
          quantity: 0,
          recipeNames: [],
          perishable: false,
        };
        lines.set(key, line);
      }
      line.quantity = roundQty(line.quantity + ing.quantity);
      if (!line.recipeNames.includes(recipe.name)) line.recipeNames.push(recipe.name);
      if (ing.perishable) {
        line.perishable = true;
        if (ing.shelfLifeDays !== undefined) {
          line.shelfLifeDays = Math.min(line.shelfLifeDays ?? Infinity, ing.shelfLifeDays);
        }
      }
      if (ing.packSize !== undefined) line.packSize = Math.max(line.packSize ?? 0, ing.packSize);
    }
  }
  return [...lines.values()];
}

const categoryRank = (c: Category) => CATEGORIES.indexOf(c);

/** The grocery list for a range, sorted by aisle then name. */
export function buildGroceryList(
  plan: PlanEntry[],
  recipes: Recipe[],
  range: DateRange,
  checkedKeys: ReadonlySet<string> = new Set(),
): GroceryItem[] {
  return aggregateIngredients(plan, recipes, range)
    .map(({ key, name, unit, category, quantity, recipeNames }) => ({
      key,
      name,
      unit,
      category,
      quantity,
      recipeNames,
      checked: checkedKeys.has(key),
    }))
    .sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || a.name.localeCompare(b.name));
}

/** Group a sorted grocery list by category, keeping aisle order. */
export function groupByCategory(items: GroceryItem[]): { category: Category; items: GroceryItem[] }[] {
  return CATEGORIES.map((category) => ({ category, items: items.filter((i) => i.category === category) })).filter(
    (g) => g.items.length > 0,
  );
}
