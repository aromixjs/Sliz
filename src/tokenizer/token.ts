import { type Maybe } from "../types/maybe";

export enum SyntaxKind {
  LessThan = "LessThan",
  LessThanSlash = "LessThanSlash",
  TagName = "TagName",
  AttributeName = "AttributeName",
  Equals = "Equals",

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
}
export interface MatchResult {
  token: Token;
  nextCursor: number;
  nextState: State;
}

export type Matcher = (ctx: TokenizerContext) => Maybe<MatchResult>;
