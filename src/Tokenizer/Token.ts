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
  kind: SyntaxKind;
  start: number;
  end: number;
  value: Maybe<string>;
}

// Matcher Types
export interface TokenizerContext {
  readonly cursor: CharacterCursor;
  readonly tokens: Array<Token>,
  readonly diagnostics: Array<Diagnostic>
}

export type Matcher = (Ctx: TokenizerContext) => void;
