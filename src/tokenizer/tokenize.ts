import { CompilerContext } from "../pipeline/context";
import { Maybe } from "../types/maybe";
import { closingTagOpen, tagOpen } from "./matchers";
import {
  MatchResult,
  SyntaxKind,
  Token,
  TokenizerContext,
  TokenizerMode,
} from "./token";

export function tokenize(context: CompilerContext) {
  const { source } = context;
  const tokens: Token[] = [];
  let mode = TokenizerMode.Root;
  const matchers = [tagOpen,closingTagOpen];
  let cursor = 0;

  while (cursor < source.length) {
    const context: TokenizerContext = { source, cursor, mode };
    let result: Maybe<MatchResult>;

    for (const matcher of matchers) {
      result = matcher(context);
      if (result) break;
    }

    if (!result) {
      // result = {
      //   token: {
      //     kind: SyntaxKind.Unknown,
      //     start: cursor,
      //     end: cursor + 1,
      //     value: source[cursor],
      //   },
      //   nextCursor: cursor + 1,
      //   nextMode: mode,
      // };
      cursor++
    continue
    }


    tokens.push(result.token);
    mode = result.nextMode;
    cursor = result.nextCursor;
  }

  tokens.push({
    kind: SyntaxKind.EndOfFile,
    start: cursor,
    end: cursor,
  });
  return tokens;
}
