import { CharacterCursor } from "../tokenizer/cursor";
import { TokenizerContext } from "../tokenizer/token";
import char from "./char";
import { is, isQuote } from "./is";



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







