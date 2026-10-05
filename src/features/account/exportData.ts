import { addDays } from '../../domain/dates';
import type { IsoDate } from '../../domain/schemas';
import type { Repositories } from '../../data/repositories';

/** Gather this device's household data into a JSON file and hand it to the browser to save. */
export async function exportData(repos: Repositories, today: IsoDate): Promise<void> {
  const [household, recipes, plan] = await Promise.all([
    repos.household.get(),
    repos.recipes.list(),
    repos.plan.listRange({ start: addDays(today, -365), end: addDays(today, 365) }),
  ]);
  const payload = { app: 'mise', version: 1, exportedOn: today, household, recipes, plan };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mise-export-${today}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
