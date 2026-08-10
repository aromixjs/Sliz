import { TokenizerContext } from "../tokenizer/token";
import char from "./char";
import { is } from "./is";


export namespace skip {
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

   export function lineComment(ctx: TokenizerContext) {
      const { cursor } = ctx;

      // Consume //
      cursor.advance();
      cursor.advance();

      while (!cursor.eof) {
         if (cursor.peek() === char.lineFeed) {
            break;
         }

         cursor.advance();
      }
   }

   export function blockComment(ctx: TokenizerContext) {
      const { cursor } = ctx;

      // Consume /*
      cursor.advance();
      cursor.advance();

      while (!cursor.eof) {
         if (
            cursor.peek() === char.asterisk &&
            cursor.peek(1) === char.slash
         ) {
            cursor.advance();
            cursor.advance();
            return true;
         }

         cursor.advance();
      }

      return false;
   }

   export function string(ctx: TokenizerContext) {
      const { cursor } = ctx;
      const quote = cursor.peek();

      // Consume opening quote
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
            return true;
         }

         cursor.advance();
      }

      return false;
   }





   export function template(ctx: TokenizerContext) {
      const { cursor } = ctx;

      // Consume opening `
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
            return true;
         }

         if (
            code === char.dollar &&
            cursor.peek(1) === char.openBrace
         ) {
            cursor.advance();
            cursor.advance();

            if (!skip.braceExpression(ctx)) {
               return false;
            }

            continue;
         }

         cursor.advance();
      }

      return false;
   }




/**
 * Finds where a `{ ... }` expression ends, safely skipping over inner braces, strings, and escape characters.
 * 
 * **How it works:**
 * 1. Starts inside the outer `{` and tracks "depth" (starts at 1).
 * 2. Ignores escaped characters (e.g., `\{`) so they don't count as real braces.
 * 3. Skips over strings `'...'`, `"..."`, and template literals `` `...` `` so braces inside text are ignored.
 * 4. Adds to `depth` for every `{` and subtracts for every `}`.
 * 5. Returns the index after the matching `}` when `depth` hits 0 (or `-1` if it never closes).
 * 
 * @param source The full source code string being parsed.
 * @param start The character index where the opening `{` is located.
 * @returns The character index immediately after the closing `}`, or `-1` if unmatched.
 */
   export function braceExpression(ctx: TokenizerContext) {
      const { cursor } = ctx;
      let depth = 1;

      // Cursor is expected to be immediately after {
      while (!cursor.eof) {
         const code = cursor.peek();

         if (code === char.backslash) {
            cursor.advance();

            if (!cursor.eof) {
               cursor.advance();
            }

            continue;
         }

         if (
            code === char.singleQuote ||
            code === char.doubleQuote
         ) {
            if (!string(ctx)) {
               return false;
            }

            continue;
         }

         if (code === char.backtick) {
            if (!template(ctx)) {
               return false;
            }

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
               return true;
            }

            continue;
         }

         cursor.advance();
      }

      return false;
   }



   export function regex(ctx: TokenizerContext) {
      const { cursor } = ctx;
      let inCharClass = false;

      // Consume opening /
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
            return false;
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

            return true;
         }

         cursor.advance();
      }

      return false;
   }
};
