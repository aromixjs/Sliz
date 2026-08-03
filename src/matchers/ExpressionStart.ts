import { Char } from "@lib/ascii.codes";
import { BaseMatcher } from "@lib/base.matcher";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class ExpressionStartMatcher extends BaseMatcher implements TokenMatcher {

    match(ctx: LexerContext) {

        if (!this.isView(ctx)) return;

        if (ctx.source.charCodeAt(ctx.cursor) !== Char.OpenBrace) {
            return;
        }

        return {
            token: {
                kind: SyntaxKind.OpenExpressionToken,
                start: ctx.cursor,
                end: ctx.cursor + 1,
                value: "{"
            },
            nextCursor: ctx.cursor + 1,
            nextMode: LexerMode.Expression
        };
    }
}