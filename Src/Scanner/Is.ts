import Char from "./Char";

export default {
  whitespace(Code: number) {
    return Code === Char.space || Code === Char.tab || Code === Char.lineFeed ||
      Code === Char.carriageReturn;
  },

  alpha(Code: number) {
    return (Code >= Char.lowerA && Code <= Char.lowerZ) ||
      (Code >= Char.upperA && Code <= Char.upperZ);
  },

  quote(Code: number): boolean {
    return Code === Char.singleQuote || Code === Char.doubleQuote ||
      Code === Char.backtick;
  },

  regexStart(Source: string, Position: number) {
    let LocalPosition = Position - 1;
    while (LocalPosition >= 0) {
      const Code = Source.charCodeAt(LocalPosition);
      if (!this.whitespace(Code)) {
        switch (Code) {
          case Char.equals:
          case Char.openParen:
          case Char.openBracket:
          case Char.openBrace:
          case Char.semicolon:
          case Char.comma:
          case Char.exclamationMark:
          case Char.ampersand:
          case Char.pipe:
          case Char.questionMark:
          case Char.caret:
          case Char.plus:
          case Char.minus:
          case Char.percent:
          case Char.asterisk:
          case Char.colon:
            return true;
          default:
            return false;
        }
      }
      LocalPosition--;
    }

    return true;
  },

  identifierStart(Code: number) {
    return this.alpha(Code) || Code === Char.underscore || Code === Char.dollar;
  },

  attributeName(Code: number) {
    return (Code > Char.space && Code !== Char.equals &&
      Code !== Char.greaterThan && Code !== Char.doubleQuote &&
      Code !== Char.singleQuote && Code !== Char.slash &&
      Code !== Char.openBrace && Code !== Char.closeBrace);
  },
};
