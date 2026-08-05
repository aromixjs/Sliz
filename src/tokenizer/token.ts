import { Maybe } from "../types/maybe";

export enum SyntaxKind {
   Unknown = "Unknown",
   EndOfFile = "EndOfFile",
   ServerStart = "ServerStart",
   ServerEnd = "ServerEnd",
   ServerCode = "ServerCode",
   Html = "Html",
}

export enum LexerMode {
   Root,
   Server,
}

export interface Token {
   kind: SyntaxKind;
   start: number;
   end: number;
   value?: string;
}

export interface LexerContext {
   readonly source: string;
   readonly cursor: number;
   readonly mode: LexerMode;
}

export interface MatchResult {
   token: Token;
   nextCursor: number;
   nextMode?: LexerMode;
}


export type Matcher = (ctx: LexerContext) => Maybe<MatchResult>
export interface TokenizeInput {
   matchers: Matcher[]
   source: string
}

