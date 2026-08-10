import { DiagnosticCode, DiagnosticSeverity } from "../../pipeline/context";
import char from "../../scanner/char";
import { is } from "../../scanner/is";
import { skip } from "../../scanner/skip";
import { SyntaxKind, TokenizerContext } from "../token";
import { consumeTagEnd } from "./tagEnd";

export function consumeClosingTag(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   // Consume </
   ctx.cursor.advance();
   ctx.cursor.advance();


   const tagStart = ctx.cursor.clone();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (
         is.whitespace(code) ||
         code === char.greaterThan
      ) {
         break;
      }

      ctx.cursor.advance();
   }

   if (ctx.cursor.position === tagStart.position) {
      ctx.diagnostics.push({
         start: start.position,
         end: ctx.cursor.position,
         message: "Expected tag name",
         code: DiagnosticCode.ExpectedTagName,
         severity: DiagnosticSeverity.Error,
      });

      ctx.cursor.advanceTo(ctx.cursor.position + 1);
      return;
   }


   ctx.tokens.push({
      kind: SyntaxKind.LessThan,
      start: start.position,
      end: start.position + 1,
      value: "<",
   });

   ctx.tokens.push({
      kind: SyntaxKind.Slash,
      start: start.position + 1,
      end: start.position + 2,
      value: "/",
   });

   ctx.tokens.push({
      kind: SyntaxKind.TagName,
      start: tagStart.position,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(tagStart),
   });
   skip.whiteSpace(ctx.cursor);
   consumeTagEnd(ctx);
}
