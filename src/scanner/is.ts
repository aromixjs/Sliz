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

/**
 * Checks whether the cursor is at the start of a line comment: `//`.
 */
export function lineCommentStart(ctx: TokenizerContext) {
   const { cursor } = ctx;
   return cursor.peek() === char.slash && cursor.peek(1) === char.slash;
}

/**
 * Checks whether the cursor is at the start of a block comment: `/*`.
 */
export function blockCommentStart(ctx: TokenizerContext) {
   const { cursor } = ctx;
   return cursor.peek() === char.slash && cursor.peek(1) === char.asterisk;
}

/**
 * Checks whether the cursor is currently standing at the start of a `<!DOCTYPE` or `<!doctype` tag.
 *
 * @param ctx The tokenizer context containing the cursor.
 */
export function doctype(ctx: TokenizerContext) {
   const { cursor } = ctx;

   return (
      cursor.peek() === char.lessThan &&
      cursor.peek(1) === char.exclamationMark &&
      (cursor.peek(2) === char.upperD || cursor.peek(2) === char.lowerD) &&
      (cursor.peek(3) === char.upperO || cursor.peek(3) === char.lowerO) &&
      (cursor.peek(4) === char.upperC || cursor.peek(4) === char.lowerC) &&
      (cursor.peek(5) === char.upperT || cursor.peek(5) === char.lowerT) &&
      (cursor.peek(6) === char.upperY || cursor.peek(6) === char.lowerY) &&
      (cursor.peek(7) === char.upperP || cursor.peek(7) === char.lowerP) &&
      (cursor.peek(8) === char.upperE || cursor.peek(8) === char.lowerE)
   );
}

/**
 * Checks whether the cursor is at a `</script>` closing tag (case-insensitive).
 *
 * @param ctx The tokenizer context containing the cursor.
 */
export function scriptClosingTag(ctx: TokenizerContext) {
   const { cursor } = ctx;

   if (
      cursor.peek() !== char.lessThan ||
      cursor.peek(1) !== char.slash
   ) {
      return false;
   }

   const s = cursor.peek(2);
   const c = cursor.peek(3);
   const r = cursor.peek(4);
   const i = cursor.peek(5);
   const p = cursor.peek(6);
   const t = cursor.peek(7);

   return (
      (s === char.lowerS || s === char.upperS) &&
      (c === char.lowerC || c === char.upperC) &&
      (r === char.lowerR || r === char.upperR) &&
      (i === char.lowerI || i === char.upperI) &&
      (p === char.lowerP || p === char.upperP) &&
      (t === char.lowerT || t === char.upperT) &&
      (
         is.whitespace(cursor.peek(8)) ||
         cursor.peek(8) === char.greaterThan
      )
   );
}

/**
 * Checks whether the cursor is at a `</style>` closing tag (case-insensitive).
 *
 * @param ctx The tokenizer context containing the cursor.
 */
export function styleClosingTag(ctx: TokenizerContext) {
   const { cursor } = ctx;

   if (
      cursor.peek() !== char.lessThan ||
      cursor.peek(1) !== char.slash
   ) {
      return false;
   }

   const s = cursor.peek(2);
   const t = cursor.peek(3);
   const y = cursor.peek(4);
   const l = cursor.peek(5);
   const e = cursor.peek(6);

   return (
      (s === char.lowerS || s === char.upperS) &&
      (t === char.lowerT || t === char.upperT) &&
      (y === char.lowerY || y === char.upperY) &&
      (l === char.lowerL || l === char.upperL) &&
      (e === char.lowerE || e === char.upperE) &&
      (
         is.whitespace(cursor.peek(7)) ||
         cursor.peek(7) === char.greaterThan
      )
   );
}

/**
 * Checks whether the cursor is at an opening `<!--` sequence.
 *
 * @param ctx The tokenizer context containing the cursor.
 */
export function commentOpen(ctx: TokenizerContext) {
   const { cursor } = ctx;

   return (
      cursor.peek() === char.lessThan &&
      cursor.peek(1) === char.exclamationMark &&
      cursor.peek(2) === char.minus &&
      cursor.peek(3) === char.minus
   );
}

/**
 * Checks whether the cursor is at a closing `-->` sequence.
 *
 * @param ctx The tokenizer context containing the cursor.
 */
export function commentClose(ctx: TokenizerContext) {
   const { cursor } = ctx;

   return (
      cursor.peek() === char.minus &&
      cursor.peek(1) === char.minus &&
      cursor.peek(2) === char.greaterThan
   );
}


// ====>> done


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



/**
 * In Sliz, all quote types are treated identically.
 * Single quotes, double quotes, and backticks all support multiline strings.
 * Template-literal interpolation (${...}) is not supported.
 */
export function isQuote(code: number) {
   return code === char.singleQuote || code === char.doubleQuote || code === char.backtick;
}