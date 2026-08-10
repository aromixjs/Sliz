import Char from "../Scanner/Char";
import { ConsumeExpression } from "./Consumers/Expression";
import { ConsumeMarkup } from "./Consumers/Markup";
import { ConsumeText } from "./Consumers/Text";
import { TokenizerContext } from "./Token";

export function Dispatch(Ctx: TokenizerContext) {
  const Code = Ctx.Cursor.Peek();
  switch (Code) {
    case Char.LessThan:
      ConsumeMarkup(Ctx);
      return;
    case Char.OpenBrace:
      ConsumeExpression(Ctx);
      return;
    default:
      ConsumeText(Ctx);
      return;
  }
}
