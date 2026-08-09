import { type Maybe } from "../types/maybe";

export enum SyntaxKind {
  LessThan = "LessThan",
  LessThanSlash = "LessThanSlash",

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

export enum State {
  Text = "Text",

  BeforeOpeningTagName = "BeforeOpeningTagName",
  BeforeClosingTagName = "BeforeClosingTagName",

  AfterOpeningTagName = "AfterOpeningTagName",
  AfterClosingTagName = "AfterClosingTagName",

  AfterAttributeName = "AfterAttributeName",
  BeforeAttributeValue = "BeforeAttributeValue",
  AfterAttributeValue = "AfterAttributeValue",

  ServerScript = "ServerScript",
  ClientScript = "ClientScript",
  Style = "Style",
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
  readonly tagStack: Array<string>;
  readonly tokens: Array<Token>
}

export type Matcher = (ctx: TokenizerContext) => void;
