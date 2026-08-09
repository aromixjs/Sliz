import char from "../../scanner/char";
import is from "../../scanner/is";
import skip from "../../scanner/skip";
import { Matcher, State, SyntaxKind } from "../token";

export const attributeName: Matcher = (c) => {
  const { source, cursor } = c;
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

  const afterName = skip.whiteSpace(source, end);
  let nextState;


  if (source.charCodeAt(afterName) === char.equals) {
    nextState = State.AfterAttributeName
  } else {
    nextState = State.AfterAttributeValue
  }

  return {
    token: {
      kind: SyntaxKind.AttributeName,
      start,
      end,
      value: source.slice(start, end),
    },
    nextCursor: end,
    nextState: nextState,
  };
};



export const attributeEquals: Matcher = (c) => {
  const { source, cursor } = c;

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


export const attributeValue: Matcher = (c) => {
  const { source, cursor } = c;

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
  } else {
    while (end < source.length) {
      const code = source.charCodeAt(end);

      if (
        code === char.space ||
        code === char.tab ||
        code === char.lineFeed ||
        code === char.carriageReturn ||
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

  return {
    token: {
      kind: SyntaxKind.AttributeValue,
      start,
      end,
      value: source.slice(start, end),
    },
    nextCursor: end,
    nextState: State.AfterAttributeValue,
  };
};
