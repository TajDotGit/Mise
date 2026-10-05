import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ChevronLeftIcon, ClockIcon, LinkIcon, PlayIcon } from '../../components/icons';
import { useCatalog, useRecipe } from '../../data/hooks';
import { useRepositories } from '../../data/RepositoryContext';
import { describeLink, formatMinutes } from '../../domain/links';
import { formatQty } from '../../domain/quantity';

export function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const repos = useRepositories();
  const { data: recipe, loading } = useRecipe(id);
  const { catalog } = useCatalog();

  if (loading) return null;
  if (!recipe) return <EmptyState title="Recipe not found" />;

  const link = describeLink(recipe.link);

  const remove = async () => {
    if (!window.confirm(`Delete "${recipe.name}"? It will also be removed from the plan.`)) return;
    await repos.plan.removeRecipe(recipe.id);
    await repos.recipes.remove(recipe.id);
    void navigate('/recipes');
  };

  return (
    <>
      <Link to="/recipes" className="-ml-2 mt-4 inline-flex min-h-12 items-center gap-1 px-2 font-semibold text-brand">
        <ChevronLeftIcon /> Recipes
      </Link>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{recipe.name}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
        <span>Serves {recipe.servings}</span>
        {recipe.cookMinutes ? (
          <span className="inline-flex items-center gap-1">
            <ClockIcon width={18} height={18} /> {formatMinutes(recipe.cookMinutes)}
          </span>
        ) : null}
      </p>

      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          referrerPolicy="no-referrer"
          className="mt-4 flex min-h-14 items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line hover:ring-brand"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
            {link.kind === 'video' ? <PlayIcon /> : <LinkIcon />}
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">{link.kind === 'video' ? 'Watch video' : 'Open recipe link'}</span>
            <span className="block truncate text-sm text-muted">{link.host}</span>
          </span>
        </a>
      ) : null}

      <Card className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Ingredients</h2>
        <ul className="divide-y divide-line">
          {recipe.ingredients.map((ing, i) => {
            const item = catalog.get(ing.ingredientId);
            return (
              <li key={`${ing.ingredientId}-${i}`} className="flex items-baseline justify-between gap-3 py-3">
                <span>
                  <span className="font-medium">{item?.name ?? 'Unknown ingredient'}</span>
                  {item?.perishable ? (
                    <span className="block text-sm text-muted">Fresh · keeps {item.shelfLifeDays} days</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-muted">
                  {formatQty(ing.quantity)} {ing.unit}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      {recipe.steps.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-2 text-lg font-bold">Steps</h2>
          <ol className="flex flex-col gap-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      {recipe.notes ? (
        <Card className="mt-4">
          <h2 className="mb-2 text-lg font-bold">Notes</h2>
          <p className="whitespace-pre-wrap">{recipe.notes}</p>
        </Card>
      ) : null}

      <div className="mt-6 flex gap-2">
        <Button className="flex-1" onClick={() => void navigate(`/recipes/${recipe.id}/edit`)}>
          Edit
        </Button>
        <Button variant="danger" className="flex-1" onClick={() => void remove()}>
          Delete
        </Button>
      </div>
    </>
  );
}
