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

  const endTag = tokens.findLast((token) =>
    token.kind === SyntaxKind.GreaterThan
  );

  if (!endTag) {
    return;
  }

  const endTagIndex = tokens.indexOf(endTag);

  const lessThan = tokens
    .slice(0, endTagIndex)
    .findLast((token) => token.kind === SyntaxKind.LessThan);

  if (!lessThan) {
    return;
  }

  const lessThanIndex = tokens.indexOf(lessThan);
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

    if (
      code === char.lessThan &&
      source.charCodeAt(position + 1) === char.slash
    ) {
      let end = position + 2;

      while (end < source.length && is.alpha(source.charCodeAt(end))) {
        end++;
      }

      if (source.slice(position + 2, end).toLowerCase() === name) {
        break;
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

export const style: Matcher = (c) => {
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

   if (tagName.value?.toLowerCase() !== "style") {
      return;
   }

   let position = cursor;

   while (position < source.length) {
      const code = source.charCodeAt(position);

      // CSS strings
      if (
         code === char.singleQuote ||
         code === char.doubleQuote
      ) {
         position = skip.string(source, position);
         continue;
      }

      // CSS comments
      if (
         code === char.slash &&
         source.charCodeAt(position + 1) === char.asterisk
      ) {
         position = skip.blockComment(source, position);
         continue;
      }

      // Let normal tag matchers handle </style>
      if (
         code === char.lessThan &&
         source.charCodeAt(position + 1) === char.slash
      ) {
         break;
      }

      position++;
   }

   if (position === cursor) {
      return;
   }

   c.tokens.push({
      kind: SyntaxKind.Style,
      start: cursor,
      end: position,
      value: source.slice(cursor, position),
   });

   c.cursor = position;
};




export const text: Matcher = (c) => {
   const { source, cursor } = c;

   let position = cursor;
   let textStart = cursor;

   while (position < source.length) {
      const code = source.charCodeAt(position);

      if (code === char.lessThan) {
         break;
      }

      if (code !== char.openBrace) {
         position++;
         continue;
      }

      // Emit text before the expression.
      if (position > textStart) {
         c.tokens.push({
            kind: SyntaxKind.Text,
            start: textStart,
            end: position,
            value: source.slice(textStart, position),
         });
      }

      const end = skip.braceExpression(source, position);

      if (end === -1) {
         // Unterminated expression.
         c.tokens.push({
            kind: SyntaxKind.Expression,
            start: position,
            end: source.length,
            value: source.slice(position),
         });

         c.cursor = source.length;
         return;
      }

      // Emit the complete expression, including {}.
      c.tokens.push({
         kind: SyntaxKind.Expression,
         start: position,
         end,
         value: source.slice(position, end),
      });

      position = end;
      textStart = position;
   }

   // Emit remaining text.
   if (position > textStart) {
      c.tokens.push({
         kind: SyntaxKind.Text,
         start: textStart,
         end: position,
         value: source.slice(textStart, position),
      });
   }

   if (position === cursor) {
      return;
   }

   c.cursor = position;
};





export const htmlComment: Matcher = (c) => {
   const { source, cursor } = c;

   if (
      source.charCodeAt(cursor) !== char.lessThan ||
      source.charCodeAt(cursor + 1) !== char.exclamationMark ||
      source.charCodeAt(cursor + 2) !== char.minus ||
      source.charCodeAt(cursor + 3) !== char.minus
   ) {
      return;
   }

   let end = cursor + 4;

   while (end + 2 < source.length) {
      if (
         source.charCodeAt(end) === char.minus &&
         source.charCodeAt(end + 1) === char.minus &&
         source.charCodeAt(end + 2) === char.greaterThan
      ) {
         end += 3;
         break;
      }

      end++;
   }

   c.tokens.push({
      kind: SyntaxKind.HtmlComment,
      start: cursor,
      end,
      value: source.slice(cursor, end),
   });

   c.cursor = end;
};

