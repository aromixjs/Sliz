import char from "../../scanner/char";
import skip from "../../scanner/skip";
import { Matcher, State, SyntaxKind } from "../token";


export const openingTagEnd: Matcher = (c) => {
  const { source, cursor, tagStack } = c;
  const start = skip.whiteSpace(source, cursor);


  if (source.charCodeAt(start) === char.slash) {

    if (source.charCodeAt(start + 1) !== char.greaterThan) {
      return;
    }

    tagStack.pop();
    return {
      token: {
        kind: SyntaxKind.SlashGreaterThan,
        start,
        end: start + 2,
        value: source.slice(start, start + 2),
      },
      nextCursor: start + 2,
      nextState: State.Text,
    };
  }

  if (source.charCodeAt(start) !== char.greaterThan) {
    return;
  }

  let nextState = State.Text;
  const tagName = tagStack[tagStack.length - 1]?.toLowerCase();
  if (tagName === "server") nextState = State.ServerScript;
  else if (tagName === "style") nextState = State.Style;
  else if (tagName === "script") nextState = State.ClientScript;

  return {
    token: {
      kind: SyntaxKind.GreaterThan,
      start,
      end: start + 1,
      value: source.slice(start, start + 1),
    },
    nextCursor: start + 1,
    nextState,
  };

}

export const closingTagEnd: Matcher = (c) => {
  const { source, cursor, tagStack } = c;

  const start = skip.whiteSpace(source, cursor);

  if (source.charCodeAt(start) === char.slash) {
    if (source.charCodeAt(start + 1) !== char.greaterThan) {
      return;
    }
    tagStack.pop();
    return {
      token: {
        kind: SyntaxKind.SlashGreaterThan,
        start,
        end: start + 2,
        value: source.slice(start, start + 2),
      },
      nextCursor: start + 2,
      nextState: State.Text,
    };
  }

  if (source.charCodeAt(start) !== char.greaterThan) {
    return;
  }


  tagStack.pop();


  return {
    token: {
      kind: SyntaxKind.GreaterThan,
      start,
      end: start + 1,
      value: source.slice(start, start + 1),
    },
    nextCursor: start + 1,
    nextState: State.Text,
  };
};