import { packSizeFor } from './catalog';
import { isWithin } from './dates';
import { roundQty } from './quantity';
import {
  SECTIONS,
  type DateRange,
  type GroceryItem,
  type IngredientCatalog,
  type PlanEntry,
  type Recipe,
  type Section,
  type Unit,
} from './schemas';

/** One merged ingredient line across every planned recipe in a range. */
export interface AggregatedLine {
  key: string;
  ingredientId: string;
  name: string;
  unit: Unit;
  section: Section;
  quantity: number;
  recipeNames: string[];
  perishable: boolean;
  shelfLifeDays?: number;
  /** Only set when the line is measured in the unit packs are sold in. */
  packSize?: number;
}

export function lineKey(ingredientId: string, unit: string): string {
  return `${ingredientId}|${unit}`;
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

/**
 * Sum ingredient quantities across planned recipes, merging lines with the same
 * catalog ingredient and unit. Names, aisles, and shelf life come from the catalog,
 * so spelling can never split one ingredient into two lines.
 */
export function aggregateIngredients(
  plan: PlanEntry[],
  recipes: Recipe[],
  catalog: IngredientCatalog,
  range: DateRange,
): AggregatedLine[] {
  const lines = new Map<string, AggregatedLine>();
  for (const recipe of plannedRecipes(plan, recipes, range)) {
    for (const ing of recipe.ingredients) {
      const item = catalog.get(ing.ingredientId);
      if (!item) continue;
      const key = lineKey(item.id, ing.unit);
      let line = lines.get(key);
      if (!line) {
        const packSize = packSizeFor(item, ing.unit);
        line = {
          key,
          ingredientId: item.id,
          name: item.name,
          unit: ing.unit,
          section: item.section,
          quantity: 0,
          recipeNames: [],
          perishable: item.perishable,
          ...(item.shelfLifeDays !== undefined ? { shelfLifeDays: item.shelfLifeDays } : {}),
          ...(packSize !== undefined ? { packSize } : {}),
        };
        lines.set(key, line);
      }
      line.quantity = roundQty(line.quantity + ing.quantity);
      if (!line.recipeNames.includes(recipe.name)) line.recipeNames.push(recipe.name);
    }
  }
  return [...lines.values()];
}

const sectionRank = (s: Section) => SECTIONS.indexOf(s);

/** The grocery list for a range, sorted by aisle then name. */
export function buildGroceryList(
  plan: PlanEntry[],
  recipes: Recipe[],
  catalog: IngredientCatalog,
  range: DateRange,
  checkedKeys: ReadonlySet<string> = new Set(),
): GroceryItem[] {
  return aggregateIngredients(plan, recipes, catalog, range)
    .map(({ key, ingredientId, name, unit, section, quantity, recipeNames }) => ({
      key,
      ingredientId,
      name,
      unit,
      section,
      quantity,
      recipeNames,
      checked: checkedKeys.has(key),
    }))
    .sort((a, b) => sectionRank(a.section) - sectionRank(b.section) || a.name.localeCompare(b.name));
}

/** Group a sorted grocery list by section, keeping aisle order. */
export function groupBySection(items: GroceryItem[]): { section: Section; items: GroceryItem[] }[] {
  return SECTIONS.map((section) => ({ section, items: items.filter((i) => i.section === section) })).filter(
    (g) => g.items.length > 0,
  );
}
