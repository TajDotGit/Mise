import { CATEGORIES, type Category } from '../../domain/schemas';
import { XIcon } from '../../components/icons';
import type { FieldErrors, IngredientDraft } from './formModel';

const input = 'min-h-12 w-full rounded-xl border border-line bg-white px-3';
const UNITS = ['each', 'lb', 'oz', 'g', 'kg', 'cup', 'tbsp', 'tsp', 'ml', 'l', 'can', 'box', 'bunch', 'head', 'clove', 'slice'];

function Err({ msg }: { msg: string | undefined }) {
  return msg ? <p className="mt-1 text-sm text-danger">{msg}</p> : null;
}

export function IngredientRow({
  index,
  value,
  errors,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  value: IngredientDraft;
  errors: FieldErrors;
  onChange: (next: IngredientDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const set = <K extends keyof IngredientDraft>(key: K, v: IngredientDraft[K]) => onChange({ ...value, [key]: v });
  const e = (field: string) => errors[`ingredients.${index}.${field}`];
  const n = index + 1;

  return (
    <fieldset className="rounded-2xl border border-line bg-cream p-3">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-bold text-muted">Ingredient {n}</legend>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ingredient ${n}`}
            className="grid size-10 place-items-center rounded-full text-muted hover:bg-line/50"
          >
            <XIcon />
          </button>
        ) : null}
      </div>
      <label className="mt-1 block">
        <span className="sr-only">Ingredient {n} name</span>
        <input className={input} placeholder="Name, e.g. Ground beef" value={value.name} onChange={(ev) => set('name', ev.target.value)} />
        <Err msg={e('name')} />
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label>
          <span className="sr-only">Ingredient {n} quantity</span>
          <input className={input} inputMode="decimal" placeholder="Qty" value={value.quantity} onChange={(ev) => set('quantity', ev.target.value)} />
          <Err msg={e('quantity')} />
        </label>
        <label>
          <span className="sr-only">Ingredient {n} unit</span>
          <input className={input} list="unit-options" placeholder="Unit" value={value.unit} onChange={(ev) => set('unit', ev.target.value)} />
          <Err msg={e('unit')} />
        </label>
      </div>
      <label className="mt-2 block">
        <span className="sr-only">Ingredient {n} category</span>
        <select className={input} value={value.category} onChange={(ev) => set('category', ev.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c[0]?.toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-2 flex min-h-12 items-center gap-3">
        <input type="checkbox" className="size-5 accent-brand" checked={value.perishable} onChange={(ev) => set('perishable', ev.target.checked)} />
        <span className="font-medium">Perishable</span>
      </label>
      {value.perishable ? (
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-sm text-muted">Keeps (days)</span>
            <input className={input} inputMode="numeric" value={value.shelfLifeDays} onChange={(ev) => set('shelfLifeDays', ev.target.value)} />
            <Err msg={e('shelfLifeDays')} />
          </label>
          <label>
            <span className="text-sm text-muted">Pack size ({value.unit || 'unit'})</span>
            <input className={input} inputMode="decimal" placeholder="optional" value={value.packSize} onChange={(ev) => set('packSize', ev.target.value)} />
            <Err msg={e('packSize')} />
          </label>
        </div>
      ) : null}
    </fieldset>
  );
}

export function UnitOptions() {
  return (
    <datalist id="unit-options">
      {UNITS.map((u) => (
        <option key={u} value={u} />
      ))}
    </datalist>
  );
}
