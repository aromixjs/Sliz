import { BaseMatcher } from "@lib/base.matcher";
import { LexerContext, SyntaxKind, TokenMatcher } from "@lib/tokenizer";
import { LexerMode, MatchResult } from "@lib/tokenizer/context";

export class ServerCodeMatcher extends BaseMatcher implements TokenMatcher {

   match(ctx: LexerContext): MatchResult | undefined {
      if (ctx.mode !== LexerMode.Server) return;

      const end = ctx.source.indexOf("</server>", ctx.cursor);

      if (end === -1 || end === ctx.cursor) return;

        return {
            token: {
                kind: SyntaxKind.ServerCodeToken,
                start: ctx.cursor,
                end,
                value: ctx.source.slice(ctx.cursor, end),
            },

            nextCursor: end,
            nextMode: LexerMode.Server,
        };
    }

}