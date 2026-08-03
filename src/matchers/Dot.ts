import { Char } from "@lib/ascii.codes";
import { BaseMatcher } from "@lib/base.matcher";
import { LexerContext, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class DotMatcher extends BaseMatcher implements TokenMatcher {

    match(ctx: LexerContext) {

        if (!this.isView(ctx)) return;

        if (ctx.source.charCodeAt(ctx.cursor) !== Char.Dot) {
            return;
        }

        return {
            token: {
                kind: SyntaxKind.DotToken,
                start: ctx.cursor,
                end: ctx.cursor + 1,
                value: "."
            },
            nextCursor: ctx.cursor + 1
        };
    }
}