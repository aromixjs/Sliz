export default {
   space: 32,
   tab: 9,
   lineFeed: 10,
   carriageReturn: 13,
   singleQuote: 39,
   doubleQuote: 34,
   backtick: 96,
   backslash: 92,
   lessThan: 60,
   greaterThan: 62,
   slash: 47,
   asterisk: 42,
   equals: 61,
   openParen: 40,
   closeParen: 41,
   openBracket: 91,
   closeBracket: 93,
   openBrace: 123,
   closeBrace: 125,
   comma: 44,
   colon: 58,
   semicolon: 59,
   percent: 37,
   exclamationMark: 33,
   ampersand: 38,
   pipe: 124,
   questionMark: 63,
   caret: 94,
   plus: 43,
   minus: 45,
   dollar: 36,
   upperA: 65,
   upperZ: 90,
   lowerA: 97,
   lowerZ: 122,


   isWhiteSpace(code: number) {
      return code === this.space || code === this.tab || code === this.lineFeed ||
         code === this.carriageReturn;
   },

   isAlpha(code: number) {
      return (code >= this.lowerA && code <= this.lowerZ) ||
         (code >= this.upperA && code <= this.upperZ);
   },



   isQuote(code: number): boolean {
      return code === this.singleQuote || code === this.doubleQuote ||
         code === this.backtick;
   },

   isRegexStart(source: string, position: number) {
      let localPosition = position - 1;

      while (
         localPosition >= 0 && this.isWhiteSpace(source.charCodeAt(localPosition))
      ) {
         localPosition--;
      }

      if (localPosition < 0) {
         return true;
      }

      switch (source.charCodeAt(localPosition)) {
         case this.equals:
         case this.openParen:
         case this.openBracket:
         case this.openBrace:
         case this.semicolon:
         case this.comma:
         case this.exclamationMark:
         case this.ampersand:
         case this.pipe:
         case this.questionMark:
         case this.caret:
         case this.plus:
         case this.minus:
         case this.percent:
         case this.asterisk:
         case this.colon:
            return true;
         default:
            return false;
      }
   }
}


