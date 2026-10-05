import { useMemo } from 'react';
import { useToday } from '../../data/ClockContext';
import { useCatalog, useCheckedKeys, usePlan, useRecipes } from '../../data/hooks';
import { buildGroceryList } from '../../domain/grocery';
import { inferLeftovers } from '../../domain/leftovers';
import { expiringLeftovers, proposeUseItUp, rankRecipes } from '../../domain/suggestions';
import { useWeek } from './WeekContext';

/** Everything derived from the visible week's plan, computed by the pure domain functions. */
export function useWeekInsights() {
  const today = useToday();
  const { range } = useWeek();
  const recipesQ = useRecipes();
  const planQ = usePlan(range);
  const checkedQ = useCheckedKeys();
  const { catalog, loading: catalogLoading } = useCatalog();

  const loading = catalogLoading || recipesQ.loading || planQ.loading || checkedQ.loading;
  const recipes = recipesQ.data;
  const plan = planQ.data;
  const checked = checkedQ.data;

  const derived = useMemo(() => {
    const r = recipes ?? [];
    const p = plan ?? [];
    const leftovers = inferLeftovers(p, r, catalog, range);
    const plannedIds = new Set(p.map((e) => e.recipeId));
    return {
      recipesById: new Map(r.map((x) => [x.id, x])),
      grocery: buildGroceryList(p, r, catalog, range, checked ?? new Set()),
      leftovers,
      proposals: proposeUseItUp({ leftovers, recipes: r, plan: p, range, today }),
      moreIdeas: rankRecipes(expiringLeftovers(leftovers, today), r, plannedIds),
    };
  }, [recipes, plan, checked, catalog, range, today]);

  return { loading, today, range, recipes: recipes ?? [], plan: plan ?? [], ...derived };
}
