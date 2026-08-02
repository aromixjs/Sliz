import { Token } from "./tokens";

export interface LexerContext {
  readonly source: string;
  readonly cursor: number;
}

export interface TokenMatcher {
  match(ctx: LexerContext): Token | undefined;
}
