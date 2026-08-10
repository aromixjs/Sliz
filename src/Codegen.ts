import { TransformedNode } from "./Transformers/Transformer";
import { ExtractedExpression } from "./Transformers/Types";

export function Generate(
  Nodes: TransformedNode[],
  Expressions: Map<string, ExtractedExpression>,
) {
  let Output = "";

  for (const Node of Nodes) {
    Output += GenerateNode(Node, Expressions);
  }

  return Output;
}

function GenerateNode(
  Node: TransformedNode,
  Expressions: Map<string, ExtractedExpression>,
): string {
  switch (Node.type) {
    case "text":
      return EmitAppend(resolveText(Node.value, Expressions));
      break;
    case "element": {
      const Attrs = Object.entries(Node.attributes)
        .map(([k, v]) => ` ${k}="${v}"`)
        .join("");
      const Open = EmitAppend(`<${Node.tag}${Attrs}>`);
      const Children = Node.children.map((c) => GenerateNode(c, Expressions))
        .join("");
      const Close = EmitAppend(`</${Node.tag}>`);
      return Open + Children + Close;
    }
    case "conditional":
      return `if (${Node.expr}) {\n${
        GenerateNode(Node.consequent, Expressions)
      }}\n`;
  }
}

function ResolveText(
  Value: string,
  Expressions: Map<string, ExtractedExpression>,
): string {
  const UuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
  return Value.replace(UuidPattern, (Id) => {
    const Expr = Expressions.get(Id);
    return Expr ? `\${${Expr.source}}` : Id;
  });
}

function EmitAppend(Text: string): string {
  return `html += \`${Text.replace(/`/g, "\\`")}\`;\n`;
}
