import { TokenizerContext } from "../tokenizer/token";
import char from "./char";
import { is } from "./is";


export namespace skip {

   // Skips forward over whitespace characters (space, tab, line feed, carriage return).
   export function whiteSpace(ctx: TokenizerContext) {
      const { cursor } = ctx;

      while (!cursor.eof) {
         if (!is.whitespace(cursor.peek())) {
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
    * @param ctx The tokenizer context. Cursor must be positioned at the first `/`.
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
    * How it works:
    * 1. It Tracks brace depth to handle nested `{ }`.
    * 2. Skips over strings and template literals so braces inside them are ignored.
    * 3. Skips over escaped characters (e.g., `\}`) so they don't count.
    * 4. Stops at `</` (closing tag pattern) — expressions shouldn't contain closing tags.
    * 5. Returns when depth reaches 0 (closing `}` found), at `</`, or at EOF.
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


         if (is.quote(code)) {
            string(ctx);
            continue;
         }

         if (code === char.backtick) {
            template(ctx);
            continue;
         }

         if (code === char.lessThan && cursor.peek(1) === char.slash) {
            return;
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

};
