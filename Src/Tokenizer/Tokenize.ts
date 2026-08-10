import { CompilerContext } from "../Pipeline/Context";
import { CharacterCursor } from "./Cursor";
import { dispatch } from "./Dispatch";
import { TokenizerContext } from "./Token";

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
