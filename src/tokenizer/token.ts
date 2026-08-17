export enum TokenType {
  HtmlCommentStart = "HtmlCommentStart",
  HtmlCommentEnd = "HtmlCommentEnd",
  HtmlCommentContent = "HtmlCommentContent",
  UnterminatedHtmlComment = "UnterminatedHtmlComment",
  DoctypeStart = "DoctypeStart",
  AttributeName = "AttributeName",
  Equals = "Equals",
  QuotedAttributeValue = "QuotedAttributeValue",
  UnterminatedQuotedAttributeValue = "UnterminatedQuotedAttributeValue",
  UnQuotedAttributeValue = "UnQuotedAttributeValue",
  TagStart = "TagStart",
  TagEnd = "TagEnd",

  JsExpression = "JsExpression",
  UnterminatedJsString = "UnterminatedJsString",
  UnterminatedTemplateLiteral = "UnterminatedTemplateLiteral",
  UnterminatedBlockComment = "UnterminatedBlockComment",
  UnterminatedJsExpression = "UnterminatedJsExpression",
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
export interface AttributeNameToken extends BaseToken {
  type: TokenType.AttributeName;
  content: string;
}

export interface EqualsToken extends BaseToken {
  type: TokenType.Equals;
}

export interface QuotedAttributeValueToken extends BaseToken {
  type: TokenType.QuotedAttributeValue;
  content: string;
}

export interface UnterminatedQuotedAttributeValueToken extends BaseToken {
  type: TokenType.UnterminatedQuotedAttributeValue;
}

export interface UnQuotedAttributeValueToken extends BaseToken {
  type: TokenType.UnQuotedAttributeValue;
  content: string;
}

export interface JsExpressionToken extends BaseToken {
  type: TokenType.JsExpression;
  content: string;
}

export interface UnterminatedJsStringToken extends BaseToken {
  type: TokenType.UnterminatedJsString;
}

export interface UnterminatedTemplateLiteralToken extends BaseToken {
  type: TokenType.UnterminatedTemplateLiteral;
}

export interface UnterminatedBlockCommentToken extends BaseToken {
  type: TokenType.UnterminatedBlockComment;
}

export interface UnterminatedJsExpressionToken extends BaseToken {
  type: TokenType.UnterminatedJsExpression;
}

export interface TagStartToken extends BaseToken {
  type: TokenType.TagStart;
  content: string;
}

export interface TagEndToken extends BaseToken {
  type: TokenType.TagEnd;
}

export type Token =
  | HtmlCommentStartToken
  | HtmlCommentEndToken
  | HtmlCommentContentToken
  | UnterminatedHtmlComment
  | DoctypeStartToken
  | AttributeNameToken
  | EqualsToken
  | QuotedAttributeValueToken
  | UnterminatedQuotedAttributeValueToken
  | UnQuotedAttributeValueToken
  | JsExpressionToken
  | UnterminatedJsStringToken
  | UnterminatedTemplateLiteralToken
  | UnterminatedBlockCommentToken
  | UnterminatedJsExpressionToken
  | TagStartToken
  | TagEndToken;
