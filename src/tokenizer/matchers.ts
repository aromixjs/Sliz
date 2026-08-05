import char from "../scanner/char";
import is from "../scanner/is";
import skip from '../scanner/skip';
import { Matcher, SyntaxKind, TokenizerMode } from "./token";

const servertag = {
   // Matches <server>
   open(source: string, position: number) {
      if (source.charCodeAt(position) !== char.lessThan) {
         return undefined;
      }

      let localPosition = position + 1
      localPosition = skip.whiteSpace(source, localPosition)
      const isServerWord = is.word(source, localPosition, 'server')

      if (!isServerWord) {
         return undefined
      }


      localPosition += 'server'.length
      localPosition += skip.whiteSpace(source, position)

      if (source.charCodeAt(position) !== char.greaterThan) {
         return undefined;
      }
      return position + 1;
   },


   // Matches </server>
   close(source: string, position: number) {
      if (source.charCodeAt(position) !== char.lessThan) {
         return undefined;
      }

      let localPosition = position + 1
      localPosition = skip.whiteSpace(source, localPosition)

      if (source.charCodeAt(position) !== char.slash) {
         return undefined;
      }
      localPosition++
      localPosition = skip.whiteSpace(source, localPosition)
      const isServerWord = is.word(source, localPosition, 'server')

      if (!isServerWord) {
         return undefined
      }
      localPosition += 'server'.length
      localPosition += skip.whiteSpace(source, position)

      if (source.charCodeAt(position) !== char.greaterThan) {
         return undefined;
      }
      return position + 1;
   }


}





export default {
   serverStart(ctx) {
      const { source, cursor, mode } = ctx;
      if (mode !== TokenizerMode.Root) return undefined;

      const serverOpen = servertag.open(source, cursor)

      if (serverOpen === undefined) return undefined;

      return {
         token: {
            kind: SyntaxKind.ServerStart,
            start: cursor,
            end: serverOpen,
            value: source.slice(cursor, serverOpen),
         },
         nextCursor: serverOpen,
         nextMode: TokenizerMode.Server,
      };
   },



   serverEnd(ctx) {
      if (ctx.mode !== TokenizerMode.Server) return undefined;
      const { source, cursor } = ctx;

      const serverEnd = servertag.close(source, cursor);
      if (serverEnd === undefined) return undefined;

      return {
         token: {
            kind: SyntaxKind.ServerEnd,
            start: cursor,
            end: serverEnd,
            value: source.slice(cursor, serverEnd),
         },
         nextCursor: serverEnd,
         nextMode: TokenizerMode.Root,
      }
   },



   serverCode(ctx) {
      if (ctx.mode !== TokenizerMode.Server) return undefined;
      const { source, cursor } = ctx;
      let position = cursor;

      while (position < source.length) {
         const code = source.charCodeAt(position);

         if (is.quote(code)) {
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

            if (is.regexStart(source, position)) {
               position = skip.regex(source, position);
               continue;
            }
         }

         const serverEnd = servertag.close(source, position)
         if (serverEnd !== undefined) {
            break;
         }

         position++
      }

      if (position === cursor) return undefined;

      return {
         token: {
            kind: SyntaxKind.ServerCode,
            start: cursor,
            end: position,
            value: source.slice(cursor, position),
         },
         nextCursor: position,
         nextMode: TokenizerMode.Server
      };
   },

   html(ctx) {
      if (ctx.mode !== TokenizerMode.Root) return undefined;
      const { source, cursor } = ctx;
      let position = cursor;


      while (position < source.length) {
         const openServer = servertag.open(source, position)
         if (openServer !== undefined) break;
         position++;
      }

      if (position === cursor) return undefined;

      return {
         token: {
            kind: SyntaxKind.Html,
            start: cursor,
            end: position,
            value: source.slice(cursor, position),
         },
         nextCursor: position,
         nextMode: TokenizerMode.Server
      };
   }
} satisfies Record<string, Matcher>


