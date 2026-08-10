import { Parser } from "htmlparser2";
import { ElementNode, HtmlAstParser, Node } from "./Types";

export function parse(): HtmlAstParser {
  let stack: ElementNode[] = [];
  let root: Node[] = [];

  const pushNode = (node: Node) => {
    const parent = stack.at(-1);
    if (parent) {
      parent.children.push(node);
    } else {
      root.push(node);
    }
  };

  const htmlParser = new Parser({
    onopentag: (name, attributes) => {
      const node: ElementNode = {
        type: "element",
        tag: name,
        attributes,
        children: [],
      };
      pushNode(node);
      stack.push(node);
    },
    onclosetag: () => {
      stack.pop();
    },
    ontext: (text) => {
      if (text.length === 0) return;
      pushNode({ type: "text", value: text });
    },
    oncomment(data) {
      pushNode({ type: "comment", value: data });
    },
    onprocessinginstruction(name, data) {
      if (name.toLowerCase() === "!doctype") {
        pushNode({ type: "doctype", value: data });
      }
    },
  }, {
    decodeEntities: true,
    lowerCaseTags: true,
    lowerCaseAttributeNames: true,
    xmlMode: false,
  });

  return {
    write(chunk: string) {
      htmlParser.write(chunk);
    },
    end(): Node[] {
      htmlParser.end();
      return root;
    },
    reset() {
      stack = [];
      root = [];
      htmlParser.reset();
    },
  };
}
