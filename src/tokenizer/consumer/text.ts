import char from "../../scanner/char";
import { isTagLike } from "../../scanner/is";
import { TokenType, TokenizerContext } from "../token";

/**
 * Consumes plain text content until it encounters a tag-like syntax or an open brace.
 */
export function consumeText(ctx: TokenizerContext) {
   const start = ctx.cursor.position;

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (isTagLike(ctx.cursor) || code === char.openBrace) {
         break;
      }

      ctx.cursor.advance();
   }

   ctx.emitIf(ctx.cursor.position !== start, {
      type: TokenType.Text,
      start: start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
   });

}



