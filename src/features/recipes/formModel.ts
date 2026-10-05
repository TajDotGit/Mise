import type { z } from 'zod';
import { validateAgainstCatalog } from '../../domain/catalog';
import { RecipeInputSchema, type IngredientCatalog, type Recipe, type RecipeInput, type Unit } from '../../domain/schemas';

/** Form fields are strings while editing; they're converted and validated on submit. */
export interface IngredientDraft {
  ingredientId: string;
  quantity: string;
  unit: Unit | '';
}

export interface RecipeDraft {
  name: string;
  servings: string;
  cookMinutes: string;
  link: string;
  notes: string;
  steps: string[];
  ingredients: IngredientDraft[];
}

export const emptyIngredient = (): IngredientDraft => ({ ingredientId: '', quantity: '', unit: '' });

export function toDraft(recipe?: Recipe): RecipeDraft {
  if (!recipe) {
    return { name: '', servings: '2', cookMinutes: '', link: '', notes: '', steps: [''], ingredients: [emptyIngredient()] };
  }
  return {
    name: recipe.name,
    servings: String(recipe.servings),
    cookMinutes: recipe.cookMinutes === undefined ? '' : String(recipe.cookMinutes),
    link: recipe.link ?? '',
    notes: recipe.notes,
    steps: recipe.steps.length > 0 ? [...recipe.steps] : [''],
    ingredients: recipe.ingredients.map((i) => ({
      ingredientId: i.ingredientId,
      quantity: String(i.quantity),
      unit: i.unit,
    })),
  };
}

const num = (s: string) => (s.trim() === '' ? NaN : Number(s));
const optNum = (s: string) => (s.trim() === '' ? undefined : Number(s));
const optText = (s: string) => (s.trim() === '' ? undefined : s.trim());

export type FieldErrors = Record<string, string>;

/** Convert the draft and validate it with the same rules the repository uses. */
export function parseDraft(
  draft: RecipeDraft,
  catalog: IngredientCatalog,
): { ok: true; value: RecipeInput } | { ok: false; errors: FieldErrors } {
  const candidate = {
    name: draft.name,
    servings: num(draft.servings),
    cookMinutes: optNum(draft.cookMinutes),
    link: optText(draft.link),
    notes: draft.notes,
    // Blank step rows are just unused slots.
    steps: draft.steps.filter((s) => s.trim() !== ''),
    ingredients: draft.ingredients.map((i) => ({
      ingredientId: i.ingredientId,
      quantity: num(i.quantity),
      unit: i.unit,
    })),
  };
  const result = RecipeInputSchema.safeParse(candidate);
  const errors: FieldErrors = result.success ? {} : toFieldErrors(result.error);
  for (const issue of validateAgainstCatalog(
    draft.ingredients.map((i) => ({ ingredientId: i.ingredientId, quantity: 1, unit: (i.unit || 'each') as Unit })),
    catalog,
  )) {
    errors[`ingredients.${issue.index}.${issue.field}`] ??= issue.message;
  }
  // A missing pick reads better as one message on the picker than as id/unit errors.
  const unpicked = new Set(draft.ingredients.flatMap((i, index) => (i.ingredientId ? [] : [index])));
  for (const index of unpicked) errors[`ingredients.${index}.ingredientId`] = 'Pick an ingredient from the list';
  const filtered = Object.fromEntries(
    Object.entries(errors).filter(([key]) => {
      const m = /^ingredients\.(\d+)\.unit$/.exec(key);
      return !(m && unpicked.has(Number(m[1])));
    }),
  );
  if (result.success && Object.keys(filtered).length === 0) return { ok: true, value: result.data };
  return { ok: false, errors: filtered };
}

function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) errors[issue.path.join('.')] ??= issue.message;
  return errors;
}
