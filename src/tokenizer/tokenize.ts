import char from "../scanner/char";
import { is } from "../scanner/is";
import { consume } from "./consumer";
import { CharacterCursor } from "./cursor";
import { SyntaxKind, Token, TokenizerContext } from "./token";

function dispatch(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();

  if (is.tagLike(ctx.cursor)) {
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
  const cursor = new CharacterCursor(source, 0)
  const ctx = new TokenizerContext([], cursor);

  while (!ctx.cursor.eof) {
    dispatch(ctx);
  }

  ctx.emit({
    kind: SyntaxKind.EndOfFile,
    start: ctx.cursor.source.length,
    end: ctx.cursor.source.length,
    value: undefined
  });

  return ctx.tokens;
}
