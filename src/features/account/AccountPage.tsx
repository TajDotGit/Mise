import { useState } from 'react';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { useToday } from '../../data/ClockContext';
import { useCatalog, useHousehold } from '../../data/hooks';
import { useRepositories } from '../../data/RepositoryContext';
import { exportData } from './exportData';
import { ComingSoon, PlannedAction, SettingsRow, SettingsSection } from './SettingsRow';
import { ThemeSwitch } from './ThemeSwitch';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function AccountPage() {
  const repos = useRepositories();
  const today = useToday();
  const { data: household } = useHousehold();
  const { items } = useCatalog();
  const [exporting, setExporting] = useState(false);

  const runExport = async () => {
    setExporting(true);
    try {
      await exportData(repos, today);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader title="Account" />

      <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand">
          ?
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Not signed in</p>
          <p className="text-sm text-muted">Using this device only</p>
        </div>
        <ComingSoon />
      </div>

      <section className="mt-6" aria-label="Appearance">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Appearance</h2>
        <ThemeSwitch />
      </section>

      <SettingsSection title="Household">
        <SettingsRow label={household?.name ?? '…'} description="Everyone in a household shares recipes, plans, and lists." />
        {household?.members.map((m) => (
          <SettingsRow
            key={m.id}
            label={
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                  {initials(m.displayName)}
                </span>
                {m.displayName}
              </span>
            }
          >
            <span className="text-sm text-muted">{m.role === 'owner' ? 'Owner' : 'Member'}</span>
          </SettingsRow>
        ))}
        <PlannedAction label="Invite to household" description="Send a sign-in link to join" />
        <PlannedAction label="Rename household" />
      </SettingsSection>

      <SettingsSection title="Sync">
        <SettingsRow label="Status" description="Data lives in this browser tab and resets on reload.">
          <span className="shrink-0 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-semibold text-warn">Local only</span>
        </SettingsRow>
        <PlannedAction label="Sync now" description="Keep both phones up to date" />
        <PlannedAction label="Calendar feed" description="See planned dinners in your calendar app" />
      </SettingsSection>

      <SettingsSection title="Data">
        <SettingsRow label="Export recipes and plan" description="Download a JSON copy of this household's data.">
          <Button variant="secondary" className="shrink-0" disabled={exporting} onClick={() => void runExport()}>
            Export
          </Button>
        </SettingsRow>
        <PlannedAction label="Import data" description="Restore from an export file" />
        <SettingsRow label="Ingredient catalog" description="Pre-loaded so names and units stay consistent.">
          <span className="shrink-0 text-sm text-muted">{items.length} items</span>
        </SettingsRow>
        <PlannedAction label="Add custom ingredient" />
      </SettingsSection>

      <SettingsSection title="Account">
        <PlannedAction label="Sign in with email link" />
        <PlannedAction label="Notifications" description="Reminders before food expires" />
        <PlannedAction label="Sign out" />
        <PlannedAction label="Delete account and data" />
      </SettingsSection>

      <p className="mt-8 text-center text-sm text-muted">Mise · Phase 0 prototype</p>
    </>
  );
}
