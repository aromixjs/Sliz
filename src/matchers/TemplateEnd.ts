import { LexerContext, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class TemplateEnd implements TokenMatcher {

   match(ctx: LexerContext) {
      if (ctx.source.slice(ctx.cursor, ctx.cursor + 3) === '"T~') {
         return {
            kind: SyntaxKind.TemplateEndToken, value: '"T~',
            start: ctx.cursor,
            end: ctx.cursor + 3
         };
      }
   }

}