import { CompilerContext } from "../pipeline/context";
import { CharacterCursor } from "./cursor";
import { dispatch } from "./dispatch";
import { TokenizerContext } from "./token";

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
