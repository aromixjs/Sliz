import { DiagnosticCode, DiagnosticSeverity } from "../../Pipeline/Context";
import Char from "../../Scanner/Char";
import Is from "../../Scanner/Is";
import { SyntaxKind, TokenizerContext } from "../Token";

export function ConsumeOpeningTag(Ctx: TokenizerContext) {
   const Start = Ctx.Cursor.Clone();

   // Consume <
   Ctx.Cursor.Advance();

   const TagStart = Ctx.Cursor.Clone();

   while (!Ctx.Cursor.Eof) {
      const Code = Ctx.Cursor.Peek();

      if (
         Is.Whitespace(Code) ||
         Code === Char.GreaterThan ||
         Code === Char.Slash
      ) {
         break;
      }

      Ctx.Cursor.Advance();
   }

   if (Ctx.Cursor.Position === TagStart.Position) {
      Ctx.Diagnostics.push({
         Start: Start.Position,
         End: Ctx.Cursor.Position,
         Message: "Expected tag name",
         Code: DiagnosticCode.ExpectedTagName,
         Severity: DiagnosticSeverity.Error,
      });

      Ctx.Cursor.AdvanceTo(Ctx.Cursor.Position + 1);
      return;
   }


   Ctx.Tokens.push({
      Kind: SyntaxKind.LessThan,
      Start: Start.Position,
      End: TagStart.Position,
      Value: "<",
   });


   Ctx.Tokens.push({
      Kind: SyntaxKind.TagName,
      Start: TagStart.Position,
      End: Ctx.Cursor.Position,
      Value: Ctx.Cursor.GetChars(TagStart),
   });

}