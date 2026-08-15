import { CharacterCursor, consumeExpression, TokenizerContext, TokenType } from "@/src";
import { describe, it, expect } from "vitest";



describe('consume.expression', () => {
   const cursor = new CharacterCursor('{data.id}', 0)
   const ctx = new TokenizerContext(cursor)
   consumeExpression(ctx)
console.log(ctx.tokens);

   expect(ctx.tokens).toEqual([
      { type: TokenType.OpenBrace, start: 0, end: 1, value: "{" },
      { type: TokenType.JsExpression, start: 1, end: 8, value: "data.id" },
      { type: TokenType.CloseBrace, start: 8, end: 9, value: "}" },
   ]);

})