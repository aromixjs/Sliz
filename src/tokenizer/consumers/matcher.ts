import char from "../../scanner/char";
import is from "../../scanner/is";
import skip from "../../scanner/skip";
import { Matcher, SyntaxKind } from "../Token";

export const text: Matcher = (ctx) => {
   let start = ctx.cursor;

   while (ctx.cursor < ctx.source.length) {
      const code = ctx.source.charCodeAt(ctx.cursor);
if (
      code === char.lessThan ||
      code === char.greaterThan ||
      code === char.openBrace ||
      code === char.closeBrace ||
      code === char.slash
    ) {
      break;
    }

      ctx.cursor++;
   }


   if (ctx.cursor > start) {
      ctx.tokens.push({
         kind: SyntaxKind.Text,
         start,
         end: ctx.cursor,
         value: ctx.source.slice(start, ctx.cursor),
      });
   }
};

export const lessThan: Matcher = (c) => {
   const { source, cursor, } = c;
   const current = source.charCodeAt(cursor);

   if (current === char.lessThan) {
      c.tokens.push({
         kind: SyntaxKind.LessThan,
         start: cursor,
         end: cursor + 1,
         value: "<",
      });

      c.cursor++;
   }
};

export const openBrace: Matcher = (c) => {
   const { source, cursor } = c;

   if (source.charCodeAt(cursor) === char.openBrace) {
      c.tokens.push({
         kind: SyntaxKind.OpenBrace,
         start: cursor,
         end: cursor + 1,
         value: "{",
      });

      c.cursor++;
   }

};

export const jsExpression: Matcher = (c) => {
   const { source, cursor, tokens } = c;

   const lastToken = tokens.at(-1)
   if (lastToken?.kind !== SyntaxKind.OpenBrace) {
      return
   }

   const end = skip.braceExpression(source, cursor - 1);
   if (end === -1) {
      tokens.push({
         kind: SyntaxKind.JsExpression,
         start: cursor,
         end: source.length,
         value: source.slice(cursor),
      });

      c.cursor = source.length
   } else {
      tokens.push({
         kind: SyntaxKind.JsExpression,
         start: cursor,
         end: end - 1,
         value: source.slice(cursor, end - 1),
      })

      c.cursor = end - 1
   }
};

export const closeBrace: Matcher = (c) => {
   const { source, cursor, tokens } = c;

   if (source.charCodeAt(cursor) === char.closeBrace) {

      tokens.push({
         kind: SyntaxKind.CloseBrace,
         start: cursor,
         end: cursor + 1,
         value: "}",
      })
      c.cursor++
   }

};

export const slash: Matcher = (c) => {
   const { source, cursor } = c;

   if (source.charCodeAt(cursor) === char.slash) {

      c.tokens.push({
         kind: SyntaxKind.Slash,
         start: cursor,
         end: cursor + 1,
         value: "/",
      });

      c.cursor++;
   }

};

export const tagName: Matcher = (c) => {
   const { source, cursor, tokens } = c;

   const previous = tokens.at(-1);
   const beforePrevious = tokens.at(-2);
   // if prev is < or / and its prev is <
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

   if (end > cursor) {
      c.tokens.push({
         kind: SyntaxKind.TagName,
         start: cursor,
         end,
         value: source.slice(cursor, end),
      });

      c.cursor = end;
   }


};