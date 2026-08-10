import { CompilerContext } from "../pipeline/context";
import char from "../scanner/char";
import { consume } from "./consumer";
import { CharacterCursor } from "./cursor";
import { SyntaxKind, TokenizerContext } from "./token";

function dispatch(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();
  switch (code) {
    case char.lessThan:
      consume.markup(ctx);
      return;
    case char.openBrace:
      consume.expression(ctx);
      return;
    default:
      consume.text(ctx);
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

  ctx.tokens.push({
    kind: SyntaxKind.EndOfFile,
    start: ctx.cursor.source.length,
    end: ctx.cursor.source.length,
    value: undefined,
  });

  return ctx.tokens;
}
