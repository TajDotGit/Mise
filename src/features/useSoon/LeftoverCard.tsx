import { Card } from '../../components/Card';
import { UrgencyBadge } from '../../components/UrgencyBadge';
import { formatShort } from '../../domain/dates';
import { daysLeft, urgency } from '../../domain/leftovers';
import { formatQty } from '../../domain/quantity';
import type { IsoDate, Leftover } from '../../domain/schemas';

const bar = { expired: 'bg-danger', today: 'bg-danger', soon: 'bg-warn', later: 'bg-ok' } as const;

export function LeftoverCard({ leftover, today }: { leftover: Leftover; today: IsoDate }) {
  const level = urgency(leftover.useBy, today);
  const days = daysLeft(leftover.useBy, today);
  return (
    <Card className="relative overflow-hidden pl-6">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-2 ${bar[level]}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{leftover.name}</h3>
          <p className="text-2xl font-bold">
            {formatQty(leftover.leftover)} <span className="text-base font-medium text-muted">{leftover.unit} left</span>
          </p>
        </div>
        <UrgencyBadge level={level} days={days} />
      </div>
      <p className="mt-2 text-sm text-muted">
        Buying {formatQty(leftover.purchased)} {leftover.unit}, plan uses {formatQty(leftover.needed)} (
        {leftover.recipeNames.join(', ')}). Use by {formatShort(leftover.useBy)}.
      </p>
    </Card>
  );
}
