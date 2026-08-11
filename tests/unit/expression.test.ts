import { TokenizerContext, SyntaxKind, consume, tokenize } from "@/src"

import { describe, it, expect } from "vitest";


describe('consume.expression', () => {

   it('tokenizes a simple expression terminated by }', () => {
      const ctx = new TokenizerContext('{data.id}')
      consume.expression(ctx)

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "data.id" },
         { kind: SyntaxKind.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   })

   it("tokenizes an expression containing a string literal with an embedded quote-like char", () => {
      const ctx = new TokenizerContext("{'<data'}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "'<data'" },
         { kind: SyntaxKind.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   });

   it("handles expression with nested braces", () => {
      const ctx = new TokenizerContext("{a + {b}}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "a + {b}" },
         { kind: SyntaxKind.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   });

   it("handles expression with double-quoted string containing }", () => {
      const ctx = new TokenizerContext('{"}"}');
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 4, value: '"}"' },
         { kind: SyntaxKind.CloseBrace, start: 4, end: 5, value: "}" },
      ]);
   });

   it("handles expression with single-quoted string containing {", () => {
      const ctx = new TokenizerContext("{'{'}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 4, value: "'{'" },
         { kind: SyntaxKind.CloseBrace, start: 4, end: 5, value: "}" },
      ]);
   });

   it("handles expression with escaped closing brace", () => {
      const ctx = new TokenizerContext("{\\}}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 3, value: "\\}" },
         { kind: SyntaxKind.CloseBrace, start: 3, end: 4, value: "}" },
      ]);
   });

   it("handles expression followed by closing tag", () => {
      const ctx = new TokenizerContext("{data.id}</div>");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "data.id" },
         { kind: SyntaxKind.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   });

   it("handles expression with < comparison operator", () => {
      const ctx = new TokenizerContext("{a < b}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 6, value: "a < b" },
         { kind: SyntaxKind.CloseBrace, start: 6, end: 7, value: "}" },
      ]);
   });

   it("handles expression with && operator", () => {
      const ctx = new TokenizerContext("{a && b}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 7, value: "a && b" },
         { kind: SyntaxKind.CloseBrace, start: 7, end: 8, value: "}" },
      ]);
   });

   it("handles expression with ternary operator", () => {
      const ctx = new TokenizerContext("{a ? b : c}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 10, value: "a ? b : c" },
         { kind: SyntaxKind.CloseBrace, start: 10, end: 11, value: "}" },
      ]);
   });

   it("emits error token for expression terminated by EOF", () => {
      const ctx = new TokenizerContext("{data.id");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(1);
      expect(errorTokens[0].start).toBe(8);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "data.id" },
         { kind: SyntaxKind.UnterminatedExpression, start: 8, end: 8 },
      ]);
   });

   it("emits error token for expression terminated by closing tag", () => {
      const ctx = new TokenizerContext("{data.id</div>");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(1);
      expect(errorTokens[0].start).toBe(8);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "data.id" },
         { kind: SyntaxKind.UnterminatedExpression, start: 8, end: 8 },
      ]);
   });

   it("handles empty expression", () => {
      const ctx = new TokenizerContext("{}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.CloseBrace, start: 1, end: 2, value: "}" },
      ]);
   });

   it("handles expression with spaces only", () => {
      const ctx = new TokenizerContext("{   }");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 4, value: "   " },
         { kind: SyntaxKind.CloseBrace, start: 4, end: 5, value: "}" },
      ]);
   });

   it("handles deeply nested braces", () => {
      const ctx = new TokenizerContext("{{{a}}}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 6, value: "{{a}}" },
         { kind: SyntaxKind.CloseBrace, start: 6, end: 7, value: "}" },
      ]);
   });

   it("handles expression with template literal", () => {
      const ctx = new TokenizerContext("{`${name}`}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 10, value: "`${name}`" },
         { kind: SyntaxKind.CloseBrace, start: 10, end: 11, value: "}" },
      ]);
   });

   it("handles expression with nested template literal containing braces", () => {
      const ctx = new TokenizerContext("{`${{a: 1}}`}");
      consume.expression(ctx);

      const errorTokens = ctx.tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 12, value: "`${{a: 1}}`" },
         { kind: SyntaxKind.CloseBrace, start: 12, end: 13, value: "}" },
      ]);
   });
})


describe('full tokenizer expression handling', () => {

   it("tokenizes expression embedded in HTML", () => {
      const tokens = tokenize("<div>{data.id}</div>");

      const errorTokens = tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);

      const exprTokens = tokens.filter(t =>
         t.kind === SyntaxKind.JsExpression
      );
      expect(exprTokens).toHaveLength(1);
      expect(exprTokens[0].value).toBe("data.id");
   });

   it("tokenizes multiple expressions", () => {
      const tokens = tokenize("{a}{b}{c}");

      const exprTokens = tokens.filter(t =>
         t.kind === SyntaxKind.JsExpression
      );
      expect(exprTokens).toHaveLength(3);
      expect(exprTokens[0].value).toBe("a");
      expect(exprTokens[1].value).toBe("b");
      expect(exprTokens[2].value).toBe("c");
   });

   it("tokenizes expression with text around it", () => {
      const tokens = tokenize("hello {name} world");

      const textTokens = tokens.filter(t =>
         t.kind === SyntaxKind.Text
      );
      expect(textTokens).toHaveLength(2);
      expect(textTokens[0].value).toBe("hello ");
      expect(textTokens[1].value).toBe(" world");

      const exprTokens = tokens.filter(t =>
         t.kind === SyntaxKind.JsExpression
      );
      expect(exprTokens).toHaveLength(1);
      expect(exprTokens[0].value).toBe("name");
   });

   it("tokenizes expression inside unquoted attribute", () => {
      const tokens = tokenize('<div class={className}');

      const exprTokens = tokens.filter(t =>
         t.kind === SyntaxKind.JsExpression
      );
      expect(exprTokens).toHaveLength(1);
      expect(exprTokens[0].value).toBe("className");
   });

   it("handles unclosed expression at EOF gracefully", () => {
      const tokens = tokenize("{unclosed");

      const errorTokens = tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(1);
   });

   it("handles expression with nested braces in real HTML", () => {
      const tokens = tokenize('<div>{items.map(i => i.name)}</div>');

      const errorTokens = tokens.filter(t =>
         t.kind === SyntaxKind.UnterminatedExpression
      );
      expect(errorTokens).toHaveLength(0);

      const exprTokens = tokens.filter(t =>
         t.kind === SyntaxKind.JsExpression
      );
      expect(exprTokens).toHaveLength(1);
      expect(exprTokens[0].value).toBe("items.map(i => i.name)");
   });
})
