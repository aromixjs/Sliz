import char from "../../scanner/char";
import { SyntaxKind, TokenizerContext } from "../token";

export function consumeText(ctx: TokenizerContext) {
  const start = ctx.cursor.clone();

  while (!ctx.cursor.eof) {
    const code = ctx.cursor.peek();

    if (code === char.lessThan || code === char.openBrace) {
      break;
    }

    ctx.cursor.advance();
  }

  if (ctx.cursor.position === start.position) {
    return;
  }

  ctx.tokens.push({
    kind: SyntaxKind.Text,
    start: start.position,
    end: ctx.cursor.position,
    value: ctx.cursor.getChars(start),
  });
}
