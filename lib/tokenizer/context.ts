import { Token } from "./tokens";
export enum LexerMode {
  Root,
  Server,
  View
}

export interface LexerContext {
  readonly source: string;
  readonly cursor: number;
  readonly mode: LexerMode
}

export interface TokenMatcher {
  match(ctx: LexerContext): MatchResult | undefined;
}


export interface MatchResult {
  token: Token
  nextCursor: number
  nextMode?: LexerMode
}