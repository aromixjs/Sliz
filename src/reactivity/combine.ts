import { obs } from "./obs";
import type { Observable, CombinedArray, CombinedObject } from "./types";

export function combine<const T extends readonly Observable<any>[]>(
  signals: T
): Observable<CombinedArray<T>>;
export function combine<const T extends Record<string, Observable<any>>>(
  signals: T
): Observable<CombinedObject<T>>;
export function combine(signals: any): Observable<any> {
  const isArray = Array.isArray(signals);

  const snapshot = () =>
    isArray
      ? signals.map((s: Observable<any>) => s())
      : Object.fromEntries(
          Object.keys(signals).map((k) => [k, signals[k]()])
        );

  const combined = obs(snapshot());

  const subscribe = (s: Observable<any>) =>
    s.subscribe(() => combined.set(snapshot()));

  if (isArray) {
    signals.forEach(subscribe);
  } else {
    for (const key in signals) subscribe(signals[key]);
  }

  return combined;
}
