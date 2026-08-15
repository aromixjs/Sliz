import { type Maybe } from "../types/maybe";
import { CharacterCursor } from "./cursor";


export enum TokenType {
  Text = "Text",
  OpenBrace = "OpenBrace",
  String = "String",
  EndOfFile = "EndOfFile",

  
  // // Structural tokens
  // Doctype = "Doctype",
  // Whitespace = "Whitespace",
  // LessThan = "LessThan",
  // Slash = "Slash",
  // JsExpression = "JsExpression",
  // CloseBrace = "CloseBrace",
  // TagName = "TagName",
  // AttributeName = "AttributeName",
  // AttributeValue = "AttributeValue",
  // GreaterThan = "GreaterThan",
  // SlashGreaterThan = "SlashGreaterThan",
  // Equals = "Equals",
  // Script = "Script",
  // Style = "Style",
  // HtmlComment = "HtmlComment",

  // // Error tokens — malformed content that was still lexed
  // UnterminatedString = "UnterminatedString",
  // UnterminatedComment = "UnterminatedComment",
  // UnterminatedExpression = "UnterminatedExpression",
  // UnterminatedScript = "UnterminatedScript",
  // UnterminatedStyle = "UnterminatedStyle",
  // UnterminatedDoctype = "UnterminatedDoctype",
  // ExpectedTagName = "ExpectedTagName",
  // ExpectedTagEnd = "ExpectedTagEnd",
  // UnexpectedCharacter = "UnexpectedCharacter",
}

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value: Maybe<string>;
}

export class TokenizerContext {
  readonly cursor: CharacterCursor;
  readonly tokens: Array<Token>;

  constructor(tokens: Array<Token>, cursor: CharacterCursor) {
    this.tokens = tokens;
    this.cursor = cursor
  }

  emit(token: Token): void {
    this.tokens.push(token);
  }
}
