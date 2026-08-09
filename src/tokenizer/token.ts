import { type Maybe } from "../types/maybe";

export enum SyntaxKind {
  LessThan = "LessThan",
  Slash = "Slash",

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

  Text = "Text",

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
  readonly source: string;
  cursor: number;
  readonly tokens: Array<Token>
}

export type Matcher = (ctx: TokenizerContext) => void;
