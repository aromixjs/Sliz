import char from "../../scanner/char";
import { is } from "../../scanner/is";
import { TokenizerContext } from "../token";
import { consumeClosingTag } from "./closingTag";
import { consumeDoctype } from "./doctype";
import { consumeHtmlComment } from "./htmlComment";
import { consumeOpeningTag } from "./openingTag";


/**
 * Determines what kind of HTML tag or element starts at the current position 
 * and hands off processing to the right consumer function.
 * 
 * **How it works:**
 * 1. Checks if the code starts with `<!--` to handle HTML comments (`consumeHtmlComment`).
 * 2. Checks if the code starts with `<!DOCTYPE` or `<!doctype` to handle doctype declarations (`consumeDoctype`).
 * 3. Checks if the code starts with `</` to handle closing tags like `</div>` (`consumeClosingTag`).
 * 4. Otherwise, treats it as an opening tag like `<div>` (`consumeOpeningTag`).
 * 
 * @param ctx The tokenizer context holding the cursor position and token list.
 */
export function consumeMarkup(ctx: TokenizerContext) {
  const cursor = ctx.cursor;

  if (
    cursor.peek() === char.lessThan && cursor.peek(1) === char.exclamationMark
  ) {
    if (cursor.peek(2) === char.minus && cursor.peek(3) === char.minus) {
      consumeHtmlComment(ctx);
      return;
    }

    if (is.doctype(ctx)) {
      consumeDoctype(ctx);
      return;
    }
  }

  if (cursor.peek() === char.lessThan && cursor.peek(1) === char.slash) {
    consumeClosingTag(ctx);
    return;
  }

  consumeOpeningTag(ctx);
}
