import {
  LexerContext,
  LexerMode,
  MatchResult,
  SyntaxKind,
  Token,
  TokenMatcher,
} from "./types";

export class Tokenizer {
  constructor(private readonly matchers: TokenMatcher[]) {}

  tokenize(source: string): Token[] {
    const tokens: Token[] = [];
    let mode = LexerMode.Root;
    let cursor = 0;

    while (cursor < source.length) {
      const context: LexerContext = { source, cursor, mode };

      let result: MatchResult | undefined;
      for (const matcher of this.matchers) {
        result = matcher.match(context);
        if (result) break;
      }

      if (!result) {
        result = {
          token: {
            kind: SyntaxKind.Unknown,
            start: cursor,
            end: cursor + 1,
            value: source[cursor],
          },
          nextCursor: cursor + 1,
        };
      }

      tokens.push(result.token);
      cursor = result.nextCursor;

      if (result.nextMode !== undefined) {
        mode = result.nextMode;
      }
    }

    tokens.push({
      kind: SyntaxKind.EndOfFileToken,
      start: cursor,
      end: cursor,
    });
    return tokens;
  }
}
