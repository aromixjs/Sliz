import char from "./char";

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

  word(source: string, position: number, word: string) {
    if (position + word.length > source.length) {
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      if (source.charCodeAt(position + i) !== word.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  },
};
