import { CompilerContext } from "../pipeline/context";
import { Matcher, SyntaxKind, TokenizerContext } from "./token";


export function tokenize(context: CompilerContext) {
  const ctx: TokenizerContext = {
    source: context.source,
    cursor: 0,
    tagStack: [],
    tokens: []
  }

  const matchers: Matcher[] = []

  while (ctx.cursor < ctx.source.length) {
    const start = ctx.cursor;

    for (const matcher of matchers) {
      matcher(ctx);

      if (ctx.cursor !== start) {
        break;
      }

    }

    if (ctx.cursor === start) {
      ctx.tokens.push({
        kind: SyntaxKind.Unknown,
        start,
        end: start + 1,
        value: ctx.source[start],
      });
      ctx.cursor++;
    }
  }

  ctx.tokens.push({
    kind: SyntaxKind.EndOfFile,
    start: ctx.cursor,
    end: ctx.cursor,
    value: ctx.source[ctx.cursor],
  });



  return ctx.tokens;
}
