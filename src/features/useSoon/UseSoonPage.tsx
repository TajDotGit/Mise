import { Link } from 'react-router';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { useRepositories } from '../../data/RepositoryContext';
import { formatShort } from '../../domain/dates';
import { formatQty } from '../../domain/quantity';
import { dayLabel } from '../plan/dayLabel';
import { useWeekInsights } from '../week/useWeekInsights';
import { WeekSwitcher } from '../week/WeekSwitcher';
import { LeftoverCard } from './LeftoverCard';

export function UseSoonPage() {
  const { plan } = useRepositories();
  const { leftovers, proposals, moreIdeas, today, range, loading } = useWeekInsights();
  const proposedIds = new Set(proposals.map((p) => p.recipe.id));
  const others = moreIdeas.filter((m) => !proposedIds.has(m.recipe.id)).slice(0, 3);

  return (
    <>
      <PageHeader title="Use soon" subtitle={`Leftovers from the shop on ${formatShort(range.start)}`} />
      <WeekSwitcher />
      {!loading && leftovers.length === 0 ? (
        <EmptyState title="No leftovers this week">Everything you buy gets used. Nice planning.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {leftovers.map((l) => (
            <li key={l.key}>
              <LeftoverCard leftover={l} today={today} />
            </li>
          ))}
        </ul>
      )}

      {proposals.length > 0 || others.length > 0 ? (
        <section className="mt-8" aria-label="Use it up">
          <h2 className="text-2xl font-bold tracking-tight">Use it up</h2>
          <p className="mt-1 text-muted">Recipes that finish off what's about to expire.</p>
          <ul className="mt-3 flex flex-col gap-3">
            {proposals.map((p) => (
              <li key={p.date}>
                <Card className="bg-brand-soft">
                  <p className="text-sm font-bold uppercase tracking-wide text-brand">{dayLabel(p.date, today)} is open</p>
                  <h3 className="mt-1 text-xl font-semibold">{p.recipe.name}</h3>
                  <p className="mt-1 text-sm">
                    Uses {p.uses.map((u) => `${formatQty(u.quantity)} ${u.unit} ${u.name.toLowerCase()}`).join(', ')}
                  </p>
                  <Button className="mt-3 w-full" onClick={() => void plan.assign(p.date, p.recipe.id)}>
                    Add to {dayLabel(p.date, today)}
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
          {others.length > 0 ? (
            <>
              <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-muted">More ideas</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {others.map((m) => (
                  <li key={m.recipe.id}>
                    <Link
                      to={`/recipes/${m.recipe.id}`}
                      className="block min-h-14 rounded-2xl bg-white px-4 py-3 ring-1 ring-line hover:ring-brand"
                    >
                      <span className="block font-semibold">{m.recipe.name}</span>
                      <span className="text-sm text-muted">Uses {m.uses.map((u) => u.name.toLowerCase()).join(', ')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
