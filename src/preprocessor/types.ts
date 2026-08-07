import { Diagnostic } from "../pipeline/context";

export interface ExtractedExpression {
  id: number;
  source: string;
  start: number;
  end: number;
}

export interface ExpressionPreprocessOutput {
  content: string;
  expressions: Map<number, ExtractedExpression>;
  nextPlaceholder: number;
}

export interface ExpressionPreprocessInput {
  diagnostics: Array<Diagnostic>;
  source: string;
  start: number;
  placeholderStart: number;
}
