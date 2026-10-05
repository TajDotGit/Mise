import { useMemo, useState } from 'react';
import { CheckIcon } from '../../components/icons';
import { Sheet } from '../../components/Sheet';
import { searchCatalog } from '../../domain/catalog';
import { SECTIONS, type CatalogIngredient, type Section } from '../../domain/schemas';

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Full-height picker over the pre-loaded catalog: search, section filters, grouped list. */
export function IngredientPicker({
  items,
  selectedId,
  onPick,
  onClose,
}: {
  items: CatalogIngredient[];
  selectedId?: string;
  onPick: (item: CatalogIngredient) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<Section | 'all'>('all');

  const results = useMemo(() => {
    const scoped = section === 'all' ? items : items.filter((i) => i.section === section);
    return searchCatalog(scoped, query);
  }, [items, section, query]);

  const searching = query.trim() !== '';

  return (
    <Sheet
      title="Choose ingredient"
      onClose={onClose}
      tall
      header={
        <>
          <input
            type="search"
            // The sheet opens because the user asked to pick; jump straight to typing.
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredients"
            aria-label="Search ingredients"
            className="min-h-12 w-full rounded-2xl border border-line bg-surface px-4"
          />
          <div role="group" aria-label="Sections" className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
            {(['all', ...SECTIONS] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={section === s}
                onClick={() => setSection(s)}
                className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold ring-1 ${
                  section === s ? 'bg-brand text-on-brand ring-brand' : 'bg-surface text-ink ring-line'
                }`}
              >
                {s === 'all' ? 'All' : title(s)}
              </button>
            ))}
          </div>
        </>
      }
    >
      {results.length === 0 ? (
        <p className="py-10 text-center text-muted">
          No match for “{query}”. Adding your own ingredients is coming later.
        </p>
      ) : searching ? (
        <ul className="flex flex-col gap-2">
          {results.map((item) => (
            <PickerRow key={item.id} item={item} selected={item.id === selectedId} onPick={onPick} showSection />
          ))}
        </ul>
      ) : (
        <GroupedList items={results} selectedId={selectedId} onPick={onPick} />
      )}
    </Sheet>
  );
}

function GroupedList({
  items,
  selectedId,
  onPick,
}: {
  items: CatalogIngredient[];
  selectedId: string | undefined;
  onPick: (item: CatalogIngredient) => void;
}) {
  // items arrive sorted by section, then subsection.
  const groups: { section: Section; subsection: string; items: CatalogIngredient[] }[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last && last.section === item.section && last.subsection === item.subsection) last.items.push(item);
    else groups.push({ section: item.section, subsection: item.subsection, items: [item] });
  }
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g, idx) => (
        <section key={`${g.section}/${g.subsection}`} aria-label={`${title(g.section)}: ${g.subsection}`}>
          {idx === 0 || groups[idx - 1]?.section !== g.section ? (
            <h3 className="mb-1 mt-2 text-lg font-bold">{title(g.section)}</h3>
          ) : null}
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{g.subsection}</h4>
          <ul className="flex flex-col gap-2">
            {g.items.map((item) => (
              <PickerRow key={item.id} item={item} selected={item.id === selectedId} onPick={onPick} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function PickerRow({
  item,
  selected,
  onPick,
  showSection = false,
}: {
  item: CatalogIngredient;
  selected: boolean;
  onPick: (item: CatalogIngredient) => void;
  showSection?: boolean;
}) {
  const detail = [
    showSection ? `${title(item.section)} · ${item.subsection}` : null,
    item.perishable ? `keeps ${item.shelfLifeDays}d` : null,
    `by ${item.units.join(' / ')}`,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(item)}
        aria-current={selected ? 'true' : undefined}
        className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-2 text-left ring-1 hover:ring-brand ${
          selected ? 'ring-2 ring-brand' : 'ring-line'
        }`}
      >
        <span className="min-w-0">
          <span className="block font-semibold">{item.name}</span>
          <span className="block truncate text-sm text-muted">{detail}</span>
        </span>
        {selected ? <CheckIcon className="shrink-0 text-brand" /> : null}
      </button>
    </li>
  );
}
