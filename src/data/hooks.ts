import { useEffect, useState } from 'react';
import type { DateRange, PlanEntry, Recipe } from '../domain/schemas';
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
