import { Maybe } from "../types/maybe";
import { LexerContext, LexerMode, MatchResult, SyntaxKind, Token, TokenizeInput } from "./token";

export function tokenize(input: TokenizeInput) {
   const tokens: Token[] = [];
   let mode = LexerMode.Root;
   let cursor = 0;
   const { source, matchers } = input

   while (cursor < source.length) {

      const context: LexerContext = { source, cursor, mode };
      let result: Maybe<MatchResult>;

      for (const matcher of matchers) {
         result = matcher(context);
         if (result) break;
      }


      if (!result) {
         result = {
            token: {
               kind: SyntaxKind.Unknown,
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
      kind: SyntaxKind.EndOfFile,
      start: cursor,
      end: cursor,
   });
   return tokens;
}