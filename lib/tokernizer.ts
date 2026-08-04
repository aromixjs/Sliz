import { Optional } from "./global.types";

export enum TokenKind {
   Unknown = "Unknown",
   EndOfFileToken = "EndOfFileToken",
   ServerStartToken = "ServerStartToken",
   ServerEndToken = "ServerEndToken",
   ServerCodeToken = "ServerCodeToken",
   HtmlToken = "HtmlToken",
}

export enum LexerMode {
   Root,
   Server,
}

export interface Token {
   kind: TokenKind;
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


export type Matcher = (ctx: LexerContext) => Optional<MatchResult>
export interface TokenizeInput {
   matchers: Matcher[]
   source: string
}



export function tokenize(input: TokenizeInput) {
   const tokens: Token[] = [];
   let mode = LexerMode.Root;
   let cursor = 0;
   const { source, matchers } = input

   while (cursor < source.length) {

      const context: LexerContext = { source, cursor, mode };
      let result: Optional<MatchResult>;

      for (const matcher of matchers) {
         result = matcher(context);
         if (result) break;
      }


      if (!result) {
         result = {
            token: {
               kind: TokenKind.Unknown,
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
         mode = result.nextMode;
      }
   }

   tokens.push({
      kind: TokenKind.EndOfFileToken,
      start: cursor,
      end: cursor,
   });
   return tokens;
}