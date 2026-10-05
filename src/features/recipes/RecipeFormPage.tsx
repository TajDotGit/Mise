import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { ChevronLeftIcon, PlusIcon } from '../../components/icons';
import { EmptyState } from '../../components/EmptyState';
import { useRecipe } from '../../data/hooks';
import { useRepositories } from '../../data/RepositoryContext';
import type { Recipe } from '../../domain/schemas';
import { emptyIngredient, parseDraft, toDraft, type FieldErrors, type RecipeDraft } from './formModel';
import { IngredientRow, UnitOptions } from './IngredientRow';

const input = 'min-h-12 w-full rounded-xl border border-line bg-white px-3';

export function RecipeFormPage() {
  const { id } = useParams();
  const { data: recipe, loading } = useRecipe(id);
  if (id && loading) return null;
  if (id && !recipe) return <EmptyState title="Recipe not found" />;
  // Keyed so the form state resets when switching recipes.
  return <RecipeForm key={id ?? 'new'} recipe={recipe} />;
}

function RecipeForm({ recipe }: { recipe: Recipe | undefined }) {
  const { recipes } = useRepositories();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<RecipeDraft>(() => toDraft(recipe));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const backTo = recipe ? `/recipes/${recipe.id}` : '/recipes';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseDraft(draft);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setSaving(true);
    try {
      const saved = recipe ? await recipes.update(recipe.id, parsed.value) : await recipes.create(parsed.value);
      void navigate(`/recipes/${saved.id}`);
    } catch {
      setErrors({ form: 'Could not save the recipe. Check the fields and try again.' });
      setSaving(false);
    }
  };

  const setIngredient = (i: number, next: RecipeDraft['ingredients'][number]) =>
    setDraft((d) => ({ ...d, ingredients: d.ingredients.map((x, j) => (j === i ? next : x)) }));

  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <Link to={backTo} className="-ml-2 mt-4 inline-flex min-h-12 items-center gap-1 px-2 font-semibold text-brand">
        <ChevronLeftIcon /> Cancel
      </Link>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{recipe ? 'Edit recipe' : 'New recipe'}</h1>

      <label className="mt-4 block">
        <span className="font-semibold">Name</span>
        <input className={`${input} mt-1`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        {errors.name ? <p className="mt-1 text-sm text-danger">{errors.name}</p> : null}
      </label>

      <label className="mt-4 block">
        <span className="font-semibold">Servings</span>
        <input
          className={`${input} mt-1`}
          inputMode="numeric"
          value={draft.servings}
          onChange={(e) => setDraft({ ...draft, servings: e.target.value })}
        />
        {errors.servings ? <p className="mt-1 text-sm text-danger">{errors.servings}</p> : null}
      </label>

      <h2 className="mt-6 font-semibold">Ingredients</h2>
      {errors.ingredients ? <p className="mt-1 text-sm text-danger">{errors.ingredients}</p> : null}
      <UnitOptions />
      <div className="mt-2 flex flex-col gap-3">
        {draft.ingredients.map((ing, i) => (
          <IngredientRow
            key={i}
            index={i}
            value={ing}
            errors={errors}
            onChange={(next) => setIngredient(i, next)}
            onRemove={() => setDraft((d) => ({ ...d, ingredients: d.ingredients.filter((_, j) => j !== i) }))}
            canRemove={draft.ingredients.length > 1}
          />
        ))}
      </div>
      <Button
        variant="secondary"
        className="mt-3 w-full"
        onClick={() => setDraft((d) => ({ ...d, ingredients: [...d.ingredients, emptyIngredient()] }))}
      >
        <PlusIcon /> Add ingredient
      </Button>

      <label className="mt-6 block">
        <span className="font-semibold">Notes</span>
        <textarea
          className={`${input} mt-1 min-h-28 py-2`}
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
        {errors.notes ? <p className="mt-1 text-sm text-danger">{errors.notes}</p> : null}
      </label>

      {errors.form ? <p className="mt-4 text-danger">{errors.form}</p> : null}
      <Button type="submit" className="mt-6 w-full" disabled={saving}>
        {recipe ? 'Save changes' : 'Save recipe'}
      </Button>
    </form>
  );
}
