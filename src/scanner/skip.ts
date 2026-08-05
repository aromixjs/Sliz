import char from "./char";
import is from "./is";

export default {
   whiteSpace(source: string, cursor: number) {
      while (cursor < source.length) {
         const code = source.charCodeAt(cursor);

         if (
            code !== char.space &&
            code !== char.tab &&
            code !== char.lineFeed &&
            code !== char.carriageReturn
         ) {
            break;
         }

         cursor++;
      }

      return cursor;
   },

   lineComment(source: string, start: number) {
      let position = start + 2;
      while (position < source.length && source.charCodeAt(position) !== char.lineFeed) {
         position++;
      }

      return position;
   },
   blockComment(source: string, start: number) {
      let position = start + 2;

      while (position < source.length) {
         if (
            source.charCodeAt(position) === char.asterisk &&
            source.charCodeAt(position + 1) === char.slash
         ) {
            return position + 2;
         }

         position++;
      }

      return position;
   },
   string(source: string, start: number) {
      const quoteCode = source.charCodeAt(start);
      let position = start + 1;

      while (position < source.length) {

         const code = source.charCodeAt(position);

         if (code === char.backslash) {
            position += 2;
         } else if (code === quoteCode) {
            return position + 1;
         } else {
            position++;
         }

      }

      return position;
   },


   template(source: string, start: number) {
      let position = start + 1;

      while (position < source.length) {
         const code = source.charCodeAt(position);

         if (code === char.backslash) {
            position += 2;
            continue;
         }

         if (code === char.backtick) {
            return position + 1;
         }

         if (
            code === char.dollar &&
            source.charCodeAt(position + 1) === char.openBrace
         ) {
            position = this.braceExpression(source, position + 2);
            continue;
         }

         position++;
      }

      return position;
   },

   braceExpression(source: string, start: number) {
      let position = start;
      let depth = 1;

      while (position < source.length) {
         const code = source.charCodeAt(position);

         if (code === char.backslash) {
            position += 2;
            continue;
         }

         if (code === char.singleQuote || code === char.doubleQuote) {
            position = this.string(source, position);
            continue;
         }

         if (code === char.backtick) {
            position = this.template(source, position);
            continue;
         }

         if (code === char.openBrace) {
            depth++;
         } else if (code === char.closeBrace) {
            depth--;

            if (depth === 0) {
               return position + 1;
            }
         }

         position++;
      }

      return position;
   },
   regex(source: string, start: number) {
      let position = start + 1;
      let inCharClass = false;

      while (position < source.length) {
         const code = source.charCodeAt(position);

         if (code === char.backslash) {
            position += 2;
            continue;
         }

         if (code === char.lineFeed) {
            return start + 1;
         }

         if (code === char.openBracket) {
            inCharClass = true;
         }

         if (code === char.closeBracket) {
            inCharClass = false;
         }

         if (code === char.slash && !inCharClass) {
            position++;

            const code = source.charCodeAt(position)
            while (position < source.length && is.alpha(code)) {
               position++;
            }

            return position;
         }

         position++;
      }

      return position;
   }
}














