import type { Unsubscribe } from '../repositories';

export class Emitter {
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void): Unsubscribe => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  emit(): void {
    for (const l of this.listeners) l();
  }
}

let counter = 0;
/** Ids for in-memory data only (crypto.randomUUID needs a secure context). */
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}
