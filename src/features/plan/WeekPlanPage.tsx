import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useRepositories } from '../../data/RepositoryContext';
import { eachDay } from '../../domain/dates';
import type { IsoDate } from '../../domain/schemas';
import { useWeekInsights } from '../week/useWeekInsights';
import { WeekSwitcher } from '../week/WeekSwitcher';
import { DayCard } from './DayCard';
import { RecipePicker } from './RecipePicker';
import { dayLabel } from './dayLabel';

export function WeekPlanPage() {
  const { plan: planRepo } = useRepositories();
  const { range, today, plan, recipes, recipesById, proposals, moreIdeas } = useWeekInsights();
  const [pickingDate, setPickingDate] = useState<IsoDate | null>(null);

  const entryByDate = new Map(plan.map((e) => [e.date, e]));
  const planned = plan.filter((e) => recipesById.has(e.recipeId)).length;

  const assign = async (date: IsoDate, recipeId: string) => {
    await planRepo.assign(date, recipeId);
    setPickingDate(null);
  };

  return (
    <>
      <PageHeader title="Week plan" subtitle={`${planned} of 7 dinners planned`} />
      <WeekSwitcher />
      <div className="flex flex-col gap-3">
        {eachDay(range.start, range.end).map((date) => {
          const entry = entryByDate.get(date);
          return (
            <DayCard
              key={date}
              date={date}
              today={today}
              recipe={entry ? recipesById.get(entry.recipeId) : undefined}
              proposal={proposals.find((p) => p.date === date)}
              onPick={() => setPickingDate(date)}
              onClear={() => void planRepo.clear(date)}
              onAccept={(recipeId) => void assign(date, recipeId)}
            />
          );
        })}
      </div>
      {pickingDate ? (
        <RecipePicker
          title={`Dinner for ${dayLabel(pickingDate, today)}`}
          recipes={recipes}
          suggestedIds={moreIdeas.map((m) => m.recipe.id)}
          onPick={(id) => void assign(pickingDate, id)}
          onClose={() => setPickingDate(null)}
        />
      ) : null}
    </>
  );
}
