import { Node } from "../Parser/Parse";
import {
  ExtractedExpression,
  PreProcessError,
  PreProcessResult,
} from "./Types";

export type TransformedNode = TextNode | ElementNode | ConditionalNode;

interface TextNode {
  type: "text";
  value: string;
}

interface ElementNode {
  type: "element";
  tag: string;
  attributes: Record<string, string>;
  children: TransformedNode[];
}

interface ConditionalNode {
  type: "conditional";
  expr: string;
  consequent: TransformedNode;
}

export interface TransformResult {
  ast: TransformedNode[];
  errors: PreProcessError[];
}

export function Transform(HtmlAst: Node[], Results: PreProcessResult[]) {
  const Expressions = new Map<string, ExtractedExpression>();
  const Errors: PreProcessError[] = [];

  for (const Result of Results) {
    for (const [Id, Expr] of Result.expressions) {
      Expressions.set(Id, Expr);
    }
    Errors.push(...Result.errors);
  }

  const Ast = HtmlAst.map((Node) => TransformNode(Node, Expressions, Errors));
  return { ast: Ast, errors: Errors };
}

function TransformNode(
  Node: Node,
  Expressions: Map<string, ExtractedExpression>,
  Errors: PreProcessError[],
): TransformedNode {
  console.log(Node);

  if (Node.type === "text") {
    return Node;
  }

  const { ".when": WhenId, ...Rest } = Node.attributes;
  const Children = Node.children.map((C) =>
    TransformNode(C, Expressions, Errors)
  );

  let Current: TransformedNode = {
    type: "element",
    tag: Node.tag,
    attributes: Rest,
    children: Children,
  };

  if (WhenId) {
    const Expr = Expressions.get(WhenId);
    if (!Expr) {
      Errors.push({ message: `Unresolved .when expression`, start: 0 });
    } else {
      Current = { type: "conditional", expr: Expr.source, consequent: Current };
    }
  }

  return Current;
}
