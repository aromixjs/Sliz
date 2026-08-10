import Char from "../Scanner/Char";
import { consumeExpression } from "./Consumers/Expression";
import { consumeMarkup } from "./Consumers/Markup";
import { consumeText } from "./Consumers/Text";
import { TokenizerContext } from "./Token";

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
