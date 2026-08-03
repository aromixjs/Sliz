import { Char } from "@lib/ascii.codes";
import { BaseMatcher } from "@lib/base.matcher";
import {
    LexerContext,
    LexerMode,
    SyntaxKind,
    TokenMatcher,
} from "@lib/tokenizer";

export class ServerEndMatcher
    extends BaseMatcher
    implements TokenMatcher {

    match(ctx: LexerContext) {
        if (ctx.mode !== LexerMode.Server)  return;
        const { source, cursor } = ctx;

        // <
        if (source.charCodeAt(cursor) !== Char.LessThan) return;
        let position = cursor + 1;

        position = this.skipWhiteSpace(source, position);

        // /
        if (source.charCodeAt(position) !== Char.Slash)  return;

        position++;

        position = this.skipWhiteSpace(source, position);

        // server
        if (!this.matchWord(source, position, "server"))  return;

        position += "server".length;

        position = this.skipWhiteSpace(source, position);

        // >
        if (source.charCodeAt(position) !== Char.GreaterThan)  return;

        return {
            token: {
                kind: SyntaxKind.ServerEndToken,
                start: cursor,
                end: position + 1,
                value: source.slice(cursor, position + 1),
            },

            nextCursor: position + 1,
            nextMode: LexerMode.Root,
        };
    }
}