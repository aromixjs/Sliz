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

  ExpressionStart = "ExpressionStart",
  Expression = "Expression",
  ExpressionEnd = "ExpressionEnd",

  HtmlComment = "HtmlComment",

  Text = "Text",

  Unknown = "Unknown",
  EndOfFile = "EndOfFile",
}

export enum State {
  Text = "Text",
  Expression = "Expression",

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
  readonly cursor: number;
  readonly state: State;
  readonly tagStack: Array<string>;
}
export interface MatchResult {
  token: Token;
  nextCursor: number;
  nextState: State;
}

export type Matcher = (ctx: TokenizerContext) => Maybe<MatchResult>;
