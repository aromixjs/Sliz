import { Char } from "@lib/ascii.codes";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class CloseTagMatcher implements TokenMatcher {

   match(ctx: LexerContext) {

      if (ctx.mode !== LexerMode.View) return;

      if (
         ctx.source.charCodeAt(ctx.cursor) !== Char.LessThan ||
         ctx.source.charCodeAt(ctx.cursor + 1) !== Char.Slash
      ) {
         return;
      }

      return {
         token: {
            kind: SyntaxKind.CloseTagToken,
            start: ctx.cursor,
            end: ctx.cursor + 2,
            value: "</"
         },
         nextCursor: ctx.cursor + 2
      };
   }
}