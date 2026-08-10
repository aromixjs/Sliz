import { Diagnostic } from "../Pipeline/Context";
import { type Maybe } from "../Types/Maybe";
import { CharacterCursor } from "./Cursor";

export enum SyntaxKind {
  Text = "Text",
  LessThan = "LessThan",
  Slash = "Slash",
  OpenBrace = "OpenBrace",
  JsExpression = "JsExpression",
  CloseBrace = "CloseBrace",


  TagName = "TagName",
  AttributeName = "AttributeName",
  Equals = "Equals",
  AttributeValue = "AttributeValue",

  GreaterThan = "GreaterThan",
  SlashGreaterThan = "SlashGreaterThan",

  ServerScript = "ServerScript",
  ClientScript = "ClientScript",
  Style = "Style",

  Expression = "Expression",

  HtmlComment = "HtmlComment",

  Unknown = "Unknown",
  EndOfFile = "EndOfFile",
}

export interface Token {
  Kind: SyntaxKind;
  Start: number;
  End: number;
  Value: Maybe<string>;
}

// Matcher Types
export interface TokenizerContext {
  readonly Cursor: CharacterCursor;
  readonly Tokens: Array<Token>,
  readonly Diagnostics: Array<Diagnostic>
}
