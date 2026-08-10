import { CompilerContext } from "../Pipeline/Context";
import { CharacterCursor } from "./Cursor";
import { Dispatch } from "./Dispatch";
import { TokenizerContext } from "./Token";

export function Tokenize(Context: CompilerContext) {
  const Ctx: TokenizerContext = {
    Cursor: new CharacterCursor(Context.Source),
    Tokens: [],
    Diagnostics: Context.Diagnostics,
  };

  while (!Ctx.Cursor.Eof) {
    Dispatch(Ctx);
  }

  return Ctx.Tokens;
}
