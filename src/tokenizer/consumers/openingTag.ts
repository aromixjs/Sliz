import { DiagnosticCode, DiagnosticSeverity } from "../../pipeline/context";
import char from "../../scanner/char";
import is from "../../scanner/is";
import { SyntaxKind, TokenizerContext } from "../token";

export function consumeOpeningTag(ctx: TokenizerContext) {
  const start = ctx.cursor.clone();

  ctx.cursor.advance();

  const tagStart = ctx.cursor.clone();

  while (!ctx.cursor.eof) {
    const code = ctx.cursor.peek();

    if (
      is.whitespace(code) ||
      code === char.greaterThan ||
      code === char.slash
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
    end: tagStart.position,
    value: "<",
  });

  ctx.tokens.push({
    kind: SyntaxKind.TagName,
    start: tagStart.position,
    end: ctx.cursor.position,
    value: ctx.cursor.getChars(tagStart),
  });
}
