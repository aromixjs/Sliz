import { CharacterCursor } from "../tokenizer/cursor";
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
            cursor.peekAtOffset(1) === char.slash
         ) {
            cursor.advance();
            cursor.advance();
            return;
         }

         cursor.advance();
      }
   }




   // DONE =====>

   /**
    * Advances the cursor through a JS template literal (e.g., `` `hello ${name}` ``), 
    * handling backslash escape sequences and recursively skipping embedded JS 
    * interpolation expressions (`${...}`).
    *
    * @param cursor - The character cursor, expected to be positioned at the opening backtick (`\``).
    */
   export function template(cursor: CharacterCursor) {
      // Skip the opening backtick
      cursor.advance();




      while (!cursor.eof) {
         const code = cursor.peek();

         // Skip escaped characters (e.g., \` or \\)
         if (code === char.backslash) {
            cursor.advance();

            if (!cursor.eof) {
               cursor.advance();
            }

            continue;
         }




         // Exit when reaching the closing backtick
         if (code === char.backtick) {
            cursor.advance();
            return;
         }

         // Handle JS string interpolation (${...})
         if (
            code === char.dollar &&
            cursor.peekAtOffset(1) === char.openBrace
         ) {
            // Consume ${
            cursor.advance();
            cursor.advance();
            skip.braceExpression(cursor);
            continue;
         }

         cursor.advance();
      }
   }



   /**
    * Advances the cursor through a single- or double-quoted string literal,
    * skipping escaped characters until the matching closing quote is found.
    *
    * @param cursor - The character cursor, expected to be positioned at the opening quote (`'` or `"`).
    */
   export function string(cursor: CharacterCursor) {
      const quote = cursor.peek();
      // Skip the opening quote
      cursor.advance();

      while (!cursor.eof) {
         const code = cursor.peek();

         // Skip escaped characters (e.g., \" or \\)
         if (code === char.backslash) {
            cursor.advance();

            if (!cursor.eof) {
               cursor.advance();
            }

            continue;
         }


         // Exit when reaching the matching closing quote
         if (code === quote) {
            cursor.advance();
            return;
         }

         cursor.advance();
      }
   }




   /**
    * Scans through a brace-enclosed JavaScript expression `{ ... }`, tracking
    * nested brace depth until the matching outer closing brace is found.
    *
    * Accounts for escaped characters, string literals, template literals, and 
    * premature HTML tags to safely ignore non-structural braces.
    *
    * @param cursor - The character cursor, expected to be positioned inside an open brace expression.
    */
   export function braceExpression(cursor: CharacterCursor) {
      let depth = 1;

      while (!cursor.eof) {
         const code = cursor.peek();

         // Skip escaped character sequences (e.g., inside regexes or raw tokens)
         if (code === char.backslash) {
            cursor.advance();
            if (!cursor.eof) {
               cursor.advance();
            }
            continue;
         }

         // Skip string literals so braces inside quotes are ignored
         if (is.quote(code)) {
            skip.string(cursor);
            continue;
         }

         // Skip template literals so interpolated string contents are ignored
         if (code === char.backtick) {
            skip.template(cursor);
            continue;
         }

         // Exit early if an unescaped HTML tag start is encountered, indicating an unclosed brace 
         if (is.tagLike(cursor)) {
            return;
         }
         // Increment depth for nested opening braces
         if (code === char.openBrace) {
            depth++;
            cursor.advance();
            continue;
         }
         // Decrement depth for closing braces; exit when the matching outer brace is reached
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


