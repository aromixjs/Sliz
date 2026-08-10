import char from "../scanner/char";
import skip from "../scanner/skip";
import {
    ExpressionPreprocessInput,
    ExpressionPreprocessOutput,
    ExtractedExpression,
} from "./types";

export function expressions(
  input: ExpressionPreprocessInput,
): ExpressionPreprocessOutput {
  const { start, source, placeholderStart, diagnostics } = input;

  const expressions = new Map<number, ExtractedExpression>();
  let position = 0;
  let output = "";
  let placeholder = placeholderStart;

  while (position < source.length) {
    const code = source.charCodeAt(position);

    if (code !== char.openBrace) {
      output += source[position];
      position++;
      continue;
    }

    const expressionStart = position;
    const expressionEnd = skip.braceExpression(
      source,
      expressionStart + 1,
    );

    const unterminated =
      source.charCodeAt(expressionEnd - 1) !== char.closeBrace;

    if (unterminated) {
      diagnostics.push({
        Severity: "error",
        Code: "UNTERMINATED_EXPRESSION",
        Message: "Unterminated { expression — missing closing '}'",
        Start: start + expressionStart,
        End: start + expressionEnd,
      });

      // keep `{` as text and continue scanning
      output += source[position];
      position++;
      continue;
    }

    const id = placeholder++;

    expressions.set(id, {
      id,
      source: source.slice(
        expressionStart + 1,
        expressionEnd - 1,
      ),
      start: start + expressionStart,
      end: start + expressionEnd,
    });

    output += `__expr_${id}__`;
    position = expressionEnd;
  }

  return {
    content: output,
    expressions,
    nextPlaceholder: placeholder,
  };
}
