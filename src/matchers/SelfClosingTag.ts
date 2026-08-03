import { Char } from "@lib/ascii.codes";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class SelfCloseTagMatcher implements TokenMatcher {

   match(ctx: LexerContext) {

      if (ctx.mode !== LexerMode.View) return;

      if (
         ctx.source.charCodeAt(ctx.cursor) !== Char.Slash ||
         ctx.source.charCodeAt(ctx.cursor + 1) !== Char.GreaterThan
      ) {
         return;
      }

      return {
         token: {
            kind: SyntaxKind.SelfCloseTagToken,
            start: ctx.cursor,
            end: ctx.cursor + 2,
            value: "/>"
         },
         nextCursor: ctx.cursor + 2,
             nextMode: LexerMode.View
      };
   }
}