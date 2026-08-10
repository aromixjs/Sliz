import char from "../../scanner/char";
import { is } from "../../scanner/is";
import { skip } from "../../scanner/skip";
import { SyntaxKind, TokenizerContext } from "../token";

export function consumeScript(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (
         code === char.singleQuote ||
         code === char.doubleQuote
      ) {
         skip.string(ctx);
         continue;
      }

      if (code === char.backtick) {
         skip.template(ctx);
         continue;
      }

      if (
         code === char.slash &&
         ctx.cursor.peek(1) === char.slash
      ) {
         skip.lineComment(ctx);
         continue;
      }

      if (
         code === char.slash &&
         ctx.cursor.peek(1) === char.asterisk
      ) {
         skip.blockComment(ctx);
         continue;
      }

      if (
         code === char.lessThan &&
         ctx.cursor.peek(1) === char.slash &&
         is.scriptClosingTag(ctx)
      ) {
         break;
      }

      ctx.cursor.advance();
   }

   if (ctx.cursor.position > start.position) {
      ctx.tokens.push({
         kind: SyntaxKind.Script,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }
}