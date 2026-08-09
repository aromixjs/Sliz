import { CompilerContext } from "../pipeline/context";
import { Maybe } from "../types/maybe";
import {
  attributeEquals,
  attributeName,
  attributeValue,
  expression,
  expressionEnd,
  expressionStart,
  lessThan,
  lessThanSlash,
  script,
  style,
  tagEnd,
  tagName,
  text,
} from "./matchers";
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
  const tagStack: string[] = [];
  let state = State.Text;
  let cursor = 0;
  const matchers = [
    lessThan,
    lessThanSlash,
    tagName,
    attributeName,
    attributeEquals,
    attributeValue,
    tagEnd,
    script,
    style,
    expressionStart,
    expressionEnd,
    expression,
    text,
  ];

  while (cursor < source.length) {
    const context: TokenizerContext = { source, cursor, state, tagStack };
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
