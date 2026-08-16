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
      code !== char.space &&
      code !== char.tab &&
      code !== char.lineFeed &&
      code !== char.carriageReturn &&
      code !== char.singleQuote &&
      code !== char.doubleQuote &&
      code !== char.greaterThan &&
      code !== char.slash &&
      code !== char.equals
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

  doctypeStart(cursor: CharacterCursor) {
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
  },

  tagEnd(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.greaterThan ||
      (cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.greaterThan)
    );
  },

  tagLike(cursor: CharacterCursor) {
    const next = cursor.peekAtOffset(1);
    return (
      cursor.peek() === char.lessThan &&
      (this.alpha(next) || next === char.slash || next === char.exclamationMark)
    );
  },
  closingTagStart(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.lessThan &&
      cursor.peekAtOffset(1) === char.slash &&
      this.alpha(cursor.peekAtOffset(2))
    );
  },

  //=== unused

  quote(code: number) {
    return code === char.singleQuote || code === char.doubleQuote;
  },
  lineCommentStart(cursor: CharacterCursor) {
    return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.slash;
  },
  blockCommentStart(cursor: CharacterCursor) {
    return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.asterisk;
  },

  alpha(code: number) {
    return (
      (code >= char.lowerA && code <= char.lowerZ) || (code >= char.upperA && code <= char.upperZ)
    );
  },
};
