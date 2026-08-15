import { type Maybe } from "../types/maybe";
import { CharacterCursor } from "./cursor";

export enum TokenType {
  Text = "Text",
  OpenBrace = "OpenBrace",
  CloseBrace = "CloseBrace",
  CommentText = "CommentText",
  LessThan = "LessThan",

  Dollar = "Dollar",
  BackTick = "BackTick",
  Quote = "Quote",
  DoubleSlash = "DoubleSlash",
  SlashAsterisk = "SlashAsterisk",
  AsteriskSlash = "AsteriskSlash",
  UnterminatedJsString = "UnterminatedJsString",
  JsString = "JsString",
  JsExpression = "JsExpression",
  UnterminatedJsExpression = "UnterminatedJsExpression",
  UnterminatedBlockComment = "UnterminatedBlockComment",

  EndOfFile = "EndOfFile",

  //  Html Comment Tokens
  HtmlCommentStart = "HtmlCommentStart",
  HtmlCommentEnd = "HtmlCommentEnd",
  HtmlCommentContent = "HtmlCommentContent",
  UnterminatedHtmlComment = "UnterminatedHtmlComment",
}

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value: Maybe<string>;
}

export class TokenizerContext {
  readonly cursor: CharacterCursor;
  readonly tokens: Array<Token> = [];

  constructor(cursor: CharacterCursor) {
    this.cursor = cursor;
  }

  emit(token: Token): void {
    this.tokens.push(token);
  }

  emitIf(condition: boolean, token: Token) {
    if (condition) {
      this.tokens.push(token);
    }
  }
}
