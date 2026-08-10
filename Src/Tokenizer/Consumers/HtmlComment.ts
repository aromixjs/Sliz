import Char from "../../Scanner/Char";
import { SyntaxKind, TokenizerContext } from "../Token";


export function ConsumeHtmlComment(Ctx: TokenizerContext) {
   const Start = Ctx.Cursor.Clone();

   Ctx.Cursor.Advance(); // <
   Ctx.Cursor.Advance(); // !
   Ctx.Cursor.Advance(); // -
   Ctx.Cursor.Advance(); // -

   while (!Ctx.Cursor.Eof) {
      if (
         Ctx.Cursor.Peek() === Char.Minus &&
         Ctx.Cursor.Peek(1) === Char.Minus &&
         Ctx.Cursor.Peek(2) === Char.GreaterThan
      ) {
         Ctx.Cursor.Advance();
         Ctx.Cursor.Advance();
         Ctx.Cursor.Advance();
         break;
      }

      Ctx.Cursor.Advance();
   }

   Ctx.Tokens.push({
      Kind: SyntaxKind.HtmlComment,
      Start: Start.Position,
      End: Ctx.Cursor.Position,
      Value: Ctx.Cursor.GetChars(Start),
   });
}



