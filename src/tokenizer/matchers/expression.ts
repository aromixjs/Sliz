import char from "../../scanner/char";
import { Matcher, State } from "../token";




export const expressionStart: Matcher = (c) => {
  const { source, cursor } = c;


  if (source.charCodeAt(cursor) !== char.openBrace) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.ExpressionStart,
      start: cursor,
      end: cursor + 1,
      value: "{",
    },
    nextCursor: cursor + 1,
    nextState: State.Expression,
  };
};

export const expression: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Expression) {
    return;
  }

  const end = skip.braceExpression(source, cursor - 1);

  if (end === -1) {
    // unterminated expression will handle in ast 
    return {
      token: {
        kind: SyntaxKind.Expression,
        start: cursor,
        end: source.length,
        value: source.slice(cursor),
      },
      nextCursor: source.length,
      nextState: State.Text,
    };
  }

  return {
    token: {
      kind: SyntaxKind.Expression,
      start: cursor,
      end: end - 1,
      value: source.slice(cursor, end - 1),
    },
    nextCursor: end - 1,
    nextState: State.Expression,
  };
};

export const expressionEnd: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Expression) {
    return;
  }

  if (source.charCodeAt(cursor) !== char.closeBrace) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.ExpressionEnd,
      start: cursor,
      end: cursor + 1,
      value: "}",
    },
    nextCursor: cursor + 1,
    nextState: State.Text,
  };
};
