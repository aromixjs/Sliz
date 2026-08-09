import { Matcher } from "../token";

export const htmlComment: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Text) {
    return;
  }

  if (
    source.charCodeAt(cursor) !== char.lessThan ||
    source.charCodeAt(cursor + 1) !== char.exclamationMark ||
    source.charCodeAt(cursor + 2) !== char.minus ||
    source.charCodeAt(cursor + 3) !== char.minus
  ) {
    return;
  }

  let position = cursor + 4;

  while (position < source.length) {
    if (
      source.charCodeAt(position) === char.minus &&
      source.charCodeAt(position + 1) === char.minus &&
      source.charCodeAt(position + 2) === char.greaterThan
    ) {
      return {
        token: {
          kind: SyntaxKind.HtmlComment,
          start: cursor,
          end: position + 3,
          value: source.slice(cursor, position + 3),
        },
        nextCursor: position + 3,
        nextState: State.Text,
      };
    }
    position++;
  }

  return {
    token: {
      kind: SyntaxKind.HtmlComment,
      start: cursor,
      end: source.length,
      value: source.slice(cursor),
    },
    nextCursor: source.length,
    nextState: State.Text,
  };
};