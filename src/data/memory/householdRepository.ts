import { z } from 'zod';
import { HouseholdSchema, type Household } from '../../domain/schemas';
import type { HouseholdRepository } from '../repositories';
import { Emitter } from './emitter';

const NameSchema = z.string().trim().min(1, 'Required').max(60);

export function createMemoryHouseholdRepository(seed: Household): HouseholdRepository {
  let household = HouseholdSchema.parse(seed);
  const emitter = new Emitter();
  return {
    subscribe: emitter.subscribe,
    async get() {
      return structuredClone(household);
    },
    async rename(name) {
      household = { ...household, name: NameSchema.parse(name) };
      emitter.emit();
      return structuredClone(household);
    },
  };
}
