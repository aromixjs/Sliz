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
