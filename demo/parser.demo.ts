import { Parser } from "../lib/parser/parser";
import { Node } from "../lib/parser/types";

function printTree(nodes: Node[], indent = "") {
  for (const node of nodes) {
    if (node.type === "text") {
      console.log(`${indent}#text ${JSON.stringify(node.value)}`);
    } else {
      const attrs = Object.entries(node.attributes)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join("");
      console.log(`${indent}<${node.tag}${attrs}>`);
      printTree(node.children, indent + "  ");
      console.log(`${indent}</${node.tag}>`);
    }
  }
}

const source = `<server>
const user = await getUser();
const items = await fetchItems();
</server>
<header class="top">
  <img src="/logo.png" alt="logo"/>
  <h1 .when={user}>Welcome {user.name}</h1>
</header>
<ul .for="{item in items}">
  <li .when={item.active} @click="{select(item)}">{item.title}</li>
</ul>
<footer>Made with &lt;3</footer>`;

console.log("Parsing this view:\n");
console.log(source);

console.log("\nResulting AST:\n");
const parser = new Parser();
parser.write(source);
printTree(parser.end());

console.log("\nReusing the parser after reset():\n");
parser.reset();
parser.write("<p>second parse</p>");
printTree(parser.end());
