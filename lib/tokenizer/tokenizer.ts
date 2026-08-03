import {
  LexerContext,
  LexerMode,
  MatchResult,
  SyntaxKind,
  Token,
  TokenMatcher,
} from "./types";

export class Tokenizer {
  private matchers: TokenMatcher[] = [];
  private mode = LexerMode.Root;

  register(matcher: TokenMatcher) {
    this.matchers.push(matcher);
    return this;
  }

  tokenize(source: string): Token[] {
    const tokens: Token[] = [];
    let cursor = 0;

    while (cursor < source.length) {
      const context: LexerContext = {
        source,
        cursor,
        mode: this.mode,
      };

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
        this.mode = result.nextMode;
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
