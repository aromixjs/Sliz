import { Parser } from "htmlparser2";
import { ElementNode, HtmlAstParser, Node } from "./Types";

export function Parse(): HtmlAstParser {
  let Stack: ElementNode[] = [];
  let Root: Node[] = [];

  const PushNode = (Node: Node) => {
    const Parent = Stack.at(-1);
    if (Parent) {
      Parent.children.push(Node);
    } else {
      Root.push(Node);
    }
  };

  const HtmlParser = new Parser({
    onopentag: (Name, Attributes) => {
      const Node: ElementNode = {
        type: "element",
        tag: Name,
        attributes: Attributes,
        children: [],
      };
      PushNode(Node);
      Stack.push(Node);
    },
    onclosetag: () => {
      Stack.pop();
    },
    ontext: (Text) => {
      if (Text.length === 0) return;
      PushNode({ type: "text", value: Text });
    },
    oncomment(Data) {
      PushNode({ type: "comment", value: Data });
    },
    onprocessinginstruction(Name, Data) {
      if (Name.toLowerCase() === "!doctype") {
        PushNode({ type: "doctype", value: Data });
      }
    },
  }, {
    decodeEntities: true,
    lowerCaseTags: true,
    lowerCaseAttributeNames: true,
    xmlMode: false,
  });

  return {
    write(Chunk: string) {
      HtmlParser.write(Chunk);
    },
    end(): Node[] {
      HtmlParser.end();
      return Root;
    },
    reset() {
      Stack = [];
      Root = [];
      HtmlParser.reset();
    },
  };
}
