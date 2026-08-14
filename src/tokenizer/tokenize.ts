import char from "../scanner/char";
import { is } from "../scanner/is";
import { consume } from "./consumer";
import { SyntaxKind, Token, TokenizerContext } from "./token";

function dispatch(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();

  if (is.tagStart(ctx)) {
    consume.markup(ctx);
    return;
  }

  if (code === char.openBrace) {
    consume.expression(ctx);
    return;
  }

  consume.text(ctx);
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
