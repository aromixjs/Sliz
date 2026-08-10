import Char from "../../Scanner/Char";
import { SyntaxKind, TokenizerContext } from "../Token";

export function ConsumeText(Ctx: TokenizerContext) {
  const Start = Ctx.Cursor.Clone();

  while (!Ctx.Cursor.Eof) {
    const Code = Ctx.Cursor.Peek();
    
    if (Code === Char.LessThan || Code === Char.OpenBrace) {
      break;
    }

    Ctx.Cursor.Advance();
  }

  if (Ctx.Cursor.Position === Start.Position) {
    return;
  }

  Ctx.Tokens.push({
    Kind: SyntaxKind.Text,
    Start: Start.Position,
    End: Ctx.Cursor.Position,
    Value: Ctx.Cursor.GetChars(Start),
  });
}
