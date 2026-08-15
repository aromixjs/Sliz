import { CharacterCursor } from "../tokenizer/cursor";
import { TokenizerContext } from "../tokenizer/token";
import char from "./char";

/**
 * Checks whether a character code is whitespace (space, tab, line feed, carriage return).
 */
export function isWhitespace(code: number) {
   return code === char.space || code === char.tab || code === char.lineFeed ||
      code === char.carriageReturn;
}

/**
 * Checks whether a character code is a letter (a-z or A-Z).
 */
export function alpha(code: number) {
   return (code >= char.lowerA && code <= char.lowerZ) ||
      (code >= char.upperA && code <= char.upperZ);
}




/**
 * Checks whether a character is valid inside an HTML attribute name.
 * HTML spec: letters, digits, hyphen, underscore, colon, dot.
 */
export function attributeNameChar(code: number) {
   return (code >= char.lowerA && code <= char.lowerZ) ||
      (code >= char.upperA && code <= char.upperZ) ||
      (code >= 48 && code <= 57) ||  // 0-9
      code === char.minus ||
      code === char.underscore ||
      code === 58 ||  // colon
      code === char.dot;
}

/**
 * Checks whether a character code is the end of a tag: `>` or `/>`.
 */
export function tagEnd(ctx: TokenizerContext) {
   const { cursor } = ctx;
   return (
      cursor.peek() === char.greaterThan ||
      (cursor.peek() === char.slash && cursor.peek(1) === char.greaterThan)
   );
}







/**
 * Checks whether the cursor is at a valid HTML closing tag start: `</[A-Za-z]`.
 */
export function closingTagStart(ctx: TokenizerContext) {
   const { cursor } = ctx;
   return (
      cursor.peek() === char.lessThan &&
      cursor.peek(1) === char.slash &&
      is.alpha(cursor.peek(2))
   );
}





// ====>> done

/**
 * Checks whether the cursor is currently standing at the start of a `<!DOCTYPE` or `<!doctype` tag.
 */
export function isDoctype(cursor: CharacterCursor) {

   return (
      cursor.peek() === char.lessThan &&
      cursor.peekAtOffset(1) === char.exclamationMark &&
      (cursor.peekAtOffset(2) === char.upperD || cursor.peekAtOffset(2) === char.lowerD) &&
      (cursor.peekAtOffset(3) === char.upperO || cursor.peekAtOffset(3) === char.lowerO) &&
      (cursor.peekAtOffset(4) === char.upperC || cursor.peekAtOffset(4) === char.lowerC) &&
      (cursor.peekAtOffset(5) === char.upperT || cursor.peekAtOffset(5) === char.lowerT) &&
      (cursor.peekAtOffset(6) === char.upperY || cursor.peekAtOffset(6) === char.lowerY) &&
      (cursor.peekAtOffset(7) === char.upperP || cursor.peekAtOffset(7) === char.lowerP) &&
      (cursor.peekAtOffset(8) === char.upperE || cursor.peekAtOffset(8) === char.lowerE)
   );
}



/**
 * Checks whether the cursor is at a closing `-->` sequence.
 */
export function isCommentClose(cursor: CharacterCursor) {

   return (
      cursor.peek() === char.minus &&
      cursor.peekAtOffset(1) === char.minus &&
      cursor.peekAtOffset(2) === char.greaterThan
   );
}



/**
 * Checks whether the cursor is at an opening `<!--` sequence.
 */
export function isCommentOpen(cursor: CharacterCursor) {
   return (
      cursor.peek() === char.lessThan &&
      cursor.peekAtOffset(1) === char.exclamationMark &&
      cursor.peekAtOffset(2) === char.minus &&
      cursor.peekAtOffset(3) === char.minus
   );
}



/**
  * Checks whether the cursor is at the start of a valid HTML tag-like sequence.
  *
  * According to the HTML specification, a tag start is valid only when the opening
  * angle bracket (`<`) is immediately followed by an alphabetic character, a slash (`/`),
  * or an exclamation mark (`!`), with no whitespace in between.
  */
export function isTagLike(cursor: CharacterCursor) {
   if (cursor.peek() !== char.lessThan) {
      return false;
   }

   const next = cursor.peekAtOffset(1);
   return alpha(next) || next === char.slash || next === char.exclamationMark;
}




export function isQuote(code: number) {
   return code === char.singleQuote || code === char.doubleQuote;
}

export function lineCommentStart(cursor: CharacterCursor) {
   return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.slash;
}

export function blockCommentStart(cursor: CharacterCursor) {
   return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.asterisk;
}

