import { TokenizerContext, SyntaxKind, consume } from "@/src"

import { describe, it, expect } from "vitest";


describe('consume.expression', () => {


   it('tokenizes a simple expression terminated by }', () => {
      const ctx = new TokenizerContext('{data.id}')
      consume.expression(ctx)
      console.dir(
         {
            tokens: ctx.tokens,
            diagnostics: ctx.diagnostics,
         },
         { depth: null }
      );

      expect(ctx.diagnostics).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "data.id" },
         { kind: SyntaxKind.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   })

   it("tokenizes an expression containing a string literal with an embedded quote-like char", () => {
      const ctx = new TokenizerContext("{'<data'}");
      consume.expression(ctx);

      expect(ctx.diagnostics).toHaveLength(0);
      expect(ctx.tokens).toEqual([
         { kind: SyntaxKind.OpenBrace, start: 0, end: 1, value: "{" },
         { kind: SyntaxKind.JsExpression, start: 1, end: 8, value: "'<data'" },
         { kind: SyntaxKind.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   });







})