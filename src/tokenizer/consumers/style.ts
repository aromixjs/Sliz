import char from "../../scanner/char";
import { is } from "../../scanner/is";
import { skip } from "../../scanner/skip";
import { SyntaxKind, TokenizerContext } from "../token";

export function consumeStyle(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      // CSS strings
      if (
         code === char.singleQuote ||
         code === char.doubleQuote
      ) {
         skip.string(ctx);
         continue;
      }

      // CSS block comment
      if (
         code === char.slash &&
         ctx.cursor.peek(1) === char.asterisk
      ) {
         skip.blockComment(ctx);
         continue;
      }

      // Closing </style>
      if (
         code === char.lessThan &&
         ctx.cursor.peek(1) === char.slash &&
         is.styleClosingTag(ctx)
      ) {
         break;
      }

      ctx.cursor.advance();
   }

   if (ctx.cursor.position > start.position) {
      ctx.tokens.push({
         kind: SyntaxKind.Style,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }
}