import * as htmlParser from "htmlparser2";
import { ElementNode, Node } from "./types";

export class Parser {
  private stack: ElementNode[] = [];
  private root: Node[] = [];

  private htmlParser: htmlParser.Parser;

  constructor() {
    this.htmlParser = this.createHtmlParser();
  }

  private createHtmlParser() {
    return new htmlParser.Parser({
      onopentag: (name, attributes) => {
        const node: ElementNode = {
          type: "element",
          tag: name,
          attributes,
          children: [],
        };

        const parent = this.stack.at(-1);

        if (parent) {
          parent.children.push(node);
        } else {
          this.root.push(node);
        }

        this.stack.push(node);
      },
      ontext: (text) => {
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
  }

  reset() {
    this.stack = [];
    this.root = [];
    this.htmlParser = this.createHtmlParser();
  }

  write(content: string) {
    this.htmlParser.write(content);
  }

  end() {
    this.htmlParser.end();
    return this.root;
  }
}
