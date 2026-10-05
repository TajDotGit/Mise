import type { ReactNode } from 'react';

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6" aria-label={title}>
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      <ul className="overflow-hidden rounded-3xl border border-line bg-surface">{children}</ul>
    </section>
  );
}

export function ComingSoon() {
  return <span className="shrink-0 rounded-full bg-line/60 px-2.5 py-1 text-xs font-semibold text-muted">Coming soon</span>;
}

/** One settings line: label + description on the left, a control or badge on the right. */
export function SettingsRow({
  label,
  description,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className="flex min-h-16 items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="font-semibold">{label}</div>
        {description ? <div className="text-sm text-muted">{description}</div> : null}
      </div>
      {children}
    </li>
  );
}

/** A full-width row button for actions that aren't wired up yet: visible, but clearly inactive. */
export function PlannedAction({ label, description }: { label: string; description?: string }) {
  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        disabled
        className="flex min-h-16 w-full cursor-not-allowed items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-muted">{label}</span>
          {description ? <span className="block text-sm text-muted">{description}</span> : null}
        </span>
        <ComingSoon />
      </button>
    </li>
  );
}
