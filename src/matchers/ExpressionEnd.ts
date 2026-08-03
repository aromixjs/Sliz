import { Char } from "@lib/ascii.codes";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class ExpressionEndMatcher implements TokenMatcher {

   match(ctx: LexerContext) {

      if (ctx.mode !== LexerMode.Expression) {
         return;
      }

      if (ctx.source.charCodeAt(ctx.cursor) !== Char.CloseBrace) {
         return;
      }

      return {
         token: {
            kind: SyntaxKind.CloseExpressionToken,
            start: ctx.cursor,
            end: ctx.cursor + 1,
            value: "}"
         },
         nextCursor: ctx.cursor + 1,
         nextMode: LexerMode.View
      };
   }
}