import { useEffect, useMemo, useState } from 'react';
import { makeCatalog } from '../domain/catalog';
import type { CatalogIngredient, DateRange, Household, IngredientCatalog, PlanEntry, Recipe } from '../domain/schemas';
import type { Subscribable } from './repositories';
import { useRepositories } from './RepositoryContext';

interface Query<T> {
  data: T | undefined;
  loading: boolean;
}

/** Load data from a repository and reload whenever any of the given repositories change. */
function useLiveQuery<T>(sources: Subscribable[], load: () => Promise<T>, deps: unknown[]): Query<T> {
  const [state, setState] = useState<Query<T>>({ data: undefined, loading: true });
  useEffect(() => {
    let active = true;
    const run = () => {
      load().then(
        (data) => active && setState({ data, loading: false }),
        () => active && setState({ data: undefined, loading: false }),
      );
    };
    run();
    const unsubs = sources.map((s) => s.subscribe(run));
    return () => {
      active = false;
      unsubs.forEach((u) => u());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function useRecipes(): Query<Recipe[]> {
  const { recipes } = useRepositories();
  return useLiveQuery([recipes], () => recipes.list(), [recipes]);
}

export function useRecipe(id: string | undefined): Query<Recipe | undefined> {
  const { recipes } = useRepositories();
  return useLiveQuery([recipes], async () => (id ? recipes.get(id) : undefined), [recipes, id]);
}

export function usePlan(range: DateRange): Query<PlanEntry[]> {
  const { plan } = useRepositories();
  return useLiveQuery([plan], () => plan.listRange(range), [plan, range.start, range.end]);
}

export function useCheckedKeys(): Query<Set<string>> {
  const { grocery } = useRepositories();
  return useLiveQuery([grocery], () => grocery.checkedKeys(), [grocery]);
}

/** The ingredient catalog as a list (for the picker) and a map (for lookups). */
export function useCatalog(): { items: CatalogIngredient[]; catalog: IngredientCatalog; loading: boolean } {
  const { catalog } = useRepositories();
  const { data, loading } = useLiveQuery([], () => catalog.list(), [catalog]);
  return useMemo(() => {
    const items = data ?? [];
    return { items, catalog: makeCatalog(items), loading };
  }, [data, loading]);
}

export function useHousehold(): Query<Household> {
  const { household } = useRepositories();
  return useLiveQuery([household], () => household.get(), [household]);
}
