import char from "../../scanner/char";
import is from "../../scanner/is";
import { TokenizerContext } from "../token";
import { consumeClosingTag } from "./closingTag";
import { consumeDoctype } from "./doctype";
import { consumeHtmlComment } from "./htmlComment";
import { consumeOpeningTag } from "./openingTag";

export function consumeMarkup(ctx: TokenizerContext) {
  const cursor = ctx.cursor;

  if (cursor.peek() === char.lessThan && cursor.peek(1) === char.exclamationMark) {
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
