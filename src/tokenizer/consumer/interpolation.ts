import char from "../../scanner/char";
import { isQuote, isTagLike } from "../../scanner/is";
import { TokenizerContext, TokenType } from "../token";

function consumeTemplateLiteral(ctx: TokenizerContext) {
   const start = ctx.cursor.position;
   ctx.cursor.advance();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();
      // Skip escaped characters
      if (code === char.backslash) {
         ctx.cursor.advance();

         if (!ctx.cursor.eof) {
            ctx.cursor.advance();
         }

         continue;
      }

      if (code === char.backtick) {
         ctx.cursor.advance();
         ctx.emit({
            type: TokenType.JsString,
            start,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start),
         });

         return;
      }

      // string interpolation
      if (code === char.dollar && ctx.cursor.peekAtOffset(1) === char.openBrace) {


      }




      ctx.cursor.advance()

   }


   // ran Out Of Input Before The string closed
   ctx.emit({
      type: TokenType.UnterminatedJsString,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start)
   })


}


function consumeString(ctx: TokenizerContext) {
   const start = ctx.cursor.position;
   const quote = ctx.cursor.peek();
   ctx.cursor.advance();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      // Skip escaped characters
      if (code === char.backslash) {
         ctx.cursor.advance();

         if (!ctx.cursor.eof) {
            ctx.cursor.advance();
         }

         continue;
      }


      // String closed successfully.
      if (code === quote) {
         ctx.cursor.advance();

         ctx.emit({
            type: TokenType.JsString,
            start,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start),
         });

         return;
      }


      // in js singleQuoted or doubleQuoted string is not multi line.
      if (code === char.carriageReturn || code === char.lineFeed) {
         ctx.emit({
            type: TokenType.UnterminatedJsString,
            start,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start)
         })

         return;
      }
      ctx.cursor.advance()
   }

   // ran Out Of Input Before The string closed
   ctx.emit({
      type: TokenType.UnterminatedJsString,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start)
   })
}




function consumeJs(ctx: TokenizerContext) {
   let depth = 1;
   let chunkStart = ctx.cursor.position;

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (isQuote(code)) {
         // Emit the Contents Before String
         if (chunkStart < ctx.cursor.position) {
            ctx.emit({
               type: TokenType.JsExpression,
               start: chunkStart,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(chunkStart)
            })
         }

         consumeString(ctx)
         continue;
      }

      if (code === char.backtick) {
         // Emit the Contents Before String
         if (chunkStart < ctx.cursor.position) {
            ctx.emit({
               type: TokenType.JsExpression,
               start: chunkStart,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(chunkStart)
            })
         }

         consumeTemplateLiteral(ctx)
         continue;
      }

      // Sliz template interpolation will not support jsx-like nested html inside js
      if (isTagLike(ctx.cursor)) {
         if (chunkStart < ctx.cursor.position) {
            ctx.emit({
               type: TokenType.JsExpression,
               start: chunkStart,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(chunkStart),
            });
         }

         ctx.emit({
            type: TokenType.UnterminatedJsExpression,
            start: ctx.cursor.position,
            end: ctx.cursor.position,
            value: undefined,
         });

         return;
      }

      if (code === char.openBrace) {
         depth++;
         ctx.cursor.advance();
         continue;
      }


      if (code === char.closeBrace) {
         depth--;

         if (depth === 0) {
            if (chunkStart < ctx.cursor.position) {
               ctx.emit({
                  type: TokenType.JsExpression,
                  start: chunkStart,
                  end: ctx.cursor.position,
                  value: ctx.cursor.getChars(chunkStart),
               });
            }

            const closeBraceStart = ctx.cursor.position;
            ctx.cursor.advance();

            ctx.emit({
               type: TokenType.CloseBrace,
               start: closeBraceStart,
               end: ctx.cursor.position,
               value: "}",
            });

            return;
         }


         ctx.cursor.advance()
         continue;





      }








      ctx.cursor.advance()
   }

}


/**
 * Consumes a JavaScript interpolation expression enclosed in curly braces.
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