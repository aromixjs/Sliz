
import char from "./common/char";
import * as match from "./common/match";
import * as skip from './common/skip';
import { LexerMode, Matcher, TokenKind } from "./tokernizer";


export const serverStart: Matcher = (ctx) => {
   if (ctx.mode !== LexerMode.Root) return undefined;

   const { source, cursor } = ctx;

   const serverOpen = match.serverTag({
      source,
      cursor,
      target: 'open'
   })

   if (serverOpen === undefined) return undefined;

   return {
      token: {
         kind: TokenKind.ServerStartToken,
         start: cursor,
         end: serverOpen,
         value: source.slice(cursor, serverOpen),
      },
      nextCursor: serverOpen,
      nextMode: LexerMode.Server,
   };
}



export const serverEnd: Matcher = (ctx) => {
   if (ctx.mode !== LexerMode.Server) return undefined;
   const { source, cursor } = ctx;

   const serverEnd = match.serverTag({ source, cursor, target: 'close' });
   if (serverEnd === undefined) return undefined;

   return {
      token: {
         kind: TokenKind.ServerEndToken,
         start: cursor,
         end: serverEnd,
         value: source.slice(cursor, serverEnd),
      },
      nextCursor: serverEnd,
      nextMode: LexerMode.Root,
   };
};




export const serverCode: Matcher = (ctx) => {
   if (ctx.mode !== LexerMode.Server) return undefined;
   const { source, cursor } = ctx;
   let position = cursor;

   while (position < source.length) {
      const code = source.charCodeAt(position);

      if (char.isQuote(code)) {
         if (code === char.backtick) {
            position = skip.template(source, position);
         } else {
            position = skip.string(source, position);
         }
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

         if (char.isRegexStart(source, position)) {
            position = skip.regex(source, position);
            continue;
         }
      }

      const serverEnd = match.serverTag({ source, cursor: position, target: 'close' })
      if (serverEnd !== undefined) {
         break;
      }

      position++
   }

   if (position === cursor) return undefined;

   return {
      token: {
         kind: TokenKind.ServerCodeToken,
         start: cursor,
         end: position,
         value: source.slice(cursor, position),
      },
      nextCursor: position,
   };
}



export const htmlChunk: Matcher = (ctx) => {
   if (ctx.mode !== LexerMode.Root) return undefined;
   const { source, cursor } = ctx;
   let position = cursor;


   while (position < source.length) {
      const openServer = match.serverTag({ source, cursor: position, target: 'open' })
      if (openServer !== undefined) break;
      position++;
   }

   if (position === cursor) return undefined;

   return {
      token: {
         kind: TokenKind.HtmlToken,
         start: cursor,
         end: position,
         value: source.slice(cursor, position),
      },
      nextCursor: position,
   };
}

