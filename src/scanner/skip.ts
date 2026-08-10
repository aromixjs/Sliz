import { TokenizerContext } from "../tokenizer/token";
import char from "./char";
import { is } from "./is";


export namespace skip {
   /**
    * Skips forward over whitespace characters (space, tab, line feed, carriage return).
    *
    * @param ctx The tokenizer context.
    */
   export function whiteSpace(ctx: TokenizerContext) {
      const { cursor } = ctx;

      while (!cursor.eof) {
         const code = cursor.peek();

         if (
            code !== char.space &&
            code !== char.tab &&
            code !== char.lineFeed &&
            code !== char.carriageReturn
         ) {
            break;
         }

         cursor.advance();
      }
   }

   /**
    * Skips a single-line comment starting with `//` until end of line.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the first `/`.
    */
   export function lineComment(ctx: TokenizerContext) {
      const { cursor } = ctx;

      cursor.advance();
      cursor.advance();

      while (!cursor.eof) {
         if (cursor.peek() === char.lineFeed) {
            break;
         }

         cursor.advance();
      }
   }

   /**
    * Skips a block comment from `/*` to `*\\/`.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the first `*`.
    */
   export function blockComment(ctx: TokenizerContext) {
      const { cursor } = ctx;

      cursor.advance();
      cursor.advance();

      while (!cursor.eof) {
         if (
            cursor.peek() === char.asterisk &&
            cursor.peek(1) === char.slash
         ) {
            cursor.advance();
            cursor.advance();
            return;
         }

         cursor.advance();
      }
   }

   /**
    * Skips a quoted string, handling backslash escapes.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the opening quote.
    */
   export function string(ctx: TokenizerContext) {
      const { cursor } = ctx;
      const quote = cursor.peek();

      cursor.advance();

      while (!cursor.eof) {
         const code = cursor.peek();

         if (code === char.backslash) {
            cursor.advance();

            if (!cursor.eof) {
               cursor.advance();
            }

            continue;
         }

         if (code === quote) {
            cursor.advance();
            return;
         }

         cursor.advance();
      }
   }

   /**
    * Skips a template literal, handling backslash escapes and `${...}` interpolations.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the opening backtick.
    */
   export function template(ctx: TokenizerContext) {
      const { cursor } = ctx;

      cursor.advance();

      while (!cursor.eof) {
         const code = cursor.peek();

         if (code === char.backslash) {
            cursor.advance();

            if (!cursor.eof) {
               cursor.advance();
            }

            continue;
         }

         if (code === char.backtick) {
            cursor.advance();
            return;
         }

         if (
            code === char.dollar &&
            cursor.peek(1) === char.openBrace
         ) {
            cursor.advance();
            cursor.advance();
            braceExpression(ctx);
            continue;
         }

         cursor.advance();
      }
   }


   /**
    * Skips a `{ ... }` expression, safely skipping over inner braces, strings, and escape characters.
    *
    * @param ctx The tokenizer context. Cursor must be positioned immediately after the opening `{`.
    */
   export function braceExpression(ctx: TokenizerContext) {
      const { cursor } = ctx;
      let depth = 1;

      while (!cursor.eof) {
         const code = cursor.peek();

         if (code === char.backslash) {
            cursor.advance();
            if (!cursor.eof) {
               cursor.advance();
            }
            continue;
         }

         if (code === char.singleQuote || code === char.doubleQuote) {
            string(ctx);
            continue;
         }

         if (code === char.backtick) {
            template(ctx);
            continue;
         }

         if (code === char.openBrace) {
            depth++;
            cursor.advance();
            continue;
         }

         if (code === char.closeBrace) {
            depth--;
            cursor.advance();

            if (depth === 0) {
               return;
            }

            continue;
         }

         cursor.advance();
      }
   }

   /**
    * Skips a regex literal from opening `/` to closing `/`, handling character classes and escapes.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the opening `/`.
    */
   export function regex(ctx: TokenizerContext) {
      const { cursor } = ctx;
      let inCharClass = false;

      cursor.advance();

      while (!cursor.eof) {
         const code = cursor.peek();

         if (code === char.backslash) {
            cursor.advance();

            if (!cursor.eof) {
               cursor.advance();
            }

            continue;
         }

         if (code === char.lineFeed) {
            return;
         }

         if (code === char.openBracket) {
            inCharClass = true;
            cursor.advance();
            continue;
         }

         if (code === char.closeBracket) {
            inCharClass = false;
            cursor.advance();
            continue;
         }

         if (code === char.slash && !inCharClass) {
            cursor.advance();

            while (!cursor.eof && is.alpha(cursor.peek())) {
               cursor.advance();
            }

            return;
         }

         cursor.advance();
      }
   }
};
