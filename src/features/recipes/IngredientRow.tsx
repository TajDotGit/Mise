import { useState } from 'react';
import { ChevronRightIcon, XIcon } from '../../components/icons';
import { formatQty } from '../../domain/quantity';
import type { CatalogIngredient, IngredientCatalog, Unit } from '../../domain/schemas';
import type { FieldErrors, IngredientDraft } from './formModel';
import { IngredientPicker } from './IngredientPicker';

const field = 'min-h-12 w-full rounded-xl border border-line bg-surface px-3';

function Err({ id, msg }: { id: string; msg: string | undefined }) {
  return msg ? (
    <p id={id} className="mt-1 text-sm text-danger">
      {msg}
    </p>
  ) : null;
}

export function IngredientRow({
  index,
  value,
  errors,
  catalog,
  items,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  value: IngredientDraft;
  errors: FieldErrors;
  catalog: IngredientCatalog;
  items: CatalogIngredient[];
  onChange: (next: IngredientDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const item = catalog.get(value.ingredientId);
  const n = index + 1;
  const e = (f: string) => errors[`ingredients.${index}.${f}`];
  const errId = (f: string) => `ing-${index}-${f}-error`;

  const pick = (picked: CatalogIngredient) => {
    // Autofill the unit: keep the current one if the new ingredient allows it, else use its default.
    const unit = value.unit && picked.units.includes(value.unit as Unit) ? value.unit : (picked.units[0] as Unit);
    onChange({ ...value, ingredientId: picked.id, unit });
    setPicking(false);
  };

  return (
    <li className="rounded-2xl border border-line bg-canvas p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
          {n}
        </span>
        <button
          type="button"
          onClick={() => setPicking(true)}
          aria-label={`Ingredient ${n}: ${item ? item.name : 'choose ingredient'}`}
          aria-describedby={e('ingredientId') ? errId('ingredientId') : undefined}
          className={`flex min-h-12 flex-1 items-center justify-between gap-2 rounded-xl border bg-surface px-3 text-left ${
            e('ingredientId') ? 'border-danger' : 'border-line'
          }`}
        >
          <span className={item ? 'font-semibold' : 'text-muted'}>{item ? item.name : 'Choose ingredient'}</span>
          <ChevronRightIcon className="shrink-0 text-muted" />
        </button>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ingredient ${n}`}
            className="grid size-12 shrink-0 place-items-center rounded-full text-muted hover:bg-line/50"
          >
            <XIcon />
          </button>
        ) : null}
      </div>
      <Err id={errId('ingredientId')} msg={e('ingredientId')} />

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label>
          <span className="sr-only">Ingredient {n} quantity</span>
          <input
            className={field}
            inputMode="decimal"
            placeholder="Qty"
            value={value.quantity}
            aria-invalid={Boolean(e('quantity'))}
            aria-describedby={e('quantity') ? errId('quantity') : undefined}
            onChange={(ev) => onChange({ ...value, quantity: ev.target.value })}
          />
          <Err id={errId('quantity')} msg={e('quantity')} />
        </label>
        <label>
          <span className="sr-only">Ingredient {n} unit</span>
          <select
            className={`${field} disabled:opacity-60`}
            value={value.unit}
            disabled={!item}
            aria-invalid={Boolean(e('unit'))}
            onChange={(ev) => onChange({ ...value, unit: ev.target.value as Unit })}
          >
            {!item ? <option value="">Unit</option> : null}
            {item?.units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <Err id={errId('unit')} msg={e('unit')} />
        </label>
      </div>
      {item?.perishable ? (
        <p className="mt-2 text-sm text-muted">
          Fresh · keeps {item.shelfLifeDays} days
          {item.packSize ? ` · sold in ${formatQty(item.packSize)} ${item.units[0]} packs` : ''}
        </p>
      ) : null}

      {picking ? (
        <IngredientPicker items={items} selectedId={value.ingredientId} onPick={pick} onClose={() => setPicking(false)} />
      ) : null}
    </li>
  );
}
