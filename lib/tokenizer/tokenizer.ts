import { TokenMatcher } from "./context";
import { SyntaxKind, Token } from "./tokens";

export class Tokenizer {
  private matchers: TokenMatcher[] = [];

  register(matcher: TokenMatcher) {
    this.matchers.push(matcher);
    return this;
  }

  tokenize(source: string): Token[] {
    const tokens: Token[] = [];
    let cursor = 0;

    while (cursor < source.length) {
      const context = {
        source,
        cursor,
      };

      let token: Token | undefined;
      for (const matcher of this.matchers) {
        token = matcher.match(context);
        if (token) break;
      }

      if (!token) {
        token = {
          kind: SyntaxKind.Unknown,
          start: cursor,
          end: cursor + 1,
          value: source[cursor],
        };
      }

      tokens.push(token);
      cursor = token.end;
    }

    tokens.push({
      kind: SyntaxKind.EndOfFileToken,
      start: cursor,
      end: cursor,
    });
    return tokens;
  }
}
