import { z } from 'zod';
import type { GroceryRepository } from '../repositories';
import { Emitter } from './emitter';

const KeySchema = z.string().min(1).max(200);

export function createMemoryGroceryRepository(): GroceryRepository {
  const checked = new Set<string>();
  const emitter = new Emitter();
  return {
    subscribe: emitter.subscribe,
    async checkedKeys() {
      return new Set(checked);
    },
    async setChecked(key, value) {
      const k = KeySchema.parse(key);
      if (z.boolean().parse(value)) checked.add(k);
      else checked.delete(k);
      emitter.emit();
    },
  };
}
