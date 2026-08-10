import { Diagnostic } from "../pipeline/context";
import { type Maybe } from "../types/maybe";
import { CharacterCursor } from "./cursor";

export enum SyntaxKind {
  Doctype = "Doctype",
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

export interface TokenizerContext {
  readonly cursor: CharacterCursor;
  readonly tokens: Array<Token>;
  readonly diagnostics: Array<Diagnostic>;
}
