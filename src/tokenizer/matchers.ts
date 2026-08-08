import char from "../scanner/char";
import is from "../scanner/is";
import skip from "../scanner/skip";
import { Matcher, State, SyntaxKind } from "./token";

export const lessThan: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Text) {
    return;
  }

  const current = source.charCodeAt(cursor);
  const next = source.charCodeAt(cursor + 1);

  if (current !== char.lessThan || !is.alpha(next)) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.LessThan,
      start: cursor,
      end: cursor + 1,
      value: "<",
    },
    nextCursor: cursor + 1,
    nextState: State.BeforeOpeningTagName,
  };
};

export const lessThanSlash: Matcher = (c) => {
  const { source, cursor, state } = c;
  if (state !== State.Text) return;

  const current = source.charCodeAt(cursor);
  const next = source.charCodeAt(cursor + 1);
  const afterNext = source.charCodeAt(cursor + 2);

  if (
    current !== char.lessThan ||
    next !== char.slash ||
    !is.alpha(afterNext)
  ) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.LessThanSlash,
      start: cursor,
      end: cursor + 2,
      value: "</",
    },
    nextCursor: cursor + 2,
    nextState: State.BeforeClosingTagName,
  };
};

export const tagName: Matcher = (c) => {
  const { source, cursor, state } = c;

  const isOpening = state === State.BeforeOpeningTagName;
  const isClosing = state === State.BeforeClosingTagName;

  if (!isOpening && !isClosing) {
    return;
  }

  let end = cursor;

  while (end < source.length) {
    const code = source.charCodeAt(end);

    if (
      is.whitespace(code) || code === char.greaterThan || code === char.slash
    ) {
      break;
    }

    end++;
  }

  if (isOpening) {
    return {
      token: {
        kind: SyntaxKind.TagName,
        start: cursor,
        end,
        value: source.slice(cursor, end),
      },
      nextCursor: end,
      nextState: State.AfterOpeningTagName,
    };
  } else if (isClosing) {
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
};

export const attributeName: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.AfterOpeningTagName) {
    return;
  }

  let start = skip.whiteSpace(source, cursor);
  if (start >= source.length) {
    return;
  }

  const first = source.charCodeAt(start);

  if (
    first === char.greaterThan ||
    first === char.slash
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

  return {
    token: {
      kind: SyntaxKind.AttributeName,
      start,
      end,
      value: source.slice(start, end),
    },
    nextCursor: end,
    nextState: State.AfterAttributeName,
  };
};

export const attributeEquals: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.AfterAttributeName) {
    return;
  }

  const start = skip.whiteSpace(source, cursor);

  if (source.charCodeAt(start) !== char.equals) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.Equals,
      start,
      end: start + 1,
      value: "=",
    },
    nextCursor: start + 1,
    nextState: State.BeforeAttributeValue,
  };
};

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
