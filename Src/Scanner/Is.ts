import { TokenizerContext } from "../Tokenizer/Token";
import char from "./Char";

export default {
  whitespace(code: number) {
    return code === char.space || code === char.tab || code === char.lineFeed ||
      code === char.carriageReturn;
  },

  alpha(code: number) {
    return (code >= char.lowerA && code <= char.lowerZ) ||
      (code >= char.upperA && code <= char.upperZ);
  },

  quote(code: number): boolean {
    return code === char.singleQuote || code === char.doubleQuote ||
      code === char.backtick;
  },

  regexStart(source: string, position: number) {
    let localPosition = position - 1;
    while (localPosition >= 0) {
      const code = source.charCodeAt(localPosition);
      if (!this.whitespace(code)) {
        switch (code) {
          case char.equals:
          case char.openParen:
          case char.openBracket:
          case char.openBrace:
          case char.semicolon:
          case char.comma:
          case char.exclamationMark:
          case char.ampersand:
          case char.pipe:
          case char.questionMark:
          case char.caret:
          case char.plus:
          case char.minus:
          case char.percent:
          case char.asterisk:
          case char.colon:
            return true;
          default:
            return false;
        }
      }
      localPosition--;
    }

    return true;
  },

  identifierStart(code: number) {
    return this.alpha(code) || code === char.underscore || code === char.dollar;
  },

  attributeName(code: number) {
    return (code > char.space && code !== char.equals &&
      code !== char.greaterThan && code !== char.doubleQuote &&
      code !== char.singleQuote && code !== char.slash &&
      code !== char.openBrace && code !== char.closeBrace);
  },

  doctype(ctx: TokenizerContext) {
    const cursor = ctx.cursor;

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
  },
};
