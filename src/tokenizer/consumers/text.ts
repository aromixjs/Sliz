import char from "../../scanner/char";
import { SyntaxKind, TokenizerContext } from "../token";

/**
 * Reads plain text until it hits a `<` or `{` character, or reaches the end of the file.
 * **How it works:**
 * 1. Remembers where it started.
 * 2. Keeps moving forward one character at a time.
 * 3. Stops if it finds a `<` or `{` (which signal a new tag or expression block).
 * 4. Saves the collected text into a "Text" token.
 * 
 * @param ctx The tokenizer context, which tracks where we are in the file and holds saved tokens.
 */
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
