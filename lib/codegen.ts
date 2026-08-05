import { ExtractedExpression } from "./expression.preprocessor";
import { TransformedNode } from "./transformer";

export function generate(nodes: TransformedNode[], expressions: Map<string, ExtractedExpression>) {

   let output = ''



   for (const node of nodes) {
      output += generateNode(node, expressions)
   }

   return output
}


function generateNode(node: TransformedNode, expressions: Map<string, ExtractedExpression>):string {

   switch (node.type) {
      case 'text':
         return emitAppend(resolveText(node.value, expressions));
         break;
      case 'element': {
         const attrs = Object.entries(node.attributes)
            .map(([k, v]) => ` ${k}="${v}"`)
            .join('');
         const open = emitAppend(`<${node.tag}${attrs}>`);
         const children = node.children.map((c) => generateNode(c, expressions)).join('');
         const close = emitAppend(`</${node.tag}>`);
         return open + children + close;
      }
      case 'conditional':
         return `if (${node.expr}) {\n${generateNode(node.consequent, expressions)}}\n`;
   }
}



// Turn a literal string into an `html += \`...\`;` line, replacing
// embedded placeholder UUIDs with real ${expr} interpolations.
function resolveText(value: string, expressions: Map<string, ExtractedExpression>): string {
   const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
   return value.replace(uuidPattern, (id) => {
      const expr = expressions.get(id);
      return expr ? `\${${expr.source}}` : id;
   });
}

function emitAppend(text: string): string {
   // backtick template literal so ${..} interpolations inside `text` work
   return `html += \`${text.replace(/`/g, '\\`')}\`;\n`;
}