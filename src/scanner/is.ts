import { CharacterCursor } from "../tokenizer/cursor";
import char from "./chars";

export default {
  whitespace(code: number) {
    return (
      code === char.space ||
      code === char.tab ||
      code === char.lineFeed ||
      code === char.carriageReturn
    );
  },

  attributeNameChar(code: number) {
    return (
      (code >= char.lowerA && code <= char.lowerZ) ||
      (code >= char.upperA && code <= char.upperZ) ||
      (code >= char.zero && code <= char.nine) ||
      code === char.minus ||
      code === char.underscore ||
      code === char.colon ||
      code === char.dot
    );
  },

  tagEnd(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.greaterThan ||
      (cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.greaterThan)
    );
  },

  htmlCommentEnd(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.minus &&
      cursor.peekAtOffset(1) === char.minus &&
      cursor.peekAtOffset(2) === char.greaterThan
    );
  },

  htmlCommentStart(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.lessThan &&
      cursor.peekAtOffset(1) === char.exclamationMark &&
      cursor.peekAtOffset(2) === char.minus &&
      cursor.peekAtOffset(3) === char.minus
    );
  },

  tagLike(cursor: CharacterCursor) {
    if (cursor.peek() !== char.lessThan) {
      return false;
    }

    const next = cursor.peekAtOffset(1);
    return this.alpha(next) || next === char.slash || next === char.exclamationMark;
  },
  quote(code: number) {
    return code === char.singleQuote || code === char.doubleQuote;
  },
  lineCommentStart(cursor: CharacterCursor) {
    return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.slash;
  },
  blockCommentStart(cursor: CharacterCursor) {
    return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.asterisk;
  },
  closingTagStart(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.lessThan &&
      cursor.peekAtOffset(1) === char.slash &&
      this.alpha(cursor.peekAtOffset(2))
    );
  },

  alpha(code: number) {
    return (
      (code >= char.lowerA && code <= char.lowerZ) || (code >= char.upperA && code <= char.upperZ)
    );
  },
};
