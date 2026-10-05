import { z } from 'zod';
import { isWithin } from '../../domain/dates';
import { DateRangeSchema, IsoDateSchema, PlanEntrySchema, type PlanEntry } from '../../domain/schemas';
import type { PlanRepository } from '../repositories';
import { Emitter, nextId } from './emitter';

const IdSchema = z.string().min(1).max(100);

export function createMemoryPlanRepository(seed: PlanEntry[] = []): PlanRepository {
  // Keyed by date: one dinner per day.
  const byDate = new Map<string, PlanEntry>(seed.map((e) => [e.date, PlanEntrySchema.parse(e)]));
  const emitter = new Emitter();

  return {
    subscribe: emitter.subscribe,
    async listRange(range) {
      const { start, end } = DateRangeSchema.parse(range);
      return [...byDate.values()]
        .filter((e) => isWithin(e.date, start, end))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({ ...e }));
    },
    async assign(date, recipeId) {
      const entry = PlanEntrySchema.parse({ id: byDate.get(date)?.id ?? nextId('plan'), date, recipeId });
      byDate.set(entry.date, entry);
      emitter.emit();
      return { ...entry };
    },
    async clear(date) {
      byDate.delete(IsoDateSchema.parse(date));
      emitter.emit();
    },
    async removeRecipe(recipeId) {
      const id = IdSchema.parse(recipeId);
      for (const [date, e] of byDate) if (e.recipeId === id) byDate.delete(date);
      emitter.emit();
    },
  };
}
