import { CompilerContext } from "../pipeline/context";
import char from "../scanner/char";
import { consumeExpression } from "./consumers/expression";
import { consumeMarkup } from "./consumers/markup";
import { consumeText } from "./consumers/text";
import { CharacterCursor } from "./cursor";
import { TokenizerContext } from "./token";

function dispatch(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();
  switch (code) {
    case char.lessThan:
      consumeMarkup(ctx);
      return;
    case char.openBrace:
      consumeExpression(ctx);
      return;
    default:
      consumeText(ctx);
      return;
  }
}

export function tokenize(context: CompilerContext) {
  const ctx: TokenizerContext = {
    cursor: new CharacterCursor(context.source),
    tokens: [],
    diagnostics: context.diagnostics,
  };

  while (!ctx.cursor.eof) {
    dispatch(ctx);
  }

  return ctx.tokens;
}
