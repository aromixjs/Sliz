export enum SyntaxKind {
  Unknown = "Unknown",
  EndOfFileToken = "EndOfFileToken",

  // SFC
  ServerStartToken = "ServerStartToken",
  ServerEndToken = "ServerEndToken",
  ServerCodeToken = "ServerCodeToken",
  ViewStartToken = "ViewStartToken",
  ViewEndToken = "ViewEndToken",

  // HTML
  OpenTagToken = "OpenTagToken",
  CloseTagToken = "CloseTagToken",
  TagEndToken = "TagEndToken",
  SelfCloseTagToken = "SelfCloseTagToken",

  IdentifierToken = "IdentifierToken",
  AttributeNameToken = "AttributeNameToken",
  EqualsToken = "EqualsToken",

  // Expressions
  OpenExpressionToken = "OpenExpressionToken",
  CloseExpressionToken = "CloseExpressionToken",
  TsExpressionToken = "TsExpressionToken",

  // directives
  DotToken = "DotToken",

  // content
  TextToken = "TextToken",
}

export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  value?: string;
}
