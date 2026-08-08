export type Node = ElementNode | TextNode | CommentNode | DoctypeNode;

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

export interface CommentNode {
   type: "comment";
   value: string;
}

export interface DoctypeNode {
   type: "doctype";
   value: string;
}

export const isElement = (node: Node): node is ElementNode =>
   node.type === "element";

export const isText = (node: Node): node is TextNode => node.type === "text";

export const isComment = (node: Node): node is CommentNode =>
   node.type === "comment";

export const isDoctype = (node: Node): node is DoctypeNode =>
   node.type === "doctype";


export interface HtmlAstParser {
   write(chunk: string): void;
   end(): Node[];
   reset(): void;
}