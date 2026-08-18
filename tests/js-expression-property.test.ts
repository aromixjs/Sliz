import * as fc from "fast-check";
import { JsExprTokenizer } from "@/src";
import { JsToken, JsTokenType } from "@/src/JsExpr/token";
import { describe, expect, it } from "vitest";

interface Outcome {
  tokens: JsToken[];
  closed: boolean;
  end: number;
}

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

function expectValidOutcome(source: string, result: Outcome): void {
  const tokens = result.tokens;
  expect(tokens.length).toBeGreaterThan(0);
  expect(result.closed).toBe(tokens[tokens.length - 1].type === JsTokenType.ExpressionEnd);
  expect(tokens[0].type).toBe(JsTokenType.ExpressionStart);

  for (const token of tokens) {
    expect(token.start).toBeGreaterThanOrEqual(0);
    expect(token.end).toBeLessThanOrEqual(source.length);
    expect(token.start).toBeLessThanOrEqual(token.end);

    switch (token.type) {
      case JsTokenType.RawJs: {
        const content = (token as { content: string }).content;
        expect(content.length).toBeGreaterThan(0);
        expect(content).toBe(source.slice(token.start, token.end).trim());
        break;
      }
      case JsTokenType.StringLiteral:
      case JsTokenType.TemplateLiteral:
      case JsTokenType.LineComment:
      case JsTokenType.BlockComment:
      case JsTokenType.UnterminatedString:
      case JsTokenType.UnterminatedTemplateLiteral:
      case JsTokenType.UnterminatedBlockComment: {
        const content = (token as { content: string }).content;
        expect(content).toBe(source.slice(token.start, token.end));
        break;
      }
      case JsTokenType.ExpressionStart: {
        expect(source.slice(token.start, token.end)).toBe("{");
        break;
      }
      case JsTokenType.ExpressionEnd: {
        expect(source.slice(token.start, token.end)).toBe("}");
        break;
      }
      case JsTokenType.TagLike: {
        expect(token.start).toBe(token.end);
        break;
      }
      case JsTokenType.UnterminatedExpression: {
        break;
      }
    }
  }
}

describe("JsExprTokenizer property tests", () => {
  it("tokenizes an expression starting at a guaranteed { and keeps invariants", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const start = prefix.length;
        const result = new JsExprTokenizer(source).tokenize(start);
        expectValidOutcome(source, result);
      }),
    );
  });

  it("is deterministic for the same source and start", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const start = prefix.length;
        const first = new JsExprTokenizer(source).tokenize(start);
        const second = new JsExprTokenizer(source).tokenize(start);
        expect(JSON.stringify(first.tokens)).toBe(JSON.stringify(second.tokens));
        expect(first.closed).toBe(second.closed);
        expect(first.end).toBe(second.end);
      }),
    );
  });

  it("when closed, end points right after a } and the last token is ExpressionEnd", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const start = prefix.length;
        const result = new JsExprTokenizer(source).tokenize(start);
        if (result.closed) {
          expect(source[result.end - 1]).toBe("}");
          expect(result.tokens[result.tokens.length - 1].type).toBe(JsTokenType.ExpressionEnd);
        }
      }),
    );
  });

  it("an unclosed, non-taglike expression ends in UnterminatedExpression", () => {
    fc.assert(
      fc.property(codeString, codeString, (prefix, suffix) => {
        const source = prefix + "{" + suffix;
        const start = prefix.length;
        const result = new JsExprTokenizer(source).tokenize(start);
        const last = result.tokens[result.tokens.length - 1];
        if (!result.closed && last.type !== JsTokenType.TagLike) {
          expect(last.type).toBe(JsTokenType.UnterminatedExpression);
        }
      }),
    );
  });

  it("never crashes: returns only at { and otherwise throws a safe Error", () => {
    fc.assert(
      fc.property(fc.string(), fc.integer(), (source, start) => {
        let thrown: unknown = null;
        let result: Outcome | null = null;
        try {
          result = new JsExprTokenizer(source).tokenize(start);
        } catch (error) {
          thrown = error;
        }
        if (thrown === null) {
          expect(source[start]).toBe("{");
          expectValidOutcome(source, result as Outcome);
        } else {
          expect(thrown).toBeInstanceOf(Error);
          expect(thrown).not.toBeInstanceOf(RangeError);
        }
      }),
    );
  });

  it("produces in-bounds, content-matching tokens for fully arbitrary input", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (source) => {
        const openIndex = source.indexOf("{");
        fc.pre(openIndex !== -1);
        const result = new JsExprTokenizer(source).tokenize(openIndex);
        expectValidOutcome(source, result);
      }),
    );
  });
});
