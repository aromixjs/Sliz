import { describe, it, expect } from "vitest";
import { obs } from "../../src/reactivity/obs";
import { combine } from "../../src/reactivity/combine";

describe("combine", () => {
  it("combines array of observables", () => {
    const a = obs(1);
    const b = obs(2);
    const combined = combine([a, b]);

    expect(combined()).toEqual([1, 2]);
  });

  it("combines object of observables", () => {
    const a = obs("hello");
    const b = obs(42);
    const combined = combine({ a, b });

    expect(combined()).toEqual({ a: "hello", b: 42 });
  });

  it("updates when any array signal changes", () => {
    const a = obs(1);
    const b = obs(2);
    const combined = combine([a, b]);

    a.set(10);
    expect(combined()).toEqual([10, 2]);

    b.set(20);
    expect(combined()).toEqual([10, 20]);
  });

  it("updates when any object signal changes", () => {
    const x = obs(1);
    const y = obs(2);
    const combined = combine({ x, y });

    x.set(100);
    expect(combined()).toEqual({ x: 100, y: 2 });
  });

  it("notifies subscribers on combined", () => {
    const a = obs(0);
    const b = obs(0);
    const combined = combine([a, b]);
    const calls: number[][] = [];

    combined.subscribe((_, v) => calls.push(v));

    a.set(1);
    b.set(2);

    expect(calls).toEqual([[1, 0], [1, 2]]);
  });

  it("works with three signals", () => {
    const a = obs(1);
    const b = obs(2);
    const c = obs(3);
    const combined = combine([a, b, c]);

    expect(combined()).toEqual([1, 2, 3]);

    b.set(99);
    expect(combined()).toEqual([1, 99, 3]);
  });
});
