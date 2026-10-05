import { useState } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '../../components/EmptyState';
import { PlusIcon } from '../../components/icons';
import { PageHeader } from '../../components/PageHeader';
import { useRecipes } from '../../data/hooks';
import { formatMinutes } from '../../domain/links';

export function RecipesPage() {
  const { data: recipes = [], loading } = useRecipes();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(q));

  return (
    <>
      <PageHeader
        title="Recipes"
        subtitle={`${recipes.length} saved`}
        action={
          <Link
            to="/recipes/new"
            className="inline-flex min-h-12 items-center gap-1 rounded-2xl bg-brand px-4 font-semibold text-on-brand hover:bg-brand-dark"
          >
            <PlusIcon /> Add
          </Link>
        }
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes"
        aria-label="Search recipes"
        className="mb-4 min-h-12 w-full rounded-2xl border border-line bg-surface px-4"
      />
      {!loading && filtered.length === 0 ? (
        <EmptyState title="No recipes found">Try another search, or add a recipe.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                to={`/recipes/${r.id}`}
                className="flex min-h-16 items-center justify-between rounded-2xl bg-surface px-4 py-3 ring-1 ring-line hover:ring-brand"
              >
                <span>
                  <span className="block font-semibold">{r.name}</span>
                  <span className="text-sm text-muted">
                    Serves {r.servings}
                    {r.cookMinutes ? ` · ${formatMinutes(r.cookMinutes)}` : ''} · {r.ingredients.length} ingredients
                  </span>
                </span>
                {r.link ? <span className="text-xs font-semibold text-muted">link</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
