import { CompilerContext } from "../Pipeline/Context";
import { CharacterCursor } from "./Cursor";
import { Dispatch } from "./Dispatch";
import { TokenizerContext } from "./Token";


export function Tokenize(Context: CompilerContext) {
  const Ctx: TokenizerContext = {
    cursor: new CharacterCursor(Context.Source),
    tokens: [],
    diagnostics: Context.Diagnostics
  }

  while (!Ctx.cursor.eof) {
    Dispatch(Ctx);
  }

  return Ctx.tokens;
}
