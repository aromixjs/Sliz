import char from "../scanner/char";
import is from "../scanner/is";
import skip from "../scanner/skip";
import { Matcher, SyntaxKind, TokenizerMode } from "./token";

// Matches <server>
function serverTagOpen(source: string, position: number) {
  if (source.charCodeAt(position) !== char.lessThan) {
    return undefined;
  }

  let localPosition = position + 1;
  localPosition = skip.whiteSpace(source, localPosition);
  const isServerWord = is.word(source, localPosition, "server");

  if (!isServerWord) {
    return undefined;
  }

  localPosition += "server".length;
  localPosition = skip.whiteSpace(source, localPosition);

  if (source.charCodeAt(localPosition) !== char.greaterThan) {
    return undefined;
  }
  return localPosition + 1;
}

// Matches </server>
function serverTagClose(source: string, position: number) {
  if (source.charCodeAt(position) !== char.lessThan) {
    return undefined;
  }

  let localPosition = position + 1;
  localPosition = skip.whiteSpace(source, localPosition);

  if (source.charCodeAt(localPosition) !== char.slash) {
    return undefined;
  }
  localPosition++;
  localPosition = skip.whiteSpace(source, localPosition);
  const isServerWord = is.word(source, localPosition, "server");

  if (!isServerWord) {
    return undefined;
  }
  localPosition += "server".length;
  localPosition = skip.whiteSpace(source, localPosition);

  if (source.charCodeAt(localPosition) !== char.greaterThan) {
    return undefined;
  }
  return localPosition + 1;
}



export const tagOpen: Matcher = (c) => {
  const { source, cursor, mode } = c

  if (mode !== TokenizerMode.Root) {
    return
  }

  const current = source.charCodeAt(cursor)
  const next = source.charCodeAt(cursor + 1)

  if (current !== char.lessThan || !is.alpha(next)) {
    return
  }


    return {
    token: {
      kind: SyntaxKind.LessThan,
      start: cursor,
      end: cursor + 1,
      value: '<'
    },
    nextCursor: cursor + 1,
    nextMode: TokenizerMode.Root
  }
  


}



export const closingTagOpen:Matcher=(c)=>{

  const { source, cursor, mode } = c

  if (mode !== TokenizerMode.Root) return

    const current = source.charCodeAt(cursor)
  const next = source.charCodeAt(cursor + 1)
  const afterNext = source.charCodeAt(cursor + 2)


  if (
    current !== char.lessThan ||
    next !== char.slash ||
    !is.alpha(afterNext)
  ) {
    return
  }


  return {
    token: {
      kind: SyntaxKind.LessThanSlash,
      start: cursor,
      end: cursor + 2,
      value: '</',
    },
    nextCursor: cursor + 2,
    nextMode: TokenizerMode.Root,
  }



}

// export const serverStart: Matcher = (ctx) => {
//   const { source, cursor, mode } = ctx;
//   if (mode !== TokenizerMode.Root) return undefined;

//   const serverOpen = serverTagOpen(source, cursor);

//   if (serverOpen === undefined) return undefined;

//   return {
//     token: {
//       kind: SyntaxKind.ServerStart,
//       start: cursor,
//       end: serverOpen,
//       value: source.slice(cursor, serverOpen),
//     },
//     nextCursor: serverOpen,
//     nextMode: TokenizerMode.Server,
//   };
// };

// export const serverEnd: Matcher = (ctx) => {
//   if (ctx.mode !== TokenizerMode.Server) return undefined;
//   const { source, cursor } = ctx;

//   const serverEnd = serverTagClose(source, cursor);
//   if (serverEnd === undefined) return undefined;

//   return {
//     token: {
//       kind: SyntaxKind.ServerEnd,
//       start: cursor,
//       end: serverEnd,
//       value: source.slice(cursor, serverEnd),
//     },
//     nextCursor: serverEnd,
//     nextMode: TokenizerMode.Root,
//   };
// };

// export const serverCode: Matcher = (ctx) => {
//   if (ctx.mode !== TokenizerMode.Server) return undefined;
//   const { source, cursor } = ctx;
//   let position = cursor;

//   while (position < source.length) {
//     const code = source.charCodeAt(position);

//     if (is.quote(code)) {
//       if (code === char.backtick) {
//         position = skip.template(source, position);
//       } else {
//         position = skip.string(source, position);
//       }
//       continue;
//     }

//     if (code === char.slash) {
//       const next = source.charCodeAt(position + 1);

//       if (next === char.slash) {
//         position = skip.lineComment(source, position);
//         continue;
//       }

//       if (next === char.asterisk) {
//         position = skip.blockComment(source, position);
//         continue;
//       }

//       if (is.regexStart(source, position)) {
//         position = skip.regex(source, position);
//         continue;
//       }
//     }

//     const serverEnd = serverTagClose(source, position);
//     if (serverEnd !== undefined) {
//       break;
//     }

//     position++;
//   }

//   if (position === cursor) return undefined;

//   return {
//     token: {
//       kind: SyntaxKind.ServerCode,
//       start: cursor,
//       end: position,
//       value: source.slice(cursor, position),
//     },
//     nextCursor: position,
//     nextMode: TokenizerMode.Server,
//   };
// };

// export const html: Matcher = (ctx) => {
//   if (ctx.mode !== TokenizerMode.Root) return undefined;
//   const { source, cursor } = ctx;
//   let position = cursor;

//   while (position < source.length) {
//     const openServer = serverTagOpen(source, position);
//     if (openServer !== undefined) break;
//     position++;
//   }

//   if (position === cursor) return undefined;

//   return {
//     token: {
//       kind: SyntaxKind.Html,
//       start: cursor,
//       end: position,
//       value: source.slice(cursor, position),
//     },
//     nextCursor: position,
//     nextMode: TokenizerMode.Server,
//   };
// };
