import * as htmlParser from "htmlparser2";
import { ElementNode, Node } from "./types";

export class Parser {
  private readonly stack: ElementNode[] = [];
  private root: Node[] = [];

  private htmlParser = new htmlParser.Parser({
    onopentag: (name, attributes) => {
      const node: ElementNode = {
        type: "element",
        tag: name,
        attributes,
        children: [],
      };

      // attach to parent
      const parent = this.stack.at(-1);

      if (parent) {
        parent.children.push(node);
      } else {
        this.root.push(node);
      }

      // current element
      this.stack.push(node);
    },
    ontext: (text) => {
      // ignore whitespace only
      if (!text.trim()) return;

      const parent = this.stack.at(-1);
      if (!parent) return;

      parent.children.push({
        type: "text",
        value: text,
      });
    },

    onclosetag: () => {
      this.stack.pop();
    },
  });

  write(content: string) {
    this.htmlParser.write(content);
  }

  end() {
    this.htmlParser.end();
    return this.root;
  }
}
