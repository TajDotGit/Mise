import { createContext, useContext, type ReactNode } from 'react';
import { toIsoDate } from '../domain/dates';
import type { IsoDate } from '../domain/schemas';

const ClockContext = createContext<IsoDate | null>(null);

/** Provides "today" so screens and tests share one deterministic date. */
export function ClockProvider({ today, children }: { today?: IsoDate; children: ReactNode }) {
  return <ClockContext value={today ?? toIsoDate(new Date())}>{children}</ClockContext>;
}

export function useToday(): IsoDate {
  return useContext(ClockContext) ?? toIsoDate(new Date());
}
