export enum FrameKind {
  Js,
  String,
  Template,
  LineComment,
  BlockComment,
}

export interface BaseFrame {
  kind: FrameKind;
  start: number;
}

export interface JsFrame extends BaseFrame {
  kind: FrameKind.Js;
  depth: number;
}

export interface StringFrame extends BaseFrame {
  kind: FrameKind.String;
  quote: number;
}

export interface TemplateFrame extends BaseFrame {
  kind: FrameKind.Template;
}

export interface LineCommentFrame extends BaseFrame {
  kind: FrameKind.LineComment;
}

export interface BlockCommentFrame extends BaseFrame {
  kind: FrameKind.BlockComment;
}

export type ResolverFrame =
  | JsFrame
  | StringFrame
  | TemplateFrame
  | LineCommentFrame
  | BlockCommentFrame;

export enum JsExpressionIssueKind {
  UnterminatedString = "UnterminatedString",
  UnterminatedTemplate = "UnterminatedTemplate",
  UnterminatedBlockComment = "UnterminatedBlockComment",
  UnterminatedExpression = "UnterminatedExpression",
  TagLike = "TagLike",
}

export type JsExpressionIssue = {
  kind: JsExpressionIssueKind;
  start: number;
  end: number;
};

export type JsExpressionResolution = {
  status: "closed" | "unterminated";
  end: number;
  issues: Array<JsExpressionIssue>;
};
