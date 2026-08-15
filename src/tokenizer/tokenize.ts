import char from "../scanner/char";
import { isTagLike } from "../scanner/is";
import { consumeMarkup } from "./consumer/html";
import { consumeExpression } from "./consumer/interpolation";
import { consumeText } from "./consumer/text";
import { CharacterCursor } from "./cursor";
import { Token, TokenizerContext, TokenType } from "./token";

function dispatch(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();
  
  if (isTagLike(ctx.cursor)) {
    consumeMarkup(ctx);
    return;
  }

  if (code === char.openBrace) {
    consumeExpression(ctx);
    return;
  }

  consumeText(ctx);
}

export function tokenize(source: string): Token[] {
  const cursor = new CharacterCursor(source, 0)
  const ctx = new TokenizerContext(cursor);

  while (!ctx.cursor.eof) {
    dispatch(ctx);
  }

  ctx.emit({
    type: TokenType.EndOfFile,
    start: ctx.cursor.source.length,
    end: ctx.cursor.source.length,
    value: undefined
  });

  return ctx.tokens;
}
