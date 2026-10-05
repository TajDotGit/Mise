import { normalize } from './quantity';
import { SECTIONS, type CatalogIngredient, type IngredientCatalog, type RecipeIngredient, type Unit } from './schemas';

export function makeCatalog(items: readonly CatalogIngredient[]): IngredientCatalog {
  return new Map(items.map((i) => [i.id, i]));
}

export function defaultUnit(item: CatalogIngredient): Unit {
  return item.units[0] as Unit;
}

/** Packs are sold in the default unit; a line in another unit is bought exactly. */
export function packSizeFor(item: CatalogIngredient, unit: Unit): number | undefined {
  return unit === defaultUnit(item) ? item.packSize : undefined;
}

export interface CatalogIssue {
  index: number;
  field: 'ingredientId' | 'unit';
  message: string;
}

/** Recipe lines must reference a catalog ingredient, measured in one of its units. */
export function validateAgainstCatalog(lines: readonly RecipeIngredient[], catalog: IngredientCatalog): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  lines.forEach((line, index) => {
    const item = catalog.get(line.ingredientId);
    if (!item) issues.push({ index, field: 'ingredientId', message: 'Pick an ingredient from the list' });
    else if (!item.units.includes(line.unit))
      issues.push({ index, field: 'unit', message: `Use ${item.units.join(' or ')}` });
  });
  return issues;
}

const sectionRank = (item: CatalogIngredient) => SECTIONS.indexOf(item.section);

/** Catalog order: aisle, then subsection, then name. */
export function sortCatalog(items: readonly CatalogIngredient[]): CatalogIngredient[] {
  return [...items].sort(
    (a, b) => sectionRank(a) - sectionRank(b) || a.subsection.localeCompare(b.subsection) || a.name.localeCompare(b.name),
  );
}

/** Levenshtein distance, bailing out early once it exceeds `max`. */
export function editDistance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min((prev[j] ?? 0) + 1, (cur[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length] ?? 0;
}

function allowedTypos(query: string): number {
  if (query.length >= 7) return 2;
  if (query.length >= 4) return 1;
  return 0;
}

function scoreTerm(term: string, q: string): number {
  if (term === q) return 100;
  if (term.startsWith(q)) return 80;
  const words = term.split(/[\s-]+/);
  if (words.some((w) => w.startsWith(q))) return 60;
  if (term.includes(q)) return 40;
  const typos = allowedTypos(q);
  if (typos === 0) return 0;
  // Typo tolerance: compare against whole words and the start of the term/words.
  const candidates = [term, ...words, term.slice(0, q.length), ...words.map((w) => w.slice(0, q.length))];
  const best = Math.min(...candidates.map((c) => editDistance(c, q, typos)));
  return best <= typos ? 20 - best : 0;
}

/**
 * Search the catalog by name and aliases, best matches first. Tolerates small
 * typos ("cheddr" finds Cheddar). An empty query returns the catalog in aisle order.
 */
export function searchCatalog(items: readonly CatalogIngredient[], query: string): CatalogIngredient[] {
  const q = normalize(query);
  if (!q) return sortCatalog(items);
  return items
    .map((item) => ({
      item,
      score: Math.max(...[item.name, ...item.aliases].map((t) => scoreTerm(normalize(t), q))),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map((r) => r.item);
}
