export interface Subscription {
  destroy(): void;
}

export interface Observable<T> {
  (): T;
  set(value: T): void;
  update(updater: (value: T) => T): void;
  derived<U>(mapper: (value: T) => U): Observable<U>;
  subscribe(callback: (oldValue: T, newValue: T) => void): Subscription;
}

export type ObservableValue<T> = T extends Observable<infer U> ? U : never;

export type CombinedArray<T extends readonly Observable<any>[]> = {
  [K in keyof T]: ObservableValue<T[K]>;
};

export type CombinedObject<T extends Record<string, Observable<any>>> = {
  [K in keyof T]: ObservableValue<T[K]>;
};
