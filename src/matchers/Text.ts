import { Char } from "@lib/ascii.codes";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class TextMatcher implements TokenMatcher {

    match(ctx: LexerContext) {

        if (ctx.mode !== LexerMode.View) return;

        const start = ctx.cursor;
        let position = start;

        while (position < ctx.source.length) {

            const code = ctx.source.charCodeAt(position);

            if (
                code === Char.LessThan ||
                code === Char.OpenBrace
            ) {
                break;
            }

            position++;
        }

        if (position === start) {
            return;
        }

        return {
            token: {
                kind: SyntaxKind.TextToken,
                start,
                end: position,
                value: ctx.source.slice(start, position)
            },

            nextCursor: position
        };
    }
}