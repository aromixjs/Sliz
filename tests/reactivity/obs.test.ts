import { describe, it, expect } from "vitest";
import { obs } from "../../src/reactivity/obs";

describe("obs", () => {
  it("returns initial value", () => {
    const signal = obs(42);
    expect(signal()).toBe(42);
  });

  it("set updates value", () => {
    const signal = obs(1);
    signal.set(2);
    expect(signal()).toBe(2);
  });

  it("update transforms value", () => {
    const signal = obs(10);
    signal.update((v) => v * 2);
    expect(signal()).toBe(20);
  });

  it("notify subscribers on set", () => {
    const signal = obs(0);
    let received: [number, number] | null = null;
    signal.subscribe((oldVal, newVal) => {
      received = [oldVal, newVal];
    });
    signal.set(5);
    expect(received).toEqual([0, 5]);
  });

  it("does not notify if value unchanged", () => {
    const signal = obs(7);
    let called = false;
    signal.subscribe(() => { called = true; });
    signal.set(7);
    expect(called).toBe(false);
  });

  it("unsubscribe stops notifications", () => {
    const signal = obs(0);
    let callCount = 0;
    const sub = signal.subscribe(() => { callCount++; });
    signal.set(1);
    sub.destroy();
    signal.set(2);
    expect(callCount).toBe(1);
  });

  it("derived creates dependent observable", () => {
    const signal = obs(3);
    const doubled = signal.derived((v) => v * 10);
    expect(doubled()).toBe(30);
    signal.set(5);
    expect(doubled()).toBe(50);
  });

  it("works with objects", () => {
    const signal = obs({ a: 1 });
    signal.set({ a: 2 });
    expect(signal()).toEqual({ a: 2 });
  });

  it("multiple subscribers all called", () => {
    const signal = obs(0);
    const results: number[] = [];
    signal.subscribe((_, v) => results.push(v));
    signal.subscribe((_, v) => results.push(v * 10));
    signal.set(3);
    expect(results).toEqual([3, 30]);
  });
});
