import { DiagnosticCode, DiagnosticSeverity } from "../../Pipeline/Context";
import Char from "../../Scanner/Char";
import { SyntaxKind, TokenizerContext } from "../Token";

export function ConsumeDoctype(Ctx: TokenizerContext) {
   const Start = Ctx.Cursor.Clone();

   while (!Ctx.Cursor.Eof) {
      if (Ctx.Cursor.Peek() === Char.GreaterThan) {
         Ctx.Cursor.Advance();

         Ctx.Tokens.push({
            Kind: SyntaxKind.Doctype,
            Start: Start.Position,
            End: Ctx.Cursor.Position,
            Value: Ctx.Cursor.GetChars(Start),
         });


         break;
      }

      Ctx.Cursor.Advance();
   }


   Ctx.Diagnostics.push({
      Start: Start.Position,
      End: Ctx.Cursor.Source.length,
      Message: "Unterminated doctype",
      Code: DiagnosticCode.UnterminatedDoctype,
      Severity: DiagnosticSeverity.Error,
   });
   Ctx.Tokens.push({
      Kind: SyntaxKind.Doctype,
      Start: Start.Position,
      End: Ctx.Cursor.Source.length,
      Value: Ctx.Cursor.GetChars(Start),
   });

   Ctx.Cursor.AdvanceToEnd();

}

