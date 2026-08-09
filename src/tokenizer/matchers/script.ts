import char from "../../scanner/char";
import is from "../../scanner/is";
import skip from "../../scanner/skip";
import { Matcher, State, SyntaxKind } from "../token";

export const clientScript: Matcher = (c) => {
   const { source, cursor } = c;
   let position = cursor;

   while (position < source.length) {
      const code = source.charCodeAt(position);

      if (
         code === char.lessThan && source.charCodeAt(position + 1) === char.slash
      ) {
         break;
      }
      const before = position;

      if (is.quote(code)) {
         if (code === char.backtick) {
            position = skip.template(source, position);
         } else {
            position = skip.string(source, position);
         }
         continue;
      } else if (code === char.slash) {
         const next = source.charCodeAt(position + 1);

         if (next === char.slash) {
            position = skip.lineComment(source, position);
            continue;
         } else if (next === char.asterisk) {
            position = skip.blockComment(source, position);
            continue;
         } else if (is.regexStart(source, position)) {
            position = skip.regex(source, position);
            continue;
         } else {
            position++;
         }
      } else {
         position++;
      }

      if (position <= before) {
         position = before + 1;
      }
   }

   if (position === cursor) return undefined;

   return {
      token: {
         kind: SyntaxKind.ClientScript,
         start: cursor,
         end: position,
         value: source.slice(cursor, position),
      },
      nextCursor: position,
      nextState: State.Text,
   };
};

export const serverScript: Matcher = (c) => {
   const { source, cursor } = c;
   let position = cursor;
   while (position < source.length) {
      const code = source.charCodeAt(position);

      if (
         code === char.lessThan && source.charCodeAt(position + 1) === char.slash
      ) {
         break;
      }
      const before = position;

      if (is.quote(code)) {
         if (code === char.backtick) {
            position = skip.template(source, position);
         } else {
            position = skip.string(source, position);
         }
         continue;
      } else if (code === char.slash) {
         const next = source.charCodeAt(position + 1);

         if (next === char.slash) {
            position = skip.lineComment(source, position);
            continue;
         } else if (next === char.asterisk) {
            position = skip.blockComment(source, position);
            continue;
         } else if (is.regexStart(source, position)) {
            position = skip.regex(source, position);
            continue;
         } else {
            position++;
         }
      } else {
         position++;
      }

      if (position <= before) {
         position = before + 1;
      }
   }


   if (position === cursor) return undefined;


   return {
      token: {
         kind: SyntaxKind.ServerScript,
         start: cursor,
         end: position,
         value: source.slice(cursor, position),
      },
      nextCursor: position,
      nextState: State.Text,
   };

}