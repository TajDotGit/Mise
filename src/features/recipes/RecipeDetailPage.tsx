import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ChevronLeftIcon } from '../../components/icons';
import { EmptyState } from '../../components/EmptyState';
import { useRecipe } from '../../data/hooks';
import { useRepositories } from '../../data/RepositoryContext';
import { formatQty } from '../../domain/quantity';

export function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const repos = useRepositories();
  const { data: recipe, loading } = useRecipe(id);

  if (loading) return null;
  if (!recipe) return <EmptyState title="Recipe not found" />;

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
      <p className="mt-1 text-muted">Serves {recipe.servings}</p>

      <Card className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Ingredients</h2>
        <ul className="divide-y divide-line">
          {recipe.ingredients.map((ing, i) => (
            <li key={`${ing.name}-${i}`} className="flex items-baseline justify-between gap-3 py-3">
              <span>
                <span className="font-medium">{ing.name}</span>
                {ing.perishable ? (
                  <span className="block text-sm text-muted">
                    Keeps {ing.shelfLifeDays} days{ing.packSize ? ` · sold in ${formatQty(ing.packSize)} ${ing.unit} packs` : ''}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-muted">
                {formatQty(ing.quantity)} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </Card>

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
