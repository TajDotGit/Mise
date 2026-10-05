import { Link } from 'react-router';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PlusIcon } from '../../components/icons';
import type { IsoDate, Recipe } from '../../domain/schemas';
import type { UseItUpProposal } from '../../domain/suggestions';
import { dayLabel } from './dayLabel';

export function DayCard({
  date,
  today,
  recipe,
  proposal,
  onPick,
  onClear,
  onAccept,
}: {
  date: IsoDate;
  today: IsoDate;
  recipe: Recipe | undefined;
  proposal: UseItUpProposal | undefined;
  onPick: () => void;
  onClear: () => void;
  onAccept: (recipeId: string) => void;
}) {
  const label = dayLabel(date, today);
  const isPast = date < today;
  return (
    <Card className={isPast ? 'opacity-60' : ''} aria-label={label}>
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold uppercase tracking-wide ${date === today ? 'text-brand' : 'text-muted'}`}>
          {label}
        </h2>
      </div>
      {recipe ? (
        <>
          <Link to={`/recipes/${recipe.id}`} className="mt-1 block text-xl font-semibold hover:text-brand">
            {recipe.name}
          </Link>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onPick} aria-label={`Swap ${label}`}>
              Swap
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onClear} aria-label={`Clear ${label}`}>
              Clear
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-lg text-muted">Nothing planned</p>
          {proposal ? (
            <div className="mt-3 rounded-2xl bg-brand-soft p-3">
              <p className="text-sm text-brand">
                <span className="font-semibold">Use it up:</span> {proposal.recipe.name} uses your leftover{' '}
                {proposal.uses.map((u) => u.name.toLowerCase()).join(', ')}
              </p>
              <Button className="mt-2 w-full" onClick={() => onAccept(proposal.recipe.id)}>
                Plan {proposal.recipe.name}
              </Button>
            </div>
          ) : null}
          <Button variant="secondary" className="mt-3 w-full" onClick={onPick} aria-label={`Add recipe to ${label}`}>
            <PlusIcon /> Add recipe
          </Button>
        </>
      )}
    </Card>
  );
}
