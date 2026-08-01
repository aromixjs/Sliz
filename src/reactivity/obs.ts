import type { Observable, Subscription } from "./types";

export type { Observable, Subscription };

export function obs<T>(initialValue: T): Observable<T> {
  let value = initialValue;
  const subscribers = new Set<(old: T, next: T) => void>();

  const signal: Observable<T> = () => value;

  signal.set = (next) => {
    const prev = value;
    if (Object.is(prev, next)) return;
    value = next;
    for (const fn of subscribers) fn(prev, next);
  };

  signal.update = (fn) => signal.set(fn(value));

  signal.subscribe = (callback): Subscription => {
    subscribers.add(callback);
    return { destroy: () => subscribers.delete(callback) };
  };

  signal.derived = <U>(mapper: (v: T) => U): Observable<U> => {
    const d = obs(mapper(value));
    signal.subscribe((_, v) => d.set(mapper(v)));
    return d;
  };

  return signal;
}
