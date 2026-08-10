import { DiagnosticCode, DiagnosticSeverity } from "../../Pipeline/Context";
import Skip from "../../Scanner/Skip";
import { SyntaxKind, TokenizerContext } from "../Token";

export function ConsumeExpression(Ctx: TokenizerContext) {
   const Start = Ctx.Cursor.Clone();
   // Consume { 
   Ctx.Cursor.Advance();

   const ExpressionStart = Ctx.Cursor.Clone()
   const End = Skip.BraceExpression(Ctx.Cursor.Source, Start.Position)

   if (End === -1) {
      Ctx.Diagnostics.push({
         Start: Start.Position,
         End: Ctx.Cursor.Source.length,
         Message: "Unterminated expression",
         Code: DiagnosticCode.UnterminatedExpression,
         Severity: DiagnosticSeverity.Error,
      });

      Ctx.Tokens.push({
         Kind: SyntaxKind.OpenBrace,
         Start: Start.Position,
         End: Start.Position + 1,
         Value: "{",
      });

      Ctx.Tokens.push({
         Kind: SyntaxKind.JsExpression,
         Start: ExpressionStart.Position,
         End: Ctx.Cursor.Source.length,
         Value: Ctx.Cursor.GetChars(ExpressionStart),
      });

      Ctx.Cursor.AdvanceToEnd();
      return;
   }


   const CloseBrace = End - 1;
   Ctx.Tokens.push({
      Kind: SyntaxKind.OpenBrace,
      Start: Start.Position,
      End: Start.Position + 1,
      Value: "{",
   });

   Ctx.Tokens.push({
      Kind: SyntaxKind.JsExpression,
      Start: ExpressionStart.Position,
      End: CloseBrace,
      Value: Ctx.Cursor.Source.slice(
         ExpressionStart.Position,
         CloseBrace,
      ),
   });
   Ctx.Tokens.push({
      Kind: SyntaxKind.CloseBrace,
      Start: CloseBrace,
      End,
      Value: "}",
   });
   Ctx.Cursor.AdvanceTo(End);
}

