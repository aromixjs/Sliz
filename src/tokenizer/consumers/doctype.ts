import { DiagnosticCode, DiagnosticSeverity } from "../../pipeline/context";
import char from "../../scanner/char";
import { SyntaxKind, TokenizerContext } from "../token";

export function consumeDoctype(ctx: TokenizerContext) {
  const start = ctx.cursor.clone();

  while (!ctx.cursor.eof) {
    if (ctx.cursor.peek() === char.greaterThan) {
      ctx.cursor.advance();

      ctx.tokens.push({
        kind: SyntaxKind.Doctype,
        start: start.position,
        end: ctx.cursor.position,
        value: ctx.cursor.getChars(start),
      });

      break;
    }

    ctx.cursor.advance();
  }

  ctx.diagnostics.push({
    start: start.position,
    end: ctx.cursor.source.length,
    message: "Unterminated doctype",
    code: DiagnosticCode.UnterminatedDoctype,
    severity: DiagnosticSeverity.Error,
  });

  ctx.tokens.push({
    kind: SyntaxKind.Doctype,
    start: start.position,
    end: ctx.cursor.source.length,
    value: ctx.cursor.getChars(start),
  });

  ctx.cursor.advanceToEnd();
}
