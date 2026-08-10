import { DiagnosticCode, DiagnosticSeverity } from "../../Pipeline/Context";
import skip from "../../Scanner/Skip";
import { SyntaxKind, TokenizerContext } from "../Token";

export function consumeExpression(ctx: TokenizerContext) {
  const start = ctx.cursor.clone();
  ctx.cursor.advance();

  const expressionStart = ctx.cursor.clone();
  const end = skip.braceExpression(ctx.cursor.source, start.position);

  if (end === -1) {
    ctx.diagnostics.push({
      start: start.position,
      end: ctx.cursor.source.length,
      message: "Unterminated expression",
      code: DiagnosticCode.UnterminatedExpression,
      severity: DiagnosticSeverity.Error,
    });

    ctx.tokens.push({
      kind: SyntaxKind.OpenBrace,
      start: start.position,
      end: start.position + 1,
      value: "{",
    });

    ctx.tokens.push({
      kind: SyntaxKind.JsExpression,
      start: expressionStart.position,
      end: ctx.cursor.source.length,
      value: ctx.cursor.getChars(expressionStart),
    });

    ctx.cursor.advanceToEnd();
    return;
  }

  const closeBrace = end - 1;
  ctx.tokens.push({
    kind: SyntaxKind.OpenBrace,
    start: start.position,
    end: start.position + 1,
    value: "{",
  });

  ctx.tokens.push({
    kind: SyntaxKind.JsExpression,
    start: expressionStart.position,
    end: closeBrace,
    value: ctx.cursor.source.slice(expressionStart.position, closeBrace),
  });

  ctx.tokens.push({
    kind: SyntaxKind.CloseBrace,
    start: closeBrace,
    end,
    value: "}",
  });

  ctx.cursor.advanceTo(end);
}
