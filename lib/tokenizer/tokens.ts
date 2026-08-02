export enum SyntaxKind {
  Unknown,
  EndOfFileToken,
  TsCodeToken,
  TemplateStartToken, // ~T"
  TemplateEndToken, // "T~
  OpenTagToken, // <
  CloseTagToken, // </
  TagEndToken, // >
  SelfCloseTagToken, // />
  OpenExpressionToken, // {
  CloseExpressionToken, // }
  DirectiveToken, // .if, .for, etc.
  EqualsToken, // =
  IdentifierToken,
  TextToken,
  TsExpressionToken,
}
export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  value?: string;
}
