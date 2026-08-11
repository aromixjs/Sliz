import { type Maybe } from "../types/maybe";
import { CharacterCursor } from "./cursor";

export enum SyntaxKind {
  // Structural tokens
  Doctype = "Doctype",
  Text = "Text",
  Whitespace = "Whitespace",
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
   Equals = "Equals",
  Script = "Script",
  Style = "Style",
  HtmlComment = "HtmlComment",
  EndOfFile = "EndOfFile",

  // Error tokens — malformed content that was still lexed
  UnterminatedString = "UnterminatedString",
  UnterminatedComment = "UnterminatedComment",
  UnterminatedExpression = "UnterminatedExpression",
  UnterminatedScript = "UnterminatedScript",
  UnterminatedStyle = "UnterminatedStyle",
  UnterminatedDoctype = "UnterminatedDoctype",
   ExpectedTagName = "ExpectedTagName",
   ExpectedTagEnd = "ExpectedTagEnd",
   UnexpectedCharacter = "UnexpectedCharacter",
}

export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  value?: string;
}

export class TokenizerContext {
  readonly cursor: CharacterCursor
  readonly tokens: Array<Token>;

  constructor(source: string, tokens:Array<Token> = []) {
    this.cursor = new CharacterCursor(source)
    this.tokens = tokens
  }

  emit(token: Token): void {
    this.tokens.push(token);
  }
}
