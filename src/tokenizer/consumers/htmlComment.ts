import char from "../../scanner/char";
import { SyntaxKind, TokenizerContext } from "../token";

export function consumeHtmlComment(ctx: TokenizerContext) {
  const start = ctx.cursor.clone();

  ctx.cursor.advance(); // <
  ctx.cursor.advance(); // !
  ctx.cursor.advance(); // -
  ctx.cursor.advance(); // -

  while (!ctx.cursor.eof) {
    if (
      ctx.cursor.peek() === char.minus &&
      ctx.cursor.peek(1) === char.minus &&
      ctx.cursor.peek(2) === char.greaterThan
    ) {
      ctx.cursor.advance();
      ctx.cursor.advance();
      ctx.cursor.advance();
      break;
    }

    ctx.cursor.advance();
  }

  ctx.tokens.push({
    kind: SyntaxKind.HtmlComment,
    start: start.position,
    end: ctx.cursor.position,
    value: ctx.cursor.getChars(start),
  });
}
