import { CheckIcon } from '../../components/icons';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { useRepositories } from '../../data/RepositoryContext';
import { groupBySection } from '../../domain/grocery';
import { formatQty } from '../../domain/quantity';
import type { GroceryItem } from '../../domain/schemas';
import { useWeekInsights } from '../week/useWeekInsights';
import { WeekSwitcher } from '../week/WeekSwitcher';

export function GroceryPage() {
  const { grocery: groceryRepo } = useRepositories();
  const { grocery, loading } = useWeekInsights();
  const done = grocery.filter((i) => i.checked).length;

  return (
    <>
      <PageHeader title="Groceries" subtitle={grocery.length ? `${done} of ${grocery.length} in the cart` : undefined} />
      <WeekSwitcher />
      {!loading && grocery.length === 0 ? (
        <EmptyState title="Nothing to buy">Plan some dinners for this week and the list builds itself.</EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {groupBySection(grocery).map(({ section, items }) => (
            <section key={section} aria-label={section}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{section}</h2>
              <ul className="overflow-hidden rounded-3xl border border-line bg-surface">
                {items.map((item) => (
                  <GroceryRow key={item.key} item={item} onToggle={() => void groceryRepo.setChecked(item.key, !item.checked)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function GroceryRow({ item, onToggle }: { item: GroceryItem; onToggle: () => void }) {
  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        onClick={onToggle}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas"
      >
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${
            item.checked ? 'border-brand bg-brand text-on-brand' : 'border-line'
          }`}
        >
          {item.checked ? <CheckIcon width={16} height={16} /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block font-semibold ${item.checked ? 'text-muted line-through' : ''}`}>{item.name}</span>
          <span className="block truncate text-sm text-muted">from: {item.recipeNames.join(', ')}</span>
        </span>
        <span className={`shrink-0 font-medium ${item.checked ? 'text-muted' : ''}`}>
          {formatQty(item.quantity)} {item.unit}
        </span>
      </button>
    </li>
  );
}
