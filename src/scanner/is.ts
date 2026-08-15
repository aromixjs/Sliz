import { CharacterCursor } from "../tokenizer/cursor";
import char from "./char";

export namespace is {
  export function whitespace(code: number) {
    return (
      code === char.space ||
      code === char.tab ||
      code === char.lineFeed ||
      code === char.carriageReturn
    );
  }

  export function attributeNameChar(code: number) {
    return (
      (code >= char.lowerA && code <= char.lowerZ) ||
      (code >= char.upperA && code <= char.upperZ) ||
      (code >= char.zero && code <= char.nine) ||
      code === char.minus ||
      code === char.underscore ||
      code === char.colon ||
      code === char.dot
    );
  }

  export function tagEnd(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.greaterThan ||
      (cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.greaterThan)
    );
  }

  export function htmlCommentClose(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.minus &&
      cursor.peekAtOffset(1) === char.minus &&
      cursor.peekAtOffset(2) === char.greaterThan
    );
  }

  export function htmlCommentOpen(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.lessThan &&
      cursor.peekAtOffset(1) === char.exclamationMark &&
      cursor.peekAtOffset(2) === char.minus &&
      cursor.peekAtOffset(3) === char.minus
    );
  }

  export function tagLike(cursor: CharacterCursor) {
    if (cursor.peek() !== char.lessThan) {
      return false;
    }

    const next = cursor.peekAtOffset(1);
    return is.alpha(next) || next === char.slash || next === char.exclamationMark;
  }

  export function quote(code: number) {
    return code === char.singleQuote || code === char.doubleQuote;
  }

  export function lineCommentStart(cursor: CharacterCursor) {
    return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.slash;
  }

  export function blockCommentStart(cursor: CharacterCursor) {
    return cursor.peek() === char.slash && cursor.peekAtOffset(1) === char.asterisk;
  }

  export function closingTagStart(cursor: CharacterCursor) {
    return (
      cursor.peek() === char.lessThan &&
      cursor.peekAtOffset(1) === char.slash &&
      is.alpha(cursor.peekAtOffset(2))
    );
  }

  export function alpha(code: number) {
    return (
      (code >= char.lowerA && code <= char.lowerZ) || (code >= char.upperA && code <= char.upperZ)
    );
  }
}
