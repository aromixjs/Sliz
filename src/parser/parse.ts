import { Parser } from "htmlparser2";
import { ElementNode, HtmlAstParser, Node } from "./types";


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
      // Other PIs (XML declarations etc.) aren't relevant for typical HTML input.
    },
  }, {
    decodeEntities: true, // &amp; etc.
    lowerCaseTags: true, // case-insensitive
    lowerCaseAttributeNames: true,
    xmlMode: false,
  });

  return {
    write(chunk: string) {
      htmlParser.write(chunk);
    },

    // Any tags still open at EOF (e.g. a forgotten </div>) are left exactly
    // as browsers leave them: still attached to their parent/root by
    // reference, just never explicitly closed. Nothing to clean up.
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
