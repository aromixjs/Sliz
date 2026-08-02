import { Char } from "@lib/ascii.codes";
import { BaseMatcher } from "@lib/base.matcher";
import { LexerContext, SyntaxKind, TokenMatcher } from "@lib/tokenizer";

export class ServerStartMatcher extends BaseMatcher implements TokenMatcher {

   match(ctx: LexerContext) {
      const { source, cursor } = ctx

      if (source.charCodeAt(cursor) !== Char.LessThan) {
         return;
      }

      let position = cursor + 1;
      position = this.skipWhiteSpace(source, position)

      const tagMatched = this.matchWord(source, position, "server")
      if (!tagMatched) return;


      position += 'server'.length

      position = this.skipWhiteSpace(source, position)



      if (source.charCodeAt(position) !== Char.GreaterThan) {
         return;
      }

      return {
         kind: SyntaxKind.ServerScriptStartToken,
         start: cursor,
         end: position + 1,
         value: source.slice(cursor, position + 1),
      };


   }

}