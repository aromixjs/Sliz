import { LexerContext, SyntaxKind, TokenMatcher } from "@lib/tokenizer";


export class TemplateStart implements TokenMatcher {

   match(ctx: LexerContext) {
      if (ctx.source.slice(ctx.cursor, ctx.cursor + 3) === '~T"') {
         return {
            kind: SyntaxKind.TemplateStartToken, value: '~T"',
            start: ctx.cursor,
            end: ctx.cursor + 3
         };
      }
   }

}
