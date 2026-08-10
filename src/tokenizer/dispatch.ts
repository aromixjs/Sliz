import Char from "../scanner/char";
import { consumeExpression } from "./consumers/expression";
import { consumeMarkup } from "./consumers/markup";
import { consumeText } from "./consumers/text";
import { TokenizerContext } from "./token";

export function dispatch(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();
  switch (code) {
    case Char.lessThan:
      consumeMarkup(ctx);
      return;
    case Char.openBrace:
      consumeExpression(ctx);
      return;
    default:
      consumeText(ctx);
      return;
  }
}
