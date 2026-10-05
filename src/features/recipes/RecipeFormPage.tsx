import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ChevronLeftIcon, PlusIcon } from '../../components/icons';
import { useCatalog, useRecipe } from '../../data/hooks';
import { useRepositories } from '../../data/RepositoryContext';
import type { Recipe } from '../../domain/schemas';
import { emptyIngredient, parseDraft, toDraft, type FieldErrors, type RecipeDraft } from './formModel';
import { IngredientRow } from './IngredientRow';
import { StepsEditor } from './StepsEditor';

const input = 'min-h-12 w-full rounded-xl border border-line bg-surface px-3';

export function RecipeFormPage() {
  const { id } = useParams();
  const { data: recipe, loading } = useRecipe(id);
  const { loading: catalogLoading } = useCatalog();
  if ((id && loading) || catalogLoading) return null;
  if (id && !recipe) return <EmptyState title="Recipe not found" />;
  // Keyed so the form state resets when switching recipes.
  return <RecipeForm key={id ?? 'new'} recipe={recipe} />;
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="font-semibold">{label}</span>
      {hint ? <span className="ml-2 text-sm text-muted">{hint}</span> : null}
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </label>
  );
}

function RecipeForm({ recipe }: { recipe: Recipe | undefined }) {
  const { recipes } = useRepositories();
  const { items, catalog } = useCatalog();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<RecipeDraft>(() => toDraft(recipe));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const backTo = recipe ? `/recipes/${recipe.id}` : '/recipes';
  const set = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseDraft(draft, catalog);
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

  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <Link to={backTo} className="-ml-2 mt-4 inline-flex min-h-12 items-center gap-1 px-2 font-semibold text-brand">
        <ChevronLeftIcon /> Cancel
      </Link>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{recipe ? 'Edit recipe' : 'New recipe'}</h1>

      <Field label="Name" error={errors.name}>
        <input className={input} value={draft.name} onChange={(e) => set('name', e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Servings" error={errors.servings}>
          <input className={input} inputMode="numeric" value={draft.servings} onChange={(e) => set('servings', e.target.value)} />
        </Field>
        <Field label="Time" hint="minutes" error={errors.cookMinutes}>
          <input
            className={input}
            inputMode="numeric"
            placeholder="e.g. 30"
            value={draft.cookMinutes}
            onChange={(e) => set('cookMinutes', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Video or recipe link" hint="optional" error={errors.link}>
        <input
          className={input}
          type="url"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="https://"
          value={draft.link}
          onChange={(e) => set('link', e.target.value)}
        />
      </Field>

      <h2 className="mt-6 font-semibold">Ingredients</h2>
      {errors.ingredients ? <p className="mt-1 text-sm text-danger">{errors.ingredients}</p> : null}
      <ul className="mt-2 flex flex-col gap-3">
        {draft.ingredients.map((ing, i) => (
          <IngredientRow
            key={i}
            index={i}
            value={ing}
            errors={errors}
            catalog={catalog}
            items={items}
            onChange={(next) => set('ingredients', draft.ingredients.map((x, j) => (j === i ? next : x)))}
            onRemove={() => set('ingredients', draft.ingredients.filter((_, j) => j !== i))}
            canRemove={draft.ingredients.length > 1}
          />
        ))}
      </ul>
      <Button
        variant="secondary"
        className="mt-3 w-full"
        onClick={() => set('ingredients', [...draft.ingredients, emptyIngredient()])}
      >
        <PlusIcon /> Add ingredient
      </Button>

      <h2 className="mt-6 font-semibold">
        Steps <span className="ml-1 text-sm font-normal text-muted">short reminders, in order</span>
      </h2>
      <StepsEditor steps={draft.steps} errors={errors} onChange={(steps) => set('steps', steps)} />

      <Field label="Notes" error={errors.notes}>
        <textarea className={`${input} min-h-28 py-2`} value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      {errors.form ? <p className="mt-4 text-danger">{errors.form}</p> : null}
      {Object.keys(errors).length > 0 && !errors.form ? (
        <p role="alert" className="mt-4 text-danger">
          Some fields need attention.
        </p>
      ) : null}
      <Button type="submit" className="mt-6 w-full" disabled={saving}>
        {recipe ? 'Save changes' : 'Save recipe'}
      </Button>
    </form>
  );
}
