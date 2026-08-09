import char from "../../scanner/char";
import skip from "../../scanner/skip";
import { Matcher, State, SyntaxKind } from "../token";

export const style: Matcher = (c) => {
  const { source, cursor } = c;


  let position = cursor;

  while (position < source.length) {
    const code = source.charCodeAt(position);

    if (
      code === char.lessThan &&
      source.charCodeAt(position + 1) === char.slash
    ) {
      break;
    }

    // CSS string
    if (code === char.singleQuote || code === char.doubleQuote) {
      position = skip.string(source, position);
      continue;
    }
    // CSS comment
    if (
      code === char.slash &&
      source.charCodeAt(position + 1) === char.asterisk
    ) {
      position = skip.blockComment(source, position);
      continue;
    }

    position++;
  }

  if (position === cursor) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.Style,
      start: cursor,
      end: position,
      value: source.slice(cursor, position),
    },
    nextCursor: position,
    nextState: State.Text,
  };
};