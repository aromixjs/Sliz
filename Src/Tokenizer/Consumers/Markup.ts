import char from "../../Scanner/Char";
import is from "../../Scanner/Is";
import { TokenizerContext } from "../Token";
import { consumeClosingTag } from "./ClosingTag";
import { consumeDoctype } from "./Doctype";
import { consumeHtmlComment } from "./HtmlComment";
import { consumeOpeningTag } from "./OpeningTag";

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
