import { daysBetween, formatShort } from '../../domain/dates';
import type { IsoDate } from '../../domain/schemas';

export function dayLabel(date: IsoDate, today: IsoDate): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return formatShort(date);
}
