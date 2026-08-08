import { CompilerContext } from "../pipeline/context";
import { Maybe } from "../types/maybe";
import { attributeEquals, attributeName, lessThan, lessThanSlash, tagName } from "./matchers";
import {
  MatchResult,
  State,
  SyntaxKind,
  Token,
  TokenizerContext,
} from "./token";

export function tokenize(context: CompilerContext) {
  const { source } = context;
  const tokens: Token[] = [];
  let state = State.Text;
  const matchers = [lessThan, lessThanSlash, tagName, attributeName,attributeEquals];
  let cursor = 0;

  while (cursor < source.length) {
    const context: TokenizerContext = { source, cursor, state };
    let result: Maybe<MatchResult>;

    for (const matcher of matchers) {
      result = matcher(context);
      if (result) break;
    }

    if (!result) {
      result = {
        token: {
          kind: SyntaxKind.Unknown,
          start: cursor,
          end: cursor + 1,
          value: source[cursor],
        },
        nextCursor: cursor + 1,
        nextState: state,
      };
    }
    tokens.push(result.token);
    state = result.nextState;
    cursor = result.nextCursor;
  }

  tokens.push({
    kind: SyntaxKind.EndOfFile,
    start: cursor,
    end: cursor,
    value: source[cursor],
  });
  return tokens;
}
