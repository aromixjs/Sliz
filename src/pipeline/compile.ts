import { ExtractedExpression } from "../preprocessor/types";
import { SyntaxKind } from "../tokenizer/token";
import { tokenize } from "../tokenizer/tokenize";
import * as preprocess from "./../preprocessor/preprocess";
import { CompilerContext } from "./context";

export function compile(context: CompilerContext) {
  const tokens = tokenize(context);

  let placeholderStart = 0;
  const expressions = new Map<number, ExtractedExpression>();
  const processedHtml = [];
  for (const token of tokens) {
    if (token.kind !== SyntaxKind.Html) {
      continue;
    }

    const result = preprocess.expressions({
      diagnostics: context.diagnostics,
      source: token.value!,
      start: token.start,
      placeholderStart,
    });

    placeholderStart = result.nextPlaceholder;
    for (const [id, expression] of result.expressions) {
      expressions.set(id, expression);
    }

    processedHtml.push(result.content);
  }

  return { tokens, expressions, processedHtml };
}
