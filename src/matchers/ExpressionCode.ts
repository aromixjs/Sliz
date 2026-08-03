import { Char } from "@lib/ascii.codes";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class ExpressionCodeMatcher implements TokenMatcher {

    match(ctx: LexerContext) {

        if (ctx.mode !== LexerMode.Expression) {
            return;
        }

        const start = ctx.cursor;
        let position = start;

        while (position < ctx.source.length) {

            if (ctx.source.charCodeAt(position) === Char.CloseBrace) {
                break;
            }

            position++;
        }

        if (position === start) {
            return;
        }

        return {
            token: {
                kind: SyntaxKind.TsExpressionToken,
                start,
                end: position,
                value: ctx.source.slice(start, position)
            },
            nextCursor: position
        };
    }
}