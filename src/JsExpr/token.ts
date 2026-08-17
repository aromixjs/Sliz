export enum JsTokenType {
  ExpressionStart = "ExpressionStart",
  ExpressionEnd = "ExpressionEnd",
  RawJs = "RawJs",
  StringLiteral = "StringLiteral",
  TemplateLiteral = "TemplateLiteral",
  LineComment = "LineComment",
  BlockComment = "BlockComment",
  UnterminatedString = "UnterminatedString",
  UnterminatedTemplateLiteral = "UnterminatedTemplateLiteral",
  UnterminatedBlockComment = "UnterminatedBlockComment",
  UnterminatedExpression = "UnterminatedExpression",
  TagLike = "TagLike",
}

export interface BaseJsToken {
  type: JsTokenType;
  start: number;
  end: number;
}

export interface ExpressionStartToken extends BaseJsToken {
  type: JsTokenType.ExpressionStart;
}

export interface ExpressionEndToken extends BaseJsToken {
  type: JsTokenType.ExpressionEnd;
}

export interface StringLiteralToken extends BaseJsToken {
  type: JsTokenType.StringLiteral;
  content: string;
}

export interface TemplateLiteralToken extends BaseJsToken {
  type: JsTokenType.TemplateLiteral;
  content: string;
}

export interface LineCommentToken extends BaseJsToken {
  type: JsTokenType.LineComment;
  content: string;
}

export interface BlockCommentToken extends BaseJsToken {
  type: JsTokenType.BlockComment;
  content: string;
}

export interface UnterminatedStringToken extends BaseJsToken {
  type: JsTokenType.UnterminatedString;
   content: string;
}

export interface UnterminatedTemplateLiteralToken extends BaseJsToken {
  type: JsTokenType.UnterminatedTemplateLiteral;
   content: string;
}

export interface UnterminatedBlockCommentToken extends BaseJsToken {
  type: JsTokenType.UnterminatedBlockComment;
   content: string;
}

export interface UnterminatedExpressionToken extends BaseJsToken {
  type: JsTokenType.UnterminatedExpression;
}
export interface TagLikeToken extends BaseJsToken {
  type: JsTokenType.TagLike;
}
export interface RawJsToken extends BaseJsToken {
  type: JsTokenType.RawJs;
  content: string;
}



export type JsToken =
  | ExpressionStartToken
  | ExpressionEndToken
  | StringLiteralToken
  | TemplateLiteralToken
  | LineCommentToken
  | BlockCommentToken
  | UnterminatedStringToken
  | UnterminatedTemplateLiteralToken
  | UnterminatedBlockCommentToken
  | UnterminatedExpressionToken
  | TagLikeToken | RawJsToken;
