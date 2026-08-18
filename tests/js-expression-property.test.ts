import * as fc from "fast-check";
import { JsInterpolationResolver, JsInterpolationStatus } from "@/src";
import { describe, expect, it } from "vitest";

const validStatuses = [
  JsInterpolationStatus.Closed,
  JsInterpolationStatus.UnterminatedLiteral,
  JsInterpolationStatus.UnterminatedEof,
];

const specialChars = fc.constantFrom(
  "{",
  "}",
  '"',
  "'",
  "`",
  "/",
  "*",
  "<",
  ">",
  "$",
  "\\",
  " ",
  "\n",
  "\t",
  "a",
  "b",
  "c",
  "=",
  "+",
  "-",
  ":",
  ";",
);

const codeString = fc.array(specialChars, { maxLength: 150 }).map((chars) => chars.join(""));

describe("JsInterpolationResolver property tests", () => {
  it("resolves an expression starting at a guaranteed { and keeps invariants", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const openIndex = prefix.length;
        const result = new JsInterpolationResolver(source).resolve(openIndex);

        expect(validStatuses).toContain(result.status);
        expect(result.start).toBe(openIndex);
        expect(result.end).toBeGreaterThanOrEqual(openIndex);
        expect(result.end).toBeLessThanOrEqual(source.length);
        expect(result.text).toBe(source.slice(openIndex, result.end));
        if (result.status === JsInterpolationStatus.Closed) {
          expect(source[result.end - 1]).toBe("}");
        }
      }),
    );
  });

  it("is deterministic for the same source and start", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const openIndex = prefix.length;
        const first = new JsInterpolationResolver(source).resolve(openIndex);
        const second = new JsInterpolationResolver(source).resolve(openIndex);

        expect(first.status).toBe(second.status);
        expect(first.start).toBe(second.start);
        expect(first.end).toBe(second.end);
        expect(first.text).toBe(second.text);
      }),
    );
  });

  it("when closed, end points right after a }", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const openIndex = prefix.length;
        const result = new JsInterpolationResolver(source).resolve(openIndex);

        if (result.status === JsInterpolationStatus.Closed) {
          expect(source[result.end - 1]).toBe("}");
        }
      }),
    );
  });

  it("when not closed, reports an unterminated outcome", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const openIndex = prefix.length;
        const result = new JsInterpolationResolver(source).resolve(openIndex);

        if (result.status !== JsInterpolationStatus.Closed) {
          expect(validStatuses).toContain(result.status);
          expect(result.status).not.toBe(JsInterpolationStatus.Closed);
        }
      }),
    );
  });

  it("never throws for an in-bounds start, returning a valid outcome", () => {
    fc.assert(
      fc.property(fc.string(), (source) => {
        const start = fc.sample(fc.integer({ min: 0, max: source.length }), 1)[0];
        let thrown: unknown = null;
        let result = null as ReturnType<JsInterpolationResolver["resolve"]> | null;
        try {
          result = new JsInterpolationResolver(source).resolve(start);
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeNull();
        if (result !== null && start < source.length) {
          expect(validStatuses).toContain(result.status);
          expect(result.start).toBe(start);
          expect(result.end).toBeGreaterThanOrEqual(start);
          expect(result.end).toBeLessThanOrEqual(source.length);
          expect(result.text).toBe(source.slice(start, result.end));
          if (result.status === JsInterpolationStatus.Closed) {
            expect(source[result.end - 1]).toBe("}");
          }
        }
      }),
    );
  });

  it("never throws for an out-of-range start, returning a defined outcome", () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 1 }), (source, offset) => {
        const start = source.length + offset;
        let thrown: unknown = null;
        let result = null as ReturnType<JsInterpolationResolver["resolve"]> | null;
        try {
          result = new JsInterpolationResolver(source).resolve(start);
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeNull();
        expect(result).not.toBeNull();
      }),
    );
  });

  it("produces in-bounds, content-matching outcomes for fully arbitrary input", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (source) => {
        const openIndex = source.indexOf("{");
        fc.pre(openIndex !== -1);
        const result = new JsInterpolationResolver(source).resolve(openIndex);

        expect(validStatuses).toContain(result.status);
        expect(result.start).toBe(openIndex);
        expect(result.end).toBeGreaterThanOrEqual(openIndex);
        expect(result.end).toBeLessThanOrEqual(source.length);
        expect(result.text).toBe(source.slice(openIndex, result.end));
        if (result.status === JsInterpolationStatus.Closed) {
          expect(source[result.end - 1]).toBe("}");
        }
      }),
    );
  });
});
