import { DiagnosticCode, DiagnosticSeverity } from "../../pipeline/context";
import { skip } from "../../scanner/skip";
import { SyntaxKind, TokenizerContext } from "../token";


/**
 * Reads a JavaScript expression enclosed in curly braces like `{ name }` or `{ count + 1 }`.
 * 
 * **How it works:**
 * 1. Remembers where the opening `{` starts and advances past it.
 * 2. Uses `skip.braceExpression` to scan ahead and find the matching closing `}`.
 * 3. **If no closing `}` is found:** Reports an "Unterminated expression" error and grabs the rest of the file.
 * 4. **If a closing `}` is found:** Breaks the content down into three tokens:
 *    - Opening `{`
 *    - The JS expression code inside
 *    - Closing `}`
 * 
 * @param ctx The tokenizer context, which tracks cursor position, errors, and saved tokens.
 */
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
