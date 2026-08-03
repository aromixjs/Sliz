import { LexerContext, LexerMode, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class IdentifierMatcher implements TokenMatcher {

    match(ctx: LexerContext){

        if (ctx.mode !== LexerMode.View) return;

        const { source, cursor } = ctx;

        const first = source.charCodeAt(cursor);

        if (!this.isStart(first)) {
            return;
        }

        let position = cursor + 1;

        while (
            position < source.length &&
            this.isPart(source.charCodeAt(position))
        ) {
            position++;
        }

        return {
            token: {
                kind: SyntaxKind.IdentifierToken,
                start: cursor,
                end: position,
                value: source.slice(cursor, position)
            },
            nextCursor: position
        };
    }


    private isStart(code: number) {
        return (
            (code >= 65 && code <= 90) ||
            (code >= 97 && code <= 122) ||
            code === 95
        );
    }


    private isPart(code: number) {
        return (
            this.isStart(code) ||
            (code >= 48 && code <= 57) ||
            code === 45
        );
    }
}