import { addDays, daysBetween, eachDay, formatShort, toIsoDate } from './dates';
import { formatQty } from './quantity';

describe('dates', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('is not affected by daylight-saving changes', () => {
    expect(daysBetween('2026-11-01', '2026-11-02')).toBe(1);
    expect(daysBetween('2026-03-08', '2026-03-07')).toBe(-1);
  });
  it('lists each day inclusive', () => {
    expect(eachDay('2026-10-30', '2026-11-02')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
  });
  it('formats dates', () => {
    expect(formatShort('2026-10-05')).toBe('Mon Oct 5');
    expect(toIsoDate(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('formatQty', () => {
  it.each([
    [2, '2'],
    [0.25, '¼'],
    [1.5, '1½'],
    [0.333, '⅓'],
    [1.2, '1.2'],
  ])('%s -> %s', (n, s) => expect(formatQty(n)).toBe(s));
});
