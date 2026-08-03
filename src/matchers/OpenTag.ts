import { Char } from "@lib/ascii.codes";
import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class OpenTagMatcher implements TokenMatcher {

    match(ctx: LexerContext) {

        if (ctx.mode !== LexerMode.View) return;

        if (ctx.source.charCodeAt(ctx.cursor) !== Char.LessThan) {
            return;
        }

        if (ctx.source.charCodeAt(ctx.cursor + 1) === Char.Slash) {
            return;
        }

        return {
            token: {
                kind: SyntaxKind.OpenTagToken,
                start: ctx.cursor,
                end: ctx.cursor + 1,
                value: "<"
            },
            nextCursor: ctx.cursor + 1,
            nextMode: LexerMode.Tag
        };
    }
}