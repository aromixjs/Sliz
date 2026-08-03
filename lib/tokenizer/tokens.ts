export enum SyntaxKind {
  Unknown,
  EndOfFileToken,
  // SFC blocks
  ServerStartToken,   // <server>
  ServerEndToken,     // </server>
  ServerCodeToken, 
  ViewStartToken,           // <view>
  ViewEndToken,             // </view>

  OpenTagToken, // <
  CloseTagToken, // </
  TagEndToken, // >
  SelfCloseTagToken, // />
  OpenExpressionToken, // {
  CloseExpressionToken, // }
  IdentifierToken,
  AttributeNameToken,
  EqualsToken, // =
  TextToken,
  DirectiveToken, // .if, .for, etc.
  TsExpressionToken,
}
export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  value?: string;
}
