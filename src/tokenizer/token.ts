export enum TokenType {
  HtmlCommentStart = "HtmlCommentStart",
  HtmlCommentEnd = "HtmlCommentEnd",
  HtmlCommentContent = "HtmlCommentContent",
  UnterminatedHtmlComment = "UnterminatedHtmlComment",
  DoctypeStart = "DoctypeStart",
  WhiteSpace = "WhiteSpace",
  AttributeName = "AttributeName",
}

export interface BaseToken {
  type: TokenType;
  start: number;
  end: number;
}

export interface HtmlCommentStartToken extends BaseToken {
  type: TokenType.HtmlCommentStart;
}

export interface HtmlCommentEndToken extends BaseToken {
  type: TokenType.HtmlCommentEnd;
}
export interface HtmlCommentContentToken extends BaseToken {
  type: TokenType.HtmlCommentContent;
  content: string;
}

export interface UnterminatedHtmlComment extends BaseToken {
  type: TokenType.UnterminatedHtmlComment;
}
export interface DoctypeStartToken extends BaseToken {
  type: TokenType.DoctypeStart;
}
export interface WhiteSpaceToken extends BaseToken {
  type: TokenType.WhiteSpace;
}
export interface AttributeName extends BaseToken {
  type: TokenType.AttributeName;
  content: string;
}

export type Token =
  | HtmlCommentStartToken
  | HtmlCommentEndToken
  | HtmlCommentContentToken
  | UnterminatedHtmlComment
  | DoctypeStartToken
  | WhiteSpaceToken
  | AttributeName;
