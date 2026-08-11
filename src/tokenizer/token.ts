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
  AttributeValue = "AttributeValue",
  GreaterThan = "GreaterThan",
  SlashGreaterThan = "SlashGreaterThan",
  Script = "Script",
  Style = "Style",
  HtmlComment = "HtmlComment",
  EndOfFile = "EndOfFile",
}

export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  value: Maybe<string>;
}


export class TokenizerContext {
  readonly cursor: CharacterCursor
  readonly tokens: Array<Token>;
  readonly diagnostics: Array<Diagnostic>;

  constructor(source: string, tokens:Array<Token> = [], diagnostics:Array<Diagnostic> = []) {
    this.cursor = new CharacterCursor(source)
    this.diagnostics = diagnostics
    this.tokens = tokens
  }
}

