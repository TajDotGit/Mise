import type {
  CatalogIngredient,
  DateRange,
  Household,
  IsoDate,
  PlanEntry,
  Recipe,
  RecipeInput,
} from '../domain/schemas';

/**
 * Data-access contracts. UI code depends only on these interfaces; Phase 0 uses
 * in-memory implementations (src/data/memory), later phases swap in Supabase.
 * Every implementation must validate inputs with the Zod schemas in src/domain.
 */

export type Unsubscribe = () => void;

export interface Subscribable {
  /** Called after any change, so views can reload. */
  subscribe(listener: () => void): Unsubscribe;
}

export interface RecipeRepository extends Subscribable {
  list(): Promise<Recipe[]>;
  get(id: string): Promise<Recipe | undefined>;
  create(input: RecipeInput): Promise<Recipe>;
  update(id: string, input: RecipeInput): Promise<Recipe>;
  remove(id: string): Promise<void>;
}

export interface PlanRepository extends Subscribable {
  listRange(range: DateRange): Promise<PlanEntry[]>;
  /** Assign (or replace) the recipe for a date. One entry per date. */
  assign(date: IsoDate, recipeId: string): Promise<PlanEntry>;
  clear(date: IsoDate): Promise<void>;
  removeRecipe(recipeId: string): Promise<void>;
}

/** Grocery items are derived; only the checked state of a line is stored. */
export interface GroceryRepository extends Subscribable {
  checkedKeys(): Promise<Set<string>>;
  setChecked(key: string, checked: boolean): Promise<void>;
}

/** The pre-loaded ingredient list. Read-only for now; custom ingredients are on the backlog. */
export interface CatalogRepository {
  list(): Promise<CatalogIngredient[]>;
}

/** The household this device belongs to. Sharing and invites arrive with real accounts. */
export interface HouseholdRepository extends Subscribable {
  get(): Promise<Household>;
  rename(name: string): Promise<Household>;
}

export interface Repositories {
  catalog: CatalogRepository;
  household: HouseholdRepository;
  recipes: RecipeRepository;
  plan: PlanRepository;
  grocery: GroceryRepository;
}
