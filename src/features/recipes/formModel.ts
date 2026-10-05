import type { z } from 'zod';
import { RecipeInputSchema, type Category, type Recipe, type RecipeInput } from '../../domain/schemas';

/** Form fields are strings while editing; they're converted and validated on submit. */
export interface IngredientDraft {
  name: string;
  quantity: string;
  unit: string;
  category: Category;
  perishable: boolean;
  shelfLifeDays: string;
  packSize: string;
}

export interface RecipeDraft {
  name: string;
  servings: string;
  notes: string;
  ingredients: IngredientDraft[];
}

export const emptyIngredient = (): IngredientDraft => ({
  name: '',
  quantity: '',
  unit: '',
  category: 'produce',
  perishable: false,
  shelfLifeDays: '',
  packSize: '',
});

export function toDraft(recipe?: Recipe): RecipeDraft {
  if (!recipe) return { name: '', servings: '2', notes: '', ingredients: [emptyIngredient()] };
  return {
    name: recipe.name,
    servings: String(recipe.servings),
    notes: recipe.notes,
    ingredients: recipe.ingredients.map((i) => ({
      name: i.name,
      quantity: String(i.quantity),
      unit: i.unit,
      category: i.category,
      perishable: i.perishable,
      shelfLifeDays: i.shelfLifeDays === undefined ? '' : String(i.shelfLifeDays),
      packSize: i.packSize === undefined ? '' : String(i.packSize),
    })),
  };
}

const num = (s: string) => (s.trim() === '' ? NaN : Number(s));
const optNum = (s: string) => (s.trim() === '' ? undefined : Number(s));

export type FieldErrors = Record<string, string>;

/** Convert the draft and validate it with the same schema the repository uses. */
export function parseDraft(draft: RecipeDraft): { ok: true; value: RecipeInput } | { ok: false; errors: FieldErrors } {
  const candidate = {
    name: draft.name,
    servings: num(draft.servings),
    notes: draft.notes,
    ingredients: draft.ingredients.map((i) => ({
      name: i.name,
      quantity: num(i.quantity),
      unit: i.unit,
      category: i.category,
      perishable: i.perishable,
      ...(i.perishable ? { shelfLifeDays: optNum(i.shelfLifeDays), packSize: optNum(i.packSize) } : {}),
    })),
  };
  const result = RecipeInputSchema.safeParse(candidate);
  if (result.success) return { ok: true, value: result.data };
  return { ok: false, errors: toFieldErrors(result.error) };
}

function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    const message = issue.code === 'invalid_type' ? 'Enter a number' : issue.message;
    errors[key] ??= message;
  }
  return errors;
}
