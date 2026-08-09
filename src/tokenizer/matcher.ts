import char from "../scanner/char";
import is from "../scanner/is";
import skip from "../scanner/skip";
import { Matcher, SyntaxKind } from "./token";


export const lessThan: Matcher = (c) => {
   const { source, cursor, } = c;

   const current = source.charCodeAt(cursor);
   const next = source.charCodeAt(cursor + 1);

   if (current !== char.lessThan) {
      return;
   }

   c.tokens.push({
      kind: SyntaxKind.LessThan,
      start: cursor,
      end: cursor + 1,
      value: "<",
   });

   c.cursor++;
};

export const slash: Matcher = (c) => {
   const { source, cursor } = c;

   if (source.charCodeAt(cursor) !== char.slash) {
      return;
   }

   c.tokens.push({
      kind: SyntaxKind.Slash,
      start: cursor,
      end: cursor + 1,
      value: "/",
   });

   c.cursor++;
};



export const tagName: Matcher = (c) => {
   const { source, cursor, tokens } = c;

   const previous = tokens.at(-1);
   const beforePrevious = tokens.at(-2);
   const isTagName = previous?.kind === SyntaxKind.LessThan || (previous?.kind === SyntaxKind.Slash && beforePrevious?.kind === SyntaxKind.LessThan)

   if (!isTagName) {
      return;
   }


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

   c.tokens.push({
      kind: SyntaxKind.TagName,
      start: cursor,
      end,
      value: source.slice(cursor, end),
   });

   c.cursor = end;
};



export const attributeName: Matcher = (c) => {

   const { source, cursor, tokens } = c;
   const previous = tokens.at(-1);

   if (
      previous?.kind !== SyntaxKind.TagName &&
      previous?.kind !== SyntaxKind.AttributeValue &&
      previous?.kind !== SyntaxKind.AttributeName
   ) {
      return;
   }



   const start = skip.whiteSpace(source, cursor)
   if (start >= source.length) {
      return
   }


   const first = source.charCodeAt(start);


   if (
      first === char.greaterThan ||
      first === char.slash ||
      first === char.equals
   ) {
      return;
   }
   let end = start;

   while (end < source.length) {
      const code = source.charCodeAt(end);

      if (!is.attributeName(code)) {
         break;
      }

      end++;
   }
   if (end === start) {
      return;
   }


   c.tokens.push({
      kind: SyntaxKind.AttributeName,
      start,
      end,
      value: source.slice(start, end),
   });

   c.cursor = end;


}

export const equals: Matcher = (c) => {
   const { source, cursor } = c;

   const start = skip.whiteSpace(source, cursor);

   if (source.charCodeAt(start) !== char.equals) {
      return;
   }

   c.tokens.push({
      kind: SyntaxKind.Equals,
      start,
      end: start + 1,
      value: "=",
   });

   c.cursor = start + 1;
};


export const attributeValue: Matcher = (c) => {
   const { source, cursor, tokens } = c;

   const equals = tokens.at(-1);
   const attribute = tokens.at(-2);

   if (
      equals?.kind !== SyntaxKind.Equals ||
      attribute?.kind !== SyntaxKind.AttributeName
   ) {
      return;
   }

   const start = skip.whiteSpace(source, cursor);
   if (start >= source.length) {
      return;
   }


   let end = start;
   const code = source.charCodeAt(end);

   if (code === char.singleQuote || code === char.doubleQuote) {
      end = skip.string(source, end);
   } else if (code === char.openBrace) {
      end = skip.braceExpression(source, end);

      if (end === -1) {
         return;
      }

   } else {
      while (end < source.length) {
         const code = source.charCodeAt(end);

         if (
            is.whitespace(code) ||
            code === char.greaterThan ||
            code === char.slash
         ) {
            break;
         }

         end++;
      }
   }

   if (end === start) {
      return;
   }

   c.tokens.push({
      kind: SyntaxKind.AttributeValue,
      start,
      end,
      value: source.slice(start, end),
   });

   c.cursor = end;

};




export const greaterThan: Matcher = (c) => {
   const { source, cursor } = c;

   const start = skip.whiteSpace(source, cursor);

   if (source.charCodeAt(start) !== char.greaterThan) {
      return;
   }

   c.tokens.push({
      kind: SyntaxKind.GreaterThan,
      start,
      end: start + 1,
      value: ">",
   });

   c.cursor = start + 1;
};



export const script: Matcher = (c) => {
   const { source, cursor, tokens } = c;

   const greaterThanIndex = tokens.findLastIndex(
      (token) => token.kind === SyntaxKind.GreaterThan,
   );

   if (greaterThanIndex === -1) {
      return;
   }

   const lessThanIndex = tokens.findLastIndex(
      (token, index) =>
         index < greaterThanIndex &&
         token.kind === SyntaxKind.LessThan,
   );

   if (lessThanIndex === -1) {
      return;
   }

   const tagName = tokens[lessThanIndex + 1];

   if (tagName?.kind !== SyntaxKind.TagName) {
      return;
   }
   const name = tagName.value?.toLowerCase();


   if (name !== "server" && name !== "script") {
      return;
   }


   let position = cursor;

   while (position < source.length) {

      const code = source.charCodeAt(position);

      if (
         code === char.lessThan &&
         source.charCodeAt(position + 1) === char.slash
      ) {
         break;
      }

      if (is.quote(code)) {
         position =
            code === char.backtick
               ? skip.template(source, position)
               : skip.string(source, position);

         continue;
      }
      if (code === char.slash) {
         const next = source.charCodeAt(position + 1);

         if (next === char.slash) {
            position = skip.lineComment(source, position);
            continue;
         }

         if (next === char.asterisk) {
            position = skip.blockComment(source, position);
            continue;
         }

         if (is.regexStart(source, position)) {
            position = skip.regex(source, position);
            continue;
         }
      }

      position++;

   }

   if (position === cursor) {
      return;
   }

   c.tokens.push({
      kind:
         name === "server"
            ? SyntaxKind.ServerScript
            : SyntaxKind.ClientScript,
      start: cursor,
      end: position,
      value: source.slice(cursor, position),
   });

   c.cursor = position;



};

