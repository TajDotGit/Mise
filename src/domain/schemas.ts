import { z } from 'zod';

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const IsoDateSchema = z.string().regex(ISO_DATE, 'Use YYYY-MM-DD');
export type IsoDate = z.infer<typeof IsoDateSchema>;

export const CATEGORIES = ['produce', 'meat & fish', 'dairy & eggs', 'bakery', 'pantry', 'frozen', 'other'] as const;
export const CategorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof CategorySchema>;

const text = (max: number) => z.string().trim().min(1, 'Required').max(max, `Keep it under ${max} characters`);

export const IngredientSchema = z
  .object({
    name: text(80),
    quantity: z.number().positive('Must be more than 0').max(10_000),
    unit: text(20),
    category: CategorySchema,
    perishable: z.boolean(),
    shelfLifeDays: z.number().int().min(0).max(365).optional(),
    packSize: z.number().positive('Must be more than 0').max(10_000).optional(),
  })
  .refine((i) => !i.perishable || i.shelfLifeDays !== undefined, {
    message: 'Perishables need a shelf life',
    path: ['shelfLifeDays'],
  });
export type Ingredient = z.infer<typeof IngredientSchema>;

export const RecipeInputSchema = z.object({
  name: text(80),
  servings: z.number().int().min(1).max(50),
  ingredients: z.array(IngredientSchema).min(1, 'Add at least one ingredient').max(60),
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
  name: string;
  quantity: number;
  unit: string;
  category: Category;
  recipeNames: string[];
  checked: boolean;
}

/** Derived: never stored or entered by hand. */
export interface Leftover {
  key: string;
  name: string;
  unit: string;
  needed: number;
  purchased: number;
  leftover: number;
  purchaseDate: IsoDate;
  useBy: IsoDate;
  recipeNames: string[];
}
