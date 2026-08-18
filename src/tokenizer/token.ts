export enum TokenType {
  /*=== Html Comment ===*/
  HtmlCommentStart = "HtmlCommentStart",
  HtmlCommentEnd = "HtmlCommentEnd",
  HtmlCommentContent = "HtmlCommentContent",
  UnterminatedHtmlComment = "UnterminatedHtmlComment",
  /*=== Html Tags ===*/
  DoctypeStart = "DoctypeStart",
  AttributeName = "AttributeName",
  Equals = "Equals",
  QuotedAttributeValue = "QuotedAttributeValue",
  UnterminatedQuotedAttributeValue = "UnterminatedQuotedAttributeValue",
  UnQuotedAttributeValue = "UnQuotedAttributeValue",
  TagStart = "TagStart",
  TagEnd = "TagEnd",
  /*=== Js Expression ===*/
  JsExpression = "JsExpression",
  UnterminatedJsLiteral = "UnterminatedJsLiteral",
  UnterminatedJsExpression = "UnterminatedJsExpression",
  /*=== Text ===*/
  Text = "Text",
}

/*===== Tokens =====*/
export interface BaseToken {
  type: TokenType;
  start: number;
  end: number;
}
/*=== Html Comment Tokens  ===*/
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

/*=== Html Tag Tokens ===*/
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

export interface TagStartToken extends BaseToken {
  type: TokenType.TagStart;
  content: string;
}

export interface TagEndToken extends BaseToken {
  type: TokenType.TagEnd;
}

/*=== Js Expression ===*/
export interface JsExpressionToken extends BaseToken {
  type: TokenType.JsExpression;
  content: string;
}

export interface UnterminatedJsExpressionToken extends BaseToken {
  type: TokenType.UnterminatedJsExpression;
}

export interface UnterminatedJsLiteralToken extends BaseToken {
  type: TokenType.UnterminatedJsLiteral;
}

/*=== Text ===*/

export interface TextToken extends BaseToken {
  type: TokenType.Text;
  content: string;
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
  | UnterminatedJsExpressionToken
  | UnterminatedJsLiteralToken
  | TagStartToken
  | TagEndToken
  | TextToken;
