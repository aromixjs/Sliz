import { TokenMatcher } from "./context";
import { Token, TokenKind } from "./tokens";

export class Tokenizer {
  private matchers: TokenMatcher[] = [];

  // registration order = precedence order
  register(matcher: TokenMatcher) {
    this.matchers.push(matcher);
  }

  tokenize(source: string): Token[] {
    const tokens: Token[] = [];
    let cursor = 0;
    while (cursor < source.length) {

      const match = this.matchers.map((m) => m.match({
        source,
        cursor
      })).filter(m => !!m)

      tokens.push(...match)


      cursor++;

    }

    tokens.push({
      kind: TokenKind.EOF,
      value: null,
    });
    return tokens;
  }
}
