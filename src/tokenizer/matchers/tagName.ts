import char from "../../scanner/char";
import is from "../../scanner/is";
import { Matcher, State, SyntaxKind } from "../token";

export const openingTagName: Matcher = (c) => {
   const { source, cursor, tagStack } = c;
   let end = cursor;


   while (end < source.length) {
      const code = source.charCodeAt(end);

      if (is.whitespace(code) || code === char.greaterThan || code === char.slash) {
         break;
      }

      end++;
   }

   if (end === cursor) {
      return;
   }

   let value = source.slice(cursor, end);
   tagStack.push(value);
   return {
      token: {
         kind: SyntaxKind.TagName,
         start: cursor,
         end,
         value,
      },
      nextCursor: end,
      nextState: State.AfterOpeningTagName,
   };
}

export const closingTagName: Matcher = (c) => {
   const { source, cursor } = c;

   let end = cursor;

   while (end < source.length) {
      const code = source.charCodeAt(end);

      if (is.whitespace(code) || code === char.greaterThan || code === char.slash) {
         break;
      }

      end++;
   }

   if (end === cursor) {
      return;
   }



   return {
      token: {
         kind: SyntaxKind.TagName,
         start: cursor,
         end,
         value: source.slice(cursor, end),
      },
      nextCursor: end,
      nextState: State.AfterClosingTagName,
   };
}
