import { CompilerContext } from "../pipeline/context";
import { attributeName, attributeValue, equals, greaterThan, htmlComment, lessThan, script, slash, style, tagName, text } from "./matcher";
import { Matcher, SyntaxKind, TokenizerContext } from "./token";


export function tokenize(context: CompilerContext) {
  const ctx: TokenizerContext = {
    source: context.source,
    cursor: 0,
    tokens: []
  }

  const matchers: Matcher[] = [lessThan,slash,tagName,attributeName,equals,attributeValue,greaterThan,script,style,text,htmlComment]

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
