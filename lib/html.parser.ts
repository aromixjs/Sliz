import { Parser } from "htmlparser2";


export type Node =
  | ElementNode
  | TextNode;

export interface ElementNode {
  type: "element";
  tag: string;
  attributes: Record<string, string>;
  children: Node[];
}

export interface TextNode {
  type: "text";
  value: string;
}




export function parseHtml() {
  const stack: ElementNode[] = []
  const root: Node[] = []
  const htmlParser = new Parser({
    onopentag: (name, attributes) => {
      const node: ElementNode = {
        type: "element",
        tag: name,
        attributes,
        children: [],
      };

      const parent = stack.at(-1);

      if (parent) {
        parent.children.push(node);
      } else {
        root.push(node);
      }

      stack.push(node);
    },
    ontext: (text) => {
      if (!text.trim()) return;

      const parent = stack.at(-1);
      if (!parent) return;

      parent.children.push({
        type: "text",
        value: text,
      });
    },

    onclosetag: () => {
      stack.pop();
    },
  });



  return {
    write(content: string) {
      htmlParser.write(content);
    },

    end() {
      htmlParser.end();
      return root;
    }


  }




}