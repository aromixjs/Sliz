export enum TokenType {
  HtmlCommentStart = "HtmlCommentStart",
  HtmlCommentEnd = "HtmlCommentEnd",
  HtmlCommentContent = "HtmlCommentContent",
  UnterminatedHtmlComment = "UnterminatedHtmlComment",
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

export type Token =
  | HtmlCommentStartToken
  | HtmlCommentEndToken
  | HtmlCommentContentToken
  | UnterminatedHtmlComment;
