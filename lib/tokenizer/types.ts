export enum SyntaxKind {
  Unknown = "Unknown",
  EndOfFileToken = "EndOfFileToken",
  ServerStartToken = "ServerStartToken",
  ServerEndToken = "ServerEndToken",
  ServerCodeToken = "ServerCodeToken",
  HtmlToken = "HtmlToken",
}

export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  value?: string;
}

export enum LexerMode {
  Root,
  Server,
}

export interface LexerContext {
  readonly source: string;
  readonly cursor: number;
  readonly mode: LexerMode;
}

export interface TokenMatcher {
  match(ctx: LexerContext): MatchResult | undefined;
}

export interface MatchResult {
  token: Token;
  nextCursor: number;
  nextMode?: LexerMode;
}
