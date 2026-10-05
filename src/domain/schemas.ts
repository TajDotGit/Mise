import { z } from 'zod';

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const IsoDateSchema = z.string().regex(ISO_DATE, 'Use YYYY-MM-DD');
export type IsoDate = z.infer<typeof IsoDateSchema>;

/** Store sections: the top level of the ingredient picker and the grocery list grouping, in aisle order. */
export const SECTIONS = [
  'produce',
  'meat & seafood',
  'dairy & eggs',
  'bakery',
  'beans & legumes',
  'dry goods',
  'canned & jarred',
  'condiments & sauces',
  'oils & vinegars',
  'spices & seasonings',
  'frozen',
] as const;
export const SectionSchema = z.enum(SECTIONS);
export type Section = z.infer<typeof SectionSchema>;

/** The only units an ingredient can be measured in. Keeps "lb" from also appearing as "lbs" or "pound". */
export const UNITS = [
  'each',
  'lb',
  'oz',
  'g',
  'kg',
  'cup',
  'tbsp',
  'tsp',
  'ml',
  'l',
  'can',
  'jar',
  'box',
  'bag',
  'bunch',
  'head',
  'clove',
  'slice',
  'stalk',
  'sprig',
  'pinch',
] as const;
export const UnitSchema = z.enum(UNITS);
export type Unit = z.infer<typeof UnitSchema>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const IngredientIdSchema = z.string().regex(SLUG, 'Unknown ingredient').max(60);

/**
 * A pre-loaded catalog ingredient. This is the single source of truth for an
 * ingredient's name, aisle, unit, and how it keeps; recipes only reference its id.
 */
export const CatalogIngredientSchema = z
  .object({
    id: IngredientIdSchema,
    name: z.string().trim().min(1).max(60),
    section: SectionSchema,
    /** Picker grouping inside a section, e.g. "Leafy greens" within produce. */
    subsection: z.string().trim().min(1).max(40),
    /** Allowed units; the first is the default and the unit packs are sold in. */
    units: z.array(UnitSchema).min(1).max(4),
    perishable: z.boolean(),
    shelfLifeDays: z.number().int().min(0).max(365).optional(),
    /** Pack size in the default unit (units[0]). */
    packSize: z.number().positive().max(10_000).optional(),
    /** Extra search terms, e.g. "cilantro" also matches "coriander". */
    aliases: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  })
  .refine((i) => !i.perishable || i.shelfLifeDays !== undefined, {
    message: 'Perishables need a shelf life',
    path: ['shelfLifeDays'],
  })
  .refine((i) => new Set(i.units).size === i.units.length, { message: 'Duplicate units', path: ['units'] });
export type CatalogIngredient = z.infer<typeof CatalogIngredientSchema>;

export type IngredientCatalog = ReadonlyMap<string, CatalogIngredient>;

/** One line of a recipe: which catalog ingredient, how much, in which of its units. */
export const RecipeIngredientSchema = z.object({
  ingredientId: IngredientIdSchema,
  quantity: z.number('Enter a number').positive('Must be more than 0').max(10_000),
  unit: UnitSchema,
});
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

const text = (max: number) => z.string().trim().min(1, 'Required').max(max, `Keep it under ${max} characters`);

/** Only plain web links: never javascript:, data:, or other schemes. */
export const RecipeLinkSchema = z
  .url({ protocol: /^https?$/, hostname: z.regexes.domain, message: 'Use a full web link starting with https://' })
  .max(2000);

export const RecipeInputSchema = z.object({
  name: text(80),
  servings: z.number('Enter a number').int('Whole number').min(1).max(50),
  cookMinutes: z.number('Enter a number').int('Whole minutes').min(1).max(24 * 60).optional(),
  link: RecipeLinkSchema.optional(),
  ingredients: z.array(RecipeIngredientSchema).min(1, 'Add at least one ingredient').max(60),
  steps: z.array(text(300)).max(30),
  notes: z.string().trim().max(2000),
});
export type RecipeInput = z.infer<typeof RecipeInputSchema>;

export const RecipeSchema = RecipeInputSchema.extend({ id: z.string().min(1) });
export type Recipe = z.infer<typeof RecipeSchema>;

export const PlanEntrySchema = z.object({
  id: z.string().min(1),
  recipeId: z.string().min(1),
  date: IsoDateSchema,
});
export type PlanEntry = z.infer<typeof PlanEntrySchema>;

export const DateRangeSchema = z
  .object({ start: IsoDateSchema, end: IsoDateSchema })
  .refine((r) => r.start <= r.end, { message: 'Range start must not be after end' });
export type DateRange = z.infer<typeof DateRangeSchema>;

/** Derived: never stored or entered by hand. */
export interface GroceryItem {
  key: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: Unit;
  section: Section;
  recipeNames: string[];
  checked: boolean;
}

/** Derived: never stored or entered by hand. */
export interface Leftover {
  key: string;
  ingredientId: string;
  name: string;
  unit: Unit;
  needed: number;
  purchased: number;
  leftover: number;
  purchaseDate: IsoDate;
  useBy: IsoDate;
  recipeNames: string[];
}

export const HouseholdMemberSchema = z.object({
  id: z.string().min(1),
  displayName: text(40),
  role: z.enum(['owner', 'member']),
});
export type HouseholdMember = z.infer<typeof HouseholdMemberSchema>;

export const HouseholdSchema = z.object({
  id: z.string().min(1),
  name: text(60),
  members: z.array(HouseholdMemberSchema).max(10),
});
export type Household = z.infer<typeof HouseholdSchema>;
