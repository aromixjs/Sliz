import char from "../../scanner/char";
import is from "../../scanner/is";
import { Matcher, State, SyntaxKind } from "../token";

export const lessThan: Matcher = (c) => {
  const { source, cursor } = c;
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
