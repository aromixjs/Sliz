import char from "../scanner/char";
import { consume } from "./consumer";
import { SyntaxKind, Token, TokenizerContext } from "./token";

function dispatch(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();
  switch (code) {
    case char.lessThan:
      consume.markup(ctx);
      return;
    case char.openBrace:
      consume.expression(ctx);
      return;
    default:
      consume.text(ctx);
      return;
  }
}

export function tokenize(source: string): Token[] {
  const ctx = new TokenizerContext(source);

  while (!ctx.cursor.eof) {
    dispatch(ctx);
  }

  ctx.emit({
    kind: SyntaxKind.EndOfFile,
    start: ctx.cursor.source.length,
    end: ctx.cursor.source.length,
  });

  return ctx.tokens;
}
