import { Maybe } from "../types/maybe";

export enum SyntaxKind {
   Unknown = "Unknown",
   EndOfFile = "EndOfFile",
   ServerStart = "ServerStart",
   ServerEnd = "ServerEnd",
   ServerCode = "ServerCode",
   Html = "Html",
}

export enum TokenizerMode {
   Root,
   Server,
}

export interface Token {
   kind: SyntaxKind;
   start: number;
   end: number;
   value?: string;
}



// Matcher Types
export interface TokenizerContext {
   readonly source: string;
   readonly cursor: number;
   readonly mode: TokenizerMode;
}
export interface MatchResult {
   token: Token;
   nextCursor: number;
   nextMode: TokenizerMode;
}
export type Matcher = (ctx: TokenizerContext) => Maybe<MatchResult>
