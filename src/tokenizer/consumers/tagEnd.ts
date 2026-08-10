import { DiagnosticCode, DiagnosticSeverity } from "../../pipeline/context";
import char from "../../scanner/char";
import { SyntaxKind, TokenizerContext } from "../token";

export function consumeTagEnd(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();
   // Self-closing tag: />
   if (
      ctx.cursor.peek() === char.slash &&
      ctx.cursor.peek(1) === char.greaterThan
   ) {
      ctx.cursor.advance();
      ctx.cursor.advance();

      ctx.tokens.push({
         kind: SyntaxKind.GreaterThan,
         start: start.position,
         end: ctx.cursor.position,
         value: "/>",
      });

      return;
   }

   // Normal tag: >
   if (ctx.cursor.peek() === char.greaterThan) {
      ctx.cursor.advance();

      ctx.tokens.push({
         kind: SyntaxKind.GreaterThan,
         start: start.position,
         end: ctx.cursor.position,
         value: ">",
      });

      return;
   }

   ctx.diagnostics.push({
      start: start.position,
      end: ctx.cursor.position,
      message: "Expected '>'",
      code: DiagnosticCode.ExpectedTagEnd,
      severity: DiagnosticSeverity.Error,
   });

}