import { DiagnosticCode, DiagnosticSeverity } from "../../pipeline/context";
import char from "../../scanner/char";
import { SyntaxKind, TokenizerContext } from "../token";

/**
 * Reads an entire `<!DOCTYPE ...>` declaration until it finds the closing `>` character.
 * 
 * **How it works:**
 * 1. Remembers where the declaration starts.
 * 2. Advances character by character looking for the closing `>`:
 *    - **If found:** Saves a `Doctype` token and stops.
 * 3. **If `>` is never found (file ends early):** Adds an "Unterminated doctype" error message to `diagnostics`, saves whatever content was read as a `Doctype` token, and moves the cursor to the end of the file.
 * 
 * @param ctx The tokenizer context holding the cursor, error diagnostics, and token list.
 */
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
