import { LexerContext, TokenMatcher } from "./context";
import { Token, TokenKind } from "./tokens";

export class Tokenizer {
  private matchers: TokenMatcher[] = [];

  register(matcher: TokenMatcher) {
    this.matchers.push(matcher); // registration order = precedence order
  }

  tokenize(source: string): Token[] {
    const tokens: Token[] = [];
    let cursor = 0, line = 0, column = 0;
    const ctx = (at: number): LexerContext => ({
      source,
      cursor: at,
      peekChar: (offset = 0) => source[at + offset],
      peekCode: (offset = 0) => source.charCodeAt(at + offset),
      slice: (start, end) => source.slice(start, end),
    });

    while (cursor < source.length) {
      const match = this.matchers
        .map((m) => m.match(ctx(cursor)))
        .find((m) => m !== null && m.length > 0);
      if (!match) {
        throw new Error(
          `No matcher claimed position ${cursor} ("${source[cursor]}")`,
        );
      }
      const start = { offset: cursor, line, column };
      const consumed = source.slice(cursor, cursor + match.length);

      for (const ch of consumed) {
        if (ch === "\n") {
          line++;
          column = 0;
        } else column++;
      }

      cursor += match.length;

      tokens.push({
        kind: match.kind,
        value: match.value,
        range: { start, end: { offset: cursor, line, column } },
      });
    }

    tokens.push({
      kind: TokenKind.EOF,
      value: null,
      range: {
        start: { offset: cursor, line, column },
        end: { offset: cursor, line, column },
      },
    });
    return tokens;
  }
}
