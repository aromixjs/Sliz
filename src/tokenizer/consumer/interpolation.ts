import char from "../../scanner/char";
import { isQuote, isTagLike } from "../../scanner/is";
import { TokenizerContext, TokenType } from "../token";

export function consumeString(ctx: TokenizerContext) {
   const start = ctx.cursor.position;
   const quote = ctx.cursor.peek();
   ctx.cursor.advance();


   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();


      // Skip escaped characters (e.g., \" or \\)
      if (code === char.backslash) {
         ctx.cursor.advance();

         if (!ctx.cursor.eof) {
            ctx.cursor.advance();
         }

         continue;
      }


      // String terminator.
      if (code === quote) {
         ctx.cursor.advance();

         ctx.emit({
            type: TokenType.String,
            start,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start),
         });

         return;
      }





   }



}


function consumeJs(ctx: TokenizerContext) {
   let depth = 1;

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      // Skip escaped character sequences
      if (code === char.backslash) {
         ctx.cursor.advance();
         if (!ctx.cursor.eof) {
            ctx.cursor.advance();
         }
         continue;
      }

      if (isQuote(code)) {
         consumeString(ctx)
         continue;
      }


      // Sliz Template interpolation will not support jsx like nested html inside js 
      if (isTagLike(ctx.cursor)) {

         ctx.emit({
            type: TokenType.UnterminatedExpression,
            start: ctx.cursor.position,
            end: ctx.cursor.position,
            value: ''
         })


      }



      if (code === char.openBrace) {
         depth++;
         ctx.cursor.advance();
         continue;
      }


      if (code === char.closeBrace) {
         depth--
         ctx.cursor.advance()
         if (depth === 0) {
            return;
         }


         continue;

      }



      ctx.cursor.advance()
   }







}


/**
 * Consumes a JavaScript interpolation expression enclosed in curly braces (e.g., `{ name }`, `{ count + 1 }`).
 * 
 * Emits an `OpenBrace` token for the initial `{` character, advances the cursor,
 * and delegates the remaining expression parsing to the `consumeJs` consumer.
 */
export function consumeExpression(ctx: TokenizerContext): void {
  ctx.emit({
    type: TokenType.OpenBrace,
    start: ctx.cursor.position,
    end: ctx.cursor.position + 1,
    value: "{",
  });
  ctx.cursor.advance();
  consumeJs(ctx);
}