import Char from "../Scanner/Char";
import Skip from "../Scanner/Skip";
import {
    ExpressionPreprocessInput,
    ExpressionPreprocessOutput,
    ExtractedExpression,
} from "./Types";

export function Expressions(
  Input: ExpressionPreprocessInput,
): ExpressionPreprocessOutput {
  const { start, source, placeholderStart, diagnostics } = Input;

  const Expressions = new Map<number, ExtractedExpression>();
  let Position = 0;
  let Output = "";
  let Placeholder = placeholderStart;

  while (Position < source.length) {
    const Code = source.charCodeAt(Position);

    if (Code !== Char.openBrace) {
      Output += source[Position];
      Position++;
      continue;
    }

    const ExpressionStart = Position;
    const ExpressionEnd = Skip.braceExpression(
      source,
      ExpressionStart + 1,
    );

    const Unterminated =
      source.charCodeAt(ExpressionEnd - 1) !== Char.closeBrace;

    if (Unterminated) {
      diagnostics.push({
        Severity: "error",
        Code: "UNTERMINATED_EXPRESSION",
        Message: "Unterminated { expression — missing closing '}'",
        Start: start + ExpressionStart,
        End: start + ExpressionEnd,
      });

      Output += source[Position];
      Position++;
      continue;
    }

    const Id = Placeholder++;

    Expressions.set(Id, {
      id: Id,
      source: source.slice(
        ExpressionStart + 1,
        ExpressionEnd - 1,
      ),
      start: start + ExpressionStart,
      end: start + ExpressionEnd,
    });

    Output += `__expr_${Id}__`;
    Position = ExpressionEnd;
  }

  return {
    content: Output,
    expressions: Expressions,
    nextPlaceholder: Placeholder,
  };
}
