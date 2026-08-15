import { CharacterCursor, consumeExpression, TokenizerContext, TokenType } from "@/src";
import { describe, it, expect } from "vitest";



describe('consume.expression', () => {


   it('tokenizes a simple expression terminated by }', () => {
      const cursor = new CharacterCursor('{data.id}', 0)
      const ctx = new TokenizerContext(cursor)
      consumeExpression(ctx)

      expect(ctx.tokens).toEqual([
         { type: TokenType.OpenBrace, start: 0, end: 1, value: "{" },
         { type: TokenType.JsExpression, start: 1, end: 8, value: "data.id" },
         { type: TokenType.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   })


   it("tokenizes an expression containing a string literal with an embedded quote-like char", () => {
      const cursor = new CharacterCursor("{'<data'}", 0)
      const ctx = new TokenizerContext(cursor)
      consumeExpression(ctx);

      expect(ctx.tokens).toEqual([
         { type: TokenType.OpenBrace, start: 0, end: 1, value: '{' },
         { type: TokenType.Quote, start: 1, end: 2, value: "'" },
         { type: TokenType.JsString, start: 2, end: 7, value: '<data' },
         { type: TokenType.Quote, start: 7, end: 8, value: "'" },
         { type: TokenType.CloseBrace, start: 8, end: 9, value: '}' }
      ]);
   });


   it("handles expression with nested braces", () => {
      const cursor = new CharacterCursor("{a + {b}}", 0)
      const ctx = new TokenizerContext(cursor)
      consumeExpression(ctx);

      expect(ctx.tokens).toEqual([
         { type: TokenType.OpenBrace, start: 0, end: 1, value: "{" },
         { type: TokenType.JsExpression, start: 1, end: 8, value: "a + {b}" },
         { type: TokenType.CloseBrace, start: 8, end: 9, value: "}" },
      ]);
   });





})


