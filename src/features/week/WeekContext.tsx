import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useToday } from '../../data/ClockContext';
import { addDays } from '../../domain/dates';
import type { DateRange, IsoDate } from '../../domain/schemas';

interface WeekState {
  range: DateRange;
  isCurrentWeek: boolean;
  shiftWeek: (weeks: number) => void;
  resetWeek: () => void;
}

const WeekContext = createContext<WeekState | null>(null);

/** The 7-day window shared by the plan, grocery list, and use-soon screens. Starts today. */
export function WeekProvider({ children }: { children: ReactNode }) {
  const today = useToday();
  const [start, setStart] = useState<IsoDate>(today);
  const value = useMemo<WeekState>(
    () => ({
      range: { start, end: addDays(start, 6) },
      isCurrentWeek: start === today,
      shiftWeek: (weeks) => setStart((s) => addDays(s, weeks * 7)),
      resetWeek: () => setStart(today),
    }),
    [start, today],
  );
  return <WeekContext value={value}>{children}</WeekContext>;
}

export function useWeek(): WeekState {
  const week = useContext(WeekContext);
  if (!week) throw new Error('useWeek must be used inside <WeekProvider>');
  return week;
}
