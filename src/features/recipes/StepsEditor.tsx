import { Button } from '../../components/Button';
import { PlusIcon, XIcon } from '../../components/icons';
import type { FieldErrors } from './formModel';

/** A short numbered list of memory-jogger steps. Blank rows are ignored on save. */
export function StepsEditor({
  steps,
  errors,
  onChange,
}: {
  steps: string[];
  errors: FieldErrors;
  onChange: (steps: string[]) => void;
}) {
  return (
    <>
      <ol className="mt-2 flex flex-col gap-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
              {i + 1}
            </span>
            <label className="flex-1">
              <span className="sr-only">Step {i + 1}</span>
              <input
                className="min-h-12 w-full rounded-xl border border-line bg-surface px-3"
                placeholder={i === 0 ? 'e.g. Brown the beef with onion' : 'Next step'}
                value={step}
                maxLength={300}
                onChange={(e) => onChange(steps.map((s, j) => (j === i ? e.target.value : s)))}
              />
              {errors[`steps.${i}`] ? <p className="mt-1 text-sm text-danger">{errors[`steps.${i}`]}</p> : null}
            </label>
            {steps.length > 1 ? (
              <button
                type="button"
                aria-label={`Remove step ${i + 1}`}
                onClick={() => onChange(steps.filter((_, j) => j !== i))}
                className="grid size-12 shrink-0 place-items-center rounded-full text-muted hover:bg-line/50"
              >
                <XIcon />
              </button>
            ) : null}
          </li>
        ))}
      </ol>
      {steps.length < 30 ? (
        <Button variant="secondary" className="mt-3 w-full" onClick={() => onChange([...steps, ''])}>
          <PlusIcon /> Add step
        </Button>
      ) : null}
    </>
  );
}
