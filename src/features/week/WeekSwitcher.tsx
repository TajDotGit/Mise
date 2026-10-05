import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import { formatShort } from '../../domain/dates';
import { useWeek } from './WeekContext';

export function WeekSwitcher() {
  const { range, isCurrentWeek, shiftWeek, resetWeek } = useWeek();
  return (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-line">
      <button
        type="button"
        onClick={() => shiftWeek(-1)}
        aria-label="Previous week"
        className="grid size-12 place-items-center rounded-xl text-muted hover:bg-cream"
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        onClick={resetWeek}
        disabled={isCurrentWeek}
        className="min-h-12 flex-1 rounded-xl text-center font-semibold disabled:cursor-default"
      >
        {formatShort(range.start)} – {formatShort(range.end)}
        {!isCurrentWeek ? <span className="block text-xs font-medium text-brand">Back to this week</span> : null}
      </button>
      <button
        type="button"
        onClick={() => shiftWeek(1)}
        aria-label="Next week"
        className="grid size-12 place-items-center rounded-xl text-muted hover:bg-cream"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
