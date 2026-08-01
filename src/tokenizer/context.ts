import { TokenKind } from "./tokens";

export interface LexerContext {
  readonly source: string;
  readonly cursor: number;
  peekCode(offset?: number): number | undefined; // char code at cursor+ offset
  peekChar(offset?: number): string | undefined;
  slice(start: number, end: number): string;
}

export interface TokenMatch {
  kind: TokenKind;
  value: string | null;
  length: number; // chars consumed — the ONLY thing that advances the cursor
}

export interface TokenMatcher {
  kind: TokenKind;
  match(ctx: LexerContext): TokenMatch | null;
}
