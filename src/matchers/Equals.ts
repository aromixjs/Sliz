import { Char } from "@lib/ascii.codes";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class EqualsMatcher implements TokenMatcher {

    match(ctx: LexerContext) {

        if (ctx.mode !== LexerMode.View) return;

        if (ctx.source.charCodeAt(ctx.cursor) !== Char.Equals) {
            return;
        }

        return {
            token: {
                kind: SyntaxKind.EqualsToken,
                start: ctx.cursor,
                end: ctx.cursor + 1,
                value: "="
            },
            nextCursor: ctx.cursor + 1
        };
    }
}