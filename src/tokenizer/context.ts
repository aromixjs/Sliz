import { Token, TokenKind } from "./tokens";

export interface LexerContext {
  readonly source: string;
  readonly cursor: number;
}

export interface TokenMatcher {
  kind: TokenKind;
  match(ctx: LexerContext): Token | void;
}
