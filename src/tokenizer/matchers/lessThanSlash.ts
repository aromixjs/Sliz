import char from "../../scanner/char";
import is from "../../scanner/is";
import { Matcher, State, SyntaxKind } from "../token";

export const lessThanSlash: Matcher = (c) => {
  const { source, cursor } = c;
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
