import { CompilerContext } from "../pipeline/context";
import { Maybe } from "../types/maybe";
import { attributeEquals, attributeName, attributeValue } from "./matchers/attribute";
import { lessThan } from "./matchers/lessThan";
import { lessThanSlash } from "./matchers/lessThanSlash";
import { clientScript, serverScript } from "./matchers/script";
import { closingTagEnd, openingTagEnd } from "./matchers/tagEnd";
import { closingTagName, openingTagName } from "./matchers/tagName";

import {
  Matcher,
  MatchResult,
  State,
  SyntaxKind,
  Token,
  TokenizerContext,
} from "./token";

const stateToMatcher:Record<State,Array<Matcher>>={
Text:[lessThan,lessThanSlash],
ServerScript:[lessThanSlash,serverScript],
ClientScript:[lessThanSlash,clientScript],
Style:[lessThanSlash],
BeforeOpeningTagName:[openingTagName],
BeforeClosingTagName:[closingTagName],
AfterOpeningTagName:[attributeName,closingTagEnd],
AfterClosingTagName:[closingTagEnd],
AfterAttributeValue:[attributeName, openingTagEnd],
AfterAttributeName:[attributeEquals, openingTagEnd],
BeforeAttributeValue:[attributeValue],





}
export function tokenize(context: CompilerContext) {
  const { source } = context;
  const tokens: Token[] = [];
  const tagStack: string[] = [];
  let state = State.Text;
  let cursor = 0;
  const matchers = [
    lessThan,
    lessThanSlash,
    htmlComment,
    tagName,
    attributeName,
    attributeEquals,
    attributeValue,
    closingTagEnd,
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
