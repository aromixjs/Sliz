import { tokenize, SyntaxKind } from "@/src";
import { describe, it, expect } from "vitest";

describe("tag attribute anomalies", () => {

   it("expression with > comparison in attribute", () => {
      const tokens = tokenize("<div class={a > b}>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("expression with < comparison in attribute", () => {
      const tokens = tokenize("<div class={a < b}>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("expression with || in attribute", () => {
      const tokens = tokenize("<div class={a || b}>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("expression with && in attribute", () => {
      const tokens = tokenize("<div class={a && b}>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("multiple expressions in attributes", () => {
      const tokens = tokenize("<div class={a} id={b}>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("unterminated expression in attribute", () => {
      const tokens = tokenize("<div class={unclosed>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.UnterminatedExpression,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("unterminated expression EOF", () => {
      const tokens = tokenize("<div class={unclosed");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.UnterminatedExpression,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("} in unquoted attribute value", () => {
      const tokens = tokenize("<div class=test}>");

      expect(tokens[0]).toEqual({ kind: SyntaxKind.LessThan, start: 0, end: 1, value: "<" });
      expect(tokens[1]).toEqual({ kind: SyntaxKind.TagName, start: 1, end: 4, value: "div" });
      expect(tokens[2]).toEqual({ kind: SyntaxKind.AttributeName, start: 5, end: 10, value: "class" });
      expect(tokens[3]).toEqual({ kind: SyntaxKind.Equals, start: 10, end: 11, value: "=" });
      expect(tokens[4]).toEqual({ kind: SyntaxKind.AttributeValue, start: 11, end: 16, value: "test}" });
      expect(tokens[5]).toEqual({ kind: SyntaxKind.GreaterThan, start: 16, end: 17, value: ">" });
      expect(tokens[6].kind).toBe(SyntaxKind.EndOfFile);
   });

   it("} in attribute value then expression", () => {
      const tokens = tokenize("<div class=test}>{{data</div>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.AttributeValue,
         SyntaxKind.GreaterThan,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.UnterminatedExpression,
         SyntaxKind.LessThan,
         SyntaxKind.Slash,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("self-closing with expression", () => {
      const tokens = tokenize("<div class={expr} />");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.SlashGreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("expression with ternary", () => {
      const tokens = tokenize("<div class={a ? b : c}>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("expression with string containing special chars", () => {
      const tokens = tokenize("<div class={'hello'}>");
      const exprTokens = tokens.filter(t => t.kind === SyntaxKind.JsExpression);

      expect(exprTokens).toHaveLength(1);
      expect(exprTokens[0].value).toBe("'hello'");
   });

   it("boolean attribute", () => {
      const tokens = tokenize("<div disabled>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("attribute with missing value after =", () => {
      const tokens = tokenize("<div class= >");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("unterminated quoted attribute value", () => {
      const tokens = tokenize('<div class="unclosed');
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.AttributeValue,
         SyntaxKind.UnterminatedString,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("unquoted value with || after } does not loop", () => {
      const tokens = tokenize("<div class=test} || }}>{{data 123</div>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.AttributeValue,
         SyntaxKind.UnexpectedCharacter,
         SyntaxKind.UnexpectedCharacter,
         SyntaxKind.UnexpectedCharacter,
         SyntaxKind.UnexpectedCharacter,
         SyntaxKind.GreaterThan,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.UnterminatedExpression,
         SyntaxKind.LessThan,
         SyntaxKind.Slash,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });
});

describe("malformed tags", () => {

   it("bare <", () => {
      const tokens = tokenize("<");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.ExpectedTagName,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("bare </", () => {
      const tokens = tokenize("</");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.ExpectedTagName,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("</>", () => {
      const tokens = tokenize("</>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.ExpectedTagName,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("extra } before >", () => {
      const tokens = tokenize("<div }>>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.UnexpectedCharacter,
         SyntaxKind.GreaterThan,
         SyntaxKind.Text,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("empty braces inside tag", () => {
      const tokens = tokenize("<div {}>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.UnexpectedCharacter,
         SyntaxKind.UnexpectedCharacter,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });
});

describe("raw text tags", () => {

   it("script with < operator", () => {
      const tokens = tokenize("<script>if(a<b){}</script>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.Script,
         SyntaxKind.LessThan,
         SyntaxKind.Slash,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("unterminated script", () => {
      const tokens = tokenize("<script>code");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.UnterminatedScript,
         SyntaxKind.Script,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("style tag", () => {
      const tokens = tokenize("<style>.a{color:red}</style>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.Style,
         SyntaxKind.LessThan,
         SyntaxKind.Slash,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("unterminated style", () => {
      const tokens = tokenize("<style>css");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.UnterminatedStyle,
         SyntaxKind.Style,
         SyntaxKind.EndOfFile,
      ]);
   });
});

describe("comments and declarations", () => {

   it("unterminated comment", () => {
      const tokens = tokenize("<!-- comment");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.HtmlComment,
         SyntaxKind.UnterminatedComment,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("unterminated doctype", () => {
      const tokens = tokenize("<!DOCTYPE html");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.Doctype,
         SyntaxKind.UnterminatedDoctype,
         SyntaxKind.EndOfFile,
      ]);
   });
});

describe("full tag lifecycle", () => {

   it("div with expression then content then closing", () => {
      const tokens = tokenize("<div class={expr}>text</div>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.AttributeName,
         SyntaxKind.Equals,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.GreaterThan,
         SyntaxKind.Text,
         SyntaxKind.LessThan,
         SyntaxKind.Slash,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });

   it("nested divs with expressions", () => {
      const tokens = tokenize("<div>{a}<span>{b}</span></div>");
      const kinds = tokens.map(t => t.kind);

      expect(kinds).toEqual([
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.LessThan,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.OpenBrace,
         SyntaxKind.JsExpression,
         SyntaxKind.CloseBrace,
         SyntaxKind.LessThan,
         SyntaxKind.Slash,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.LessThan,
         SyntaxKind.Slash,
         SyntaxKind.TagName,
         SyntaxKind.GreaterThan,
         SyntaxKind.EndOfFile,
      ]);
   });
});
