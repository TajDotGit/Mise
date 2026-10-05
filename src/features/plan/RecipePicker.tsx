import { useState } from 'react';
import { Sheet } from '../../components/Sheet';
import type { Recipe } from '../../domain/schemas';

export function RecipePicker({
  title,
  recipes,
  suggestedIds = [],
  onPick,
  onClose,
}: {
  title: string;
  recipes: Recipe[];
  suggestedIds?: string[];
  onPick: (recipeId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = recipes
    .filter((r) => r.name.toLowerCase().includes(q))
    .sort((a, b) => Number(suggestedIds.includes(b.id)) - Number(suggestedIds.includes(a.id)));

  return (
    <Sheet title={title} onClose={onClose}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes"
        aria-label="Search recipes"
        className="mb-3 min-h-12 w-full rounded-2xl border border-line bg-white px-4"
      />
      <ul className="flex flex-col gap-2">
        {filtered.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onPick(r.id)}
              className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-left ring-1 ring-line hover:ring-brand"
            >
              <span className="font-semibold">{r.name}</span>
              {suggestedIds.includes(r.id) ? (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                  Uses leftovers
                </span>
              ) : null}
            </button>
          </li>
        ))}
        {filtered.length === 0 ? <li className="py-6 text-center text-muted">No recipes match.</li> : null}
      </ul>
    </Sheet>
  );
}
