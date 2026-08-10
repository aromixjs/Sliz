import char from "../../scanner/char";
import { SyntaxKind, TokenizerContext } from "../token";

/**
 * Reads an entire HTML comment starting from `<!--` until it reaches `-->` or the end of the file.
 * 
 * **How it works:**
 * 1. Remembers where the comment starts.
 * 2. Advances past the opening `<!--` sequence (4 characters).
 * 3. Loop through characters until it finds the closing `-->` sequence.
 * 4. Advances past `-->` and saves the complete comment as an `HtmlComment` token.
 * 
 * @param ctx The tokenizer context, which tracks cursor position and holds saved tokens.
 */
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