// export const style: Matcher = (c) => {
//   const { source, cursor, state } = c;

//   if (state !== State.Style) {
//     return;
//   }
//   let position = cursor;

//   while (position < source.length) {
//     const code = source.charCodeAt(position);

//     if (
//       code === char.lessThan &&
//       source.charCodeAt(position + 1) === char.slash
//     ) {
//       break;
//     }

//     // CSS string
//     if (code === char.singleQuote || code === char.doubleQuote) {
//       position = skip.string(source, position);
//       continue;
//     }
//     // CSS comment
//     if (
//       code === char.slash &&
//       source.charCodeAt(position + 1) === char.asterisk
//     ) {
//       position = skip.blockComment(source, position);
//       continue;
//     }

//     position++;
//   }

//   if (position === cursor) {
//     return;
//   }

//   return {
//     token: {
//       kind: SyntaxKind.Style,
//       start: cursor,
//       end: position,
//       value: source.slice(cursor, position),
//     },
//     nextCursor: position,
//     nextState: State.Text,
//   };
// };

// export const expressionStart: Matcher = (c) => {
//   const { source, cursor, state } = c;

//   if (state !== State.Text) {
//     return;
//   }

//   if (source.charCodeAt(cursor) !== char.openBrace) {
//     return;
//   }

//   return {
//     token: {
//       kind: SyntaxKind.ExpressionStart,
//       start: cursor,
//       end: cursor + 1,
//       value: "{",
//     },
//     nextCursor: cursor + 1,
//     nextState: State.Expression,
//   };
// };

// export const expression: Matcher = (c) => {
//   const { source, cursor, state } = c;

//   if (state !== State.Expression) {
//     return;
//   }

//   const end = skip.braceExpression(source, cursor - 1);

//   if (end === -1) {
//     // unterminated expression will handle in ast
//     return {
//       token: {
//         kind: SyntaxKind.Expression,
//         start: cursor,
//         end: source.length,
//         value: source.slice(cursor),
//       },
//       nextCursor: source.length,
//       nextState: State.Text,
//     };
//   }

//   return {
//     token: {
//       kind: SyntaxKind.Expression,
//       start: cursor,
//       end: end - 1,
//       value: source.slice(cursor, end - 1),
//     },
//     nextCursor: end - 1,
//     nextState: State.Expression,
//   };
// };

// export const expressionEnd: Matcher = (c) => {
//   const { source, cursor, state } = c;

//   if (state !== State.Expression) {
//     return;
//   }

//   if (source.charCodeAt(cursor) !== char.closeBrace) {
//     return;
//   }

//   return {
//     token: {
//       kind: SyntaxKind.ExpressionEnd,
//       start: cursor,
//       end: cursor + 1,
//       value: "}",
//     },
//     nextCursor: cursor + 1,
//     nextState: State.Text,
//   };
// };

// export const htmlComment: Matcher = (c) => {
//   const { source, cursor, state } = c;

//   if (state !== State.Text) {
//     return;
//   }

//   if (
//     source.charCodeAt(cursor) !== char.lessThan ||
//     source.charCodeAt(cursor + 1) !== char.exclamationMark ||
//     source.charCodeAt(cursor + 2) !== char.minus ||
//     source.charCodeAt(cursor + 3) !== char.minus
//   ) {
//     return;
//   }

//   let position = cursor + 4;

//   while (position < source.length) {
//     if (
//       source.charCodeAt(position) === char.minus &&
//       source.charCodeAt(position + 1) === char.minus &&
//       source.charCodeAt(position + 2) === char.greaterThan
//     ) {
//       return {
//         token: {
//           kind: SyntaxKind.HtmlComment,
//           start: cursor,
//           end: position + 3,
//           value: source.slice(cursor, position + 3),
//         },
//         nextCursor: position + 3,
//         nextState: State.Text,
//       };
//     }
//     position++;
//   }

//   return {
//     token: {
//       kind: SyntaxKind.HtmlComment,
//       start: cursor,
//       end: source.length,
//       value: source.slice(cursor),
//     },
//     nextCursor: source.length,
//     nextState: State.Text,
//   };
// };

// export const text: Matcher = (c) => {
//   const { source, cursor, state } = c;

//   if (state !== State.Text) {
//     return;
//   }

//   let end = cursor;

//   while (end < source.length) {
//     const code = source.charCodeAt(end);

//     if (
//       code === char.openBrace ||
//       code === char.lessThan
//     ) {
//       break;
//     }

//     end++;
//   }

//   if (end === cursor) {
//     return;
//   }

//   return {
//     token: {
//       kind: SyntaxKind.Text,
//       start: cursor,
//       end,
//       value: source.slice(cursor, end),
//     },
//     nextCursor: end,
//     nextState: State.Text,
//   };
// };
