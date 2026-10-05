import type { Urgency } from '../domain/leftovers';

const styles: Record<Urgency, string> = {
  expired: 'bg-danger text-on-brand',
  today: 'bg-danger-soft text-danger',
  soon: 'bg-warn-soft text-warn',
  later: 'bg-ok-soft text-ok',
};

function urgencyLabel(level: Urgency, days: number): string {
  if (level === 'expired') return days === -1 ? 'Expired yesterday' : `Expired ${-days} days ago`;
  if (level === 'today') return 'Use today';
  return days === 1 ? '1 day left' : `${days} days left`;
}

export function UrgencyBadge({ level, days }: { level: Urgency; days: number }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-semibold ${styles[level]}`}>
      {urgencyLabel(level, days)}
    </span>
  );
}
